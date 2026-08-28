"use strict";

/**
 * Unit tests for src/utils/attemptStorage.js
 *
 * All localStorage interactions use an injected mock storage object so
 * no real browser globals are touched.
 */

import {
  ATTEMPT_STORAGE_KEY,
  MAX_ATTEMPTS,
  generateId,
  createAttemptRecord,
  isValidAttempt,
  loadAttempts,
  saveAttempt,
} from "./attemptStorage";

// ---------------------------------------------------------------------------
// Mock storage factory
// ---------------------------------------------------------------------------

/**
 * Returns a minimal duck-typed storage mock with getItem / setItem.
 * Pass an initial serialized value (string) or null to start empty.
 */
function makeStorage(initial = null) {
  let stored = initial;
  return {
    getItem: (_key) => stored,
    setItem: (_key, value) => {
      stored = value;
    },
    /** Helper: read back what was written */
    _read: () => stored,
    /** Helper: make setItem throw */
    _breakWrite: () => {
      stored = "BROKEN";
      Object.defineProperty({}, "setItem", {
        get() {
          throw new Error("quota");
        },
      });
    },
  };
}

/** Returns a storage where getItem() throws */
function makeThrowingReadStorage() {
  return {
    getItem: () => {
      throw new DOMException("Security error", "SecurityError");
    },
    setItem: () => {},
  };
}

/** Returns a storage where setItem() throws */
function makeThrowingWriteStorage(initial = null) {
  let stored = initial;
  return {
    getItem: () => stored,
    setItem: () => {
      throw new DOMException("QuotaExceededError", "QuotaExceededError");
    },
  };
}

// ---------------------------------------------------------------------------
// Minimal valid attempt fixture
// ---------------------------------------------------------------------------

function makeAttempt(overrides = {}) {
  return {
    id: "test-id-1",
    quizId: "ai-web-development-fundamentals",
    completedAt: "2025-01-15T14:32:00.000Z",
    overall: {
      correct: 8,
      total: 11,
      percentage: 73,
      passed: true,
    },
    categories: [
      {
        id: "web-fundamentals",
        name: "Web Fundamentals",
        correct: 3,
        total: 3,
        percentage: 100,
        level: "Strong",
      },
    ],
    ...overrides,
  };
}

/** Minimal quizResults shape returned by calculateQuizResults */
function makeQuizResults(overrides = {}) {
  return {
    totalCorrect: 8,
    totalQuestions: 11,
    overallPercentage: 73,
    categories: [
      {
        categoryId: "web-fundamentals",
        categoryName: "Web Fundamentals",
        correct: 3,
        total: 3,
        percentage: 100,
        level: "Strong",
        missedQuestionIds: [], // must be stripped
      },
      {
        categoryId: "react-state",
        categoryName: "React and State",
        correct: 2,
        total: 3,
        percentage: 67,
        level: "Developing",
        missedQuestionIds: ["q5"],
      },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. generateId
// ---------------------------------------------------------------------------

describe("generateId", () => {
  test("returns a non-empty string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  test("uses crypto.randomUUID when available", () => {
    const original = global.crypto;
    const mockUUID = jest.fn(() => "mock-uuid-1234");
    Object.defineProperty(global, "crypto", {
      value: { randomUUID: mockUUID },
      configurable: true,
    });

    const id = generateId();

    expect(mockUUID).toHaveBeenCalledTimes(1);
    expect(id).toBe("mock-uuid-1234");

    Object.defineProperty(global, "crypto", {
      value: original,
      configurable: true,
    });
  });

  test("uses fallback when crypto.randomUUID is unavailable", () => {
    const original = global.crypto;
    Object.defineProperty(global, "crypto", {
      value: {},
      configurable: true,
    });

    const id = generateId();

    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);

    Object.defineProperty(global, "crypto", {
      value: original,
      configurable: true,
    });
  });

  test("two fallback-generated IDs do not collide (controlled case)", () => {
    const original = global.crypto;
    Object.defineProperty(global, "crypto", {
      value: {},
      configurable: true,
    });

    // Spy on Math.random to return different values on successive calls
    const mockRandom = jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.12345)
      .mockReturnValueOnce(0.98765);

    const id1 = generateId();
    const id2 = generateId();

    expect(id1).not.toBe(id2);

    mockRandom.mockRestore();
    Object.defineProperty(global, "crypto", {
      value: original,
      configurable: true,
    });
  });
});

// ---------------------------------------------------------------------------
// 2. createAttemptRecord
// ---------------------------------------------------------------------------

describe("createAttemptRecord", () => {
  const fixedNow = new Date("2025-01-15T14:32:00.000Z").getTime();
  const fixedId = "fixed-attempt-id";

  test("builds a record with correct shape using injected now and id", () => {
    const result = createAttemptRecord({
      quizId: "ai-web-development-fundamentals",
      quizResults: makeQuizResults(),
      passingPercentage: 70,
      now: fixedNow,
      id: fixedId,
    });

    expect(result.id).toBe(fixedId);
    expect(result.quizId).toBe("ai-web-development-fundamentals");
    expect(result.completedAt).toBe("2025-01-15T14:32:00.000Z");
    expect(result.overall.correct).toBe(8);
    expect(result.overall.total).toBe(11);
    expect(result.overall.percentage).toBe(73);
    expect(result.overall.passed).toBe(true); // 73 >= 70
  });

  test("sets passed:false when percentage is below passing threshold", () => {
    const result = createAttemptRecord({
      quizId: "q",
      quizResults: makeQuizResults({ overallPercentage: 55 }),
      passingPercentage: 70,
      now: fixedNow,
      id: fixedId,
    });
    expect(result.overall.passed).toBe(false);
  });

  test("strips missedQuestionIds from each category", () => {
    const result = createAttemptRecord({
      quizId: "q",
      quizResults: makeQuizResults(),
      passingPercentage: 70,
      now: fixedNow,
      id: fixedId,
    });
    result.categories.forEach((cat) => {
      expect(cat).not.toHaveProperty("missedQuestionIds");
    });
  });

  test("maps categoryId→id and categoryName→name", () => {
    const result = createAttemptRecord({
      quizId: "q",
      quizResults: makeQuizResults(),
      passingPercentage: 70,
      now: fixedNow,
      id: fixedId,
    });
    expect(result.categories[0].id).toBe("web-fundamentals");
    expect(result.categories[0].name).toBe("Web Fundamentals");
  });

  test("does not mutate the input quizResults object", () => {
    const qr = makeQuizResults();
    const originalCategories = JSON.stringify(qr.categories);
    createAttemptRecord({
      quizId: "q",
      quizResults: qr,
      passingPercentage: 70,
      now: fixedNow,
      id: fixedId,
    });
    expect(JSON.stringify(qr.categories)).toBe(originalCategories);
  });
});

// ---------------------------------------------------------------------------
// 3. isValidAttempt
// ---------------------------------------------------------------------------

describe("isValidAttempt", () => {
  test("returns true for a valid attempt", () => {
    expect(isValidAttempt(makeAttempt())).toBe(true);
  });

  test("returns false for null", () => {
    expect(isValidAttempt(null)).toBe(false);
  });

  test("returns false for an array", () => {
    expect(isValidAttempt([])).toBe(false);
  });

  test("returns false when id is missing", () => {
    const { id: _omit, ...rest } = makeAttempt();
    expect(isValidAttempt(rest)).toBe(false);
  });

  test("returns false when overall is missing", () => {
    const { overall: _omit, ...rest } = makeAttempt();
    expect(isValidAttempt(rest)).toBe(false);
  });

  test("returns false when overall.passed is not a boolean", () => {
    expect(
      isValidAttempt(
        makeAttempt({ overall: { correct: 8, total: 11, percentage: 73, passed: "yes" } })
      )
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. loadAttempts
// ---------------------------------------------------------------------------

describe("loadAttempts", () => {
  test("returns [] when storage has nothing (null)", () => {
    expect(loadAttempts(makeStorage(null))).toEqual([]);
  });

  test("returns the stored valid attempt", () => {
    const attempt = makeAttempt();
    const storage = makeStorage(JSON.stringify([attempt]));
    const result = loadAttempts(storage);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(attempt.id);
  });

  test("returns [] when getItem throws (SecurityError)", () => {
    expect(loadAttempts(makeThrowingReadStorage())).toEqual([]);
  });

  test("returns [] when stored value is malformed JSON", () => {
    expect(loadAttempts(makeStorage("{ not valid json"))).toEqual([]);
  });

  test("returns [] when stored value is a JSON object (not array)", () => {
    expect(loadAttempts(makeStorage(JSON.stringify({ foo: "bar" })))).toEqual(
      []
    );
  });

  test("filters out invalid entries, keeps valid ones", () => {
    const valid = makeAttempt({ id: "valid-1" });
    const invalid = { notAnAttempt: true };
    const storage = makeStorage(JSON.stringify([valid, invalid]));
    const result = loadAttempts(storage);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("valid-1");
  });

  test("returns [] when all stored entries are invalid", () => {
    const storage = makeStorage(JSON.stringify([{ bad: true }, null, 42]));
    expect(loadAttempts(storage)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 5. saveAttempt
// ---------------------------------------------------------------------------

describe("saveAttempt", () => {
  test("saves the first attempt to empty storage", () => {
    const storage = makeStorage(null);
    const attempt = makeAttempt({ id: "first" });
    const result = saveAttempt(attempt, storage);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("first");
    // Persisted
    expect(JSON.parse(storage._read())).toHaveLength(1);
  });

  test("prepends new attempt (newest first)", () => {
    const older = makeAttempt({ id: "older", completedAt: "2025-01-14T09:00:00.000Z" });
    const storage = makeStorage(JSON.stringify([older]));
    const newer = makeAttempt({ id: "newer", completedAt: "2025-01-15T14:00:00.000Z" });

    const result = saveAttempt(newer, storage);

    expect(result[0].id).toBe("newer");
    expect(result[1].id).toBe("older");
  });

  test("deduplicates by id: keeps only one copy of a duplicate id", () => {
    const existing = makeAttempt({ id: "dup" });
    const storage = makeStorage(JSON.stringify([existing]));
    const updated = makeAttempt({ id: "dup", overall: { ...existing.overall, correct: 9, passed: true, percentage: 82 } });

    const result = saveAttempt(updated, storage);

    const dupEntries = result.filter((a) => a.id === "dup");
    expect(dupEntries).toHaveLength(1);
    // New version wins (is first)
    expect(result[0].overall.correct).toBe(9);
  });

  test(`caps history at ${MAX_ATTEMPTS} entries`, () => {
    const existing = Array.from({ length: MAX_ATTEMPTS }, (_, i) =>
      makeAttempt({ id: `old-${i}` })
    );
    const storage = makeStorage(JSON.stringify(existing));
    const sixth = makeAttempt({ id: "sixth" });

    const result = saveAttempt(sixth, storage);

    expect(result).toHaveLength(MAX_ATTEMPTS);
    expect(result[0].id).toBe("sixth");
    expect(result.find((a) => a.id === `old-${MAX_ATTEMPTS - 1}`)).toBeUndefined();
  });

  test("returns in-memory result without throwing when setItem throws", () => {
    const storage = makeThrowingWriteStorage(null);
    const attempt = makeAttempt({ id: "quota-fail" });

    let result;
    expect(() => {
      result = saveAttempt(attempt, storage);
    }).not.toThrow();

    // Should still return the merged array
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("quota-fail");
  });

  test("does not mutate the passed attempt object", () => {
    const storage = makeStorage(null);
    const attempt = makeAttempt({ id: "immutable" });
    const before = JSON.stringify(attempt);

    saveAttempt(attempt, storage);

    expect(JSON.stringify(attempt)).toBe(before);
  });

  test("writes only to ATTEMPT_STORAGE_KEY", () => {
    const writtenKeys = [];
    const storage = {
      getItem: () => null,
      setItem: (key, _val) => { writtenKeys.push(key); },
    };
    saveAttempt(makeAttempt(), storage);
    expect(writtenKeys).toEqual([ATTEMPT_STORAGE_KEY]);
  });
});
