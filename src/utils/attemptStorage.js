/**
 * attemptStorage.js
 *
 * Pure utility functions for reading and writing completed quiz attempts
 * to localStorage. All public functions are independently testable via
 * an injected storage object.
 *
 * What is stored: aggregate scores only.
 * What is never stored: answers, question text, correct-answer data,
 * AI coaching requests or responses, credentials, personal information.
 */

export const ATTEMPT_STORAGE_KEY = "quizote.attempts.v1";
export const MAX_ATTEMPTS = 5;

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

/**
 * Returns a unique attempt ID.
 * Uses crypto.randomUUID() when available; otherwise constructs a
 * non-empty string from Date.now() and a random hex segment so that the
 * timestamp is never the sole source of uniqueness.
 *
 * @returns {string}
 */
export function generateId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // Safe fallback: timestamp (base-36) + "-" + 8 random hex chars
  return (
    Date.now().toString(36) +
    "-" +
    Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, "0")
  );
}

// ---------------------------------------------------------------------------
// Record creation
// ---------------------------------------------------------------------------

/**
 * Builds a storable attempt record from quiz result data.
 * Pure function — does not mutate any input.
 * Strips missedQuestionIds and all other internal fields.
 *
 * @param {{
 *   quizId: string,
 *   quizResults: {
 *     totalCorrect: number,
 *     totalQuestions: number,
 *     overallPercentage: number,
 *     categories: Array<{
 *       categoryId: string,
 *       categoryName: string,
 *       correct: number,
 *       total: number,
 *       percentage: number,
 *       level: string
 *     }>
 *   },
 *   passingPercentage: number,
 *   now?: number,   // injectable for tests; defaults to Date.now()
 *   id?: string     // injectable for tests; defaults to generateId()
 * }} params
 * @returns {{
 *   id: string,
 *   quizId: string,
 *   completedAt: string,
 *   overall: { correct: number, total: number, percentage: number, passed: boolean },
 *   categories: Array<{ id: string, name: string, correct: number, total: number, percentage: number, level: string }>
 * }}
 */
export function createAttemptRecord({
  quizId,
  quizResults,
  passingPercentage,
  now,
  id,
}) {
  const timestamp = now !== undefined ? now : Date.now();
  const attemptId = id !== undefined ? id : generateId();

  return {
    id: attemptId,
    quizId,
    completedAt: new Date(timestamp).toISOString(),
    overall: {
      correct: quizResults.totalCorrect,
      total: quizResults.totalQuestions,
      percentage: quizResults.overallPercentage,
      passed: quizResults.overallPercentage >= passingPercentage,
    },
    // Strip missedQuestionIds and any other fields not in the stored schema
    categories: quizResults.categories.map((cat) => ({
      id: cat.categoryId,
      name: cat.categoryName,
      correct: cat.correct,
      total: cat.total,
      percentage: cat.percentage,
      level: cat.level,
    })),
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Returns true if value is a well-shaped attempt record.
 * Requires at minimum: id (string), quizId (string),
 * completedAt (string), overall (object with correct/total/percentage/passed).
 * Extra or missing optional fields do not cause rejection.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidAttempt(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const { id, quizId, completedAt, overall } = value;
  if (typeof id !== "string" || id.length === 0) return false;
  if (typeof quizId !== "string" || quizId.length === 0) return false;
  if (typeof completedAt !== "string" || completedAt.length === 0) return false;
  if (!overall || typeof overall !== "object") return false;
  if (typeof overall.correct !== "number") return false;
  if (typeof overall.total !== "number") return false;
  if (typeof overall.percentage !== "number") return false;
  if (typeof overall.passed !== "boolean") return false;
  return true;
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

/**
 * Reads stored attempts from localStorage.
 * Returns [] on any failure: unavailable storage, read exception,
 * malformed JSON, non-array value, or after filtering out invalid entries.
 *
 * @param {Pick<Storage, "getItem">} [storage=window.localStorage]
 * @returns {Array}
 */
export function loadAttempts(storage) {
  const store =
    storage !== undefined
      ? storage
      : typeof window !== "undefined"
      ? window.localStorage
      : null;

  if (!store) return [];

  try {
    const raw = store.getItem(ATTEMPT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidAttempt);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Save
// ---------------------------------------------------------------------------

/**
 * Prepends attempt to the stored list, deduplicates by id, keeps the
 * newest MAX_ATTEMPTS entries, and persists the result.
 *
 * On any write failure (QuotaExceededError, SecurityError, unavailable
 * storage) the function returns the in-memory merged array without throwing,
 * so the caller can still update React state with valid history.
 *
 * Does not mutate the supplied attempt object or any existing array.
 * Writes only to ATTEMPT_STORAGE_KEY. Never calls storage.clear().
 *
 * @param {{ id: string }} attempt
 * @param {Pick<Storage, "getItem"|"setItem">} [storage=window.localStorage]
 * @returns {Array}
 */
export function saveAttempt(attempt, storage) {
  const store =
    storage !== undefined
      ? storage
      : typeof window !== "undefined"
      ? window.localStorage
      : null;

  const existing = loadAttempts(store || undefined);

  // Prepend and deduplicate by id (newest wins), then cap to MAX_ATTEMPTS
  const deduped = [attempt, ...existing.filter((a) => a.id !== attempt.id)];
  const next = deduped.slice(0, MAX_ATTEMPTS);

  if (store) {
    try {
      store.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Write failure — return in-memory result so UI can still update
      return next;
    }
  }

  return next;
}
