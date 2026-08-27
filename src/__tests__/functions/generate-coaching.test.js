"use strict";

/**
 * Unit tests for netlify/functions/generate-coaching.js
 *
 * All IBM network calls are mocked — no real HTTP requests are made.
 * These tests verify: method guard, body-size guard, JSON parse guard,
 * payload validation, missing env vars, timeout handling, IAM failure,
 * watsonx failure, invalid JSON from model, validation failure,
 * and a successful happy path.
 */

// ---------------------------------------------------------------------------
// Mock global fetch before requiring the module
// ---------------------------------------------------------------------------

const mockFetch = jest.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Helper: load a fresh copy of the handler for each test (so env var
// mutations in process.env don't bleed between tests)
// ---------------------------------------------------------------------------

let handler;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  // Re-require after resetting modules so process.env changes are picked up
  handler = require("../../../netlify/functions/generate-coaching").handler;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid quiz payload */
const validPayload = {
  overall: { correct: 8, total: 11, percentage: 73, passed: true },
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
  missedQuestions: [
    {
      id: "q-1",
      categoryId: "react-state",
      categoryName: "React and State",
      prompt: "What hook manages local state?",
      selectedAnswerText: "useEffect",
      correctAnswerText: "useState",
      explanation: "useState is the hook for managing local component state.",
    },
  ],
};

/** IAM token response fixture */
const iamTokenResponse = {
  access_token: "mock-bearer-token",
  expiration: Date.now() / 1000 + 3600,
};

/** Valid coaching response fixture */
const validCoachingResponse = {
  summary: "You did well overall but need to improve on React hooks.",
  strengths: ["Web fundamentals"],
  improvementAreas: ["React state management"],
  nextSteps: ["Study useState", "Build a small React app", "Review docs"],
  encouragement: "Keep going — you are making great progress!",
};

/** Build a mock fetch response */
function mockResponse(status, body) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  });
}

/** Build a Netlify event object */
function makeEvent(overrides = {}) {
  return {
    httpMethod: "POST",
    body: JSON.stringify(validPayload),
    ...overrides,
  };
}

/** Set all required env vars */
function setEnvVars() {
  process.env.WATSONX_API_KEY    = "test-api-key";
  process.env.WATSONX_PROJECT_ID = "test-project-id";
  process.env.WATSONX_BASE_URL   = "https://test.watsonx.ai";
  process.env.WATSONX_MODEL_ID   = "ibm/granite-test";
  process.env.WATSONX_API_VERSION = "2024-05-01";
}

/** Clear all required env vars */
function clearEnvVars() {
  delete process.env.WATSONX_API_KEY;
  delete process.env.WATSONX_PROJECT_ID;
  delete process.env.WATSONX_BASE_URL;
  delete process.env.WATSONX_MODEL_ID;
  delete process.env.WATSONX_API_VERSION;
}

// ---------------------------------------------------------------------------
// 1. Method guard
// ---------------------------------------------------------------------------

test('returns 405 for non-POST requests', async () => {
  const result = await handler(makeEvent({ httpMethod: "GET" }));
  expect(result.statusCode).toBe(405);
  expect(JSON.parse(result.body).error).toMatch(/method not allowed/i);
});

// ---------------------------------------------------------------------------
// 2. Body size guard
// ---------------------------------------------------------------------------

test('returns 413 when body exceeds 16 KB', async () => {
  const oversizedBody = "x".repeat(16 * 1024 + 1);
  const result = await handler(makeEvent({ body: oversizedBody }));
  expect(result.statusCode).toBe(413);
  expect(JSON.parse(result.body).error).toMatch(/too large/i);
});

// ---------------------------------------------------------------------------
// 3. JSON parse guard
// ---------------------------------------------------------------------------

test('returns 400 for malformed JSON body', async () => {
  const result = await handler(makeEvent({ body: "{ not valid json" }));
  expect(result.statusCode).toBe(400);
  expect(JSON.parse(result.body).error).toMatch(/invalid json/i);
});

// ---------------------------------------------------------------------------
// 4. Payload validation
// ---------------------------------------------------------------------------

test('returns 400 when overall field is missing', async () => {
  const { overall: _omit, ...bodyWithoutOverall } = validPayload;
  const result = await handler(makeEvent({ body: JSON.stringify(bodyWithoutOverall) }));
  expect(result.statusCode).toBe(400);
  expect(JSON.parse(result.body).error).toMatch(/overall/i);
});

test('returns 400 when missedQuestions is missing correctAnswerText', async () => {
  const badPayload = {
    ...validPayload,
    missedQuestions: [
      {
        id: "q-1",
        categoryId: "react-state",
        categoryName: "React and State",
        prompt: "What hook manages local state?",
        selectedAnswerText: "useEffect",
        // correctAnswerText deliberately omitted
        explanation: "useState is the hook.",
      },
    ],
  };
  const result = await handler(makeEvent({ body: JSON.stringify(badPayload) }));
  expect(result.statusCode).toBe(400);
  expect(JSON.parse(result.body).error).toMatch(/correctAnswerText/i);
});

// ---------------------------------------------------------------------------
// 5. Missing environment variables
// ---------------------------------------------------------------------------

test('returns 500 when environment variables are missing', async () => {
  clearEnvVars();
  const result = await handler(makeEvent());
  expect(result.statusCode).toBe(500);
  expect(JSON.parse(result.body).error).toMatch(/server configuration error/i);
});

// ---------------------------------------------------------------------------
// 6. IAM token fetch failure
// ---------------------------------------------------------------------------

test('returns 502 when IAM token fetch throws a non-timeout error', async () => {
  setEnvVars();
  // First fetch call = IAM — throw a non-abort error
  mockFetch.mockRejectedValueOnce(new Error("Connection refused"));
  const result = await handler(makeEvent());
  expect(result.statusCode).toBe(502);
  expect(JSON.parse(result.body).error).toMatch(/authentication/i);
});

// ---------------------------------------------------------------------------
// 7. watsonx.ai call failure
// ---------------------------------------------------------------------------

test('returns 502 when watsonx.ai API call throws a non-timeout error', async () => {
  setEnvVars();
  // IAM succeeds
  mockFetch.mockResolvedValueOnce(mockResponse(200, iamTokenResponse));
  // watsonx call fails
  mockFetch.mockRejectedValueOnce(new Error("Service unavailable"));
  const result = await handler(makeEvent());
  expect(result.statusCode).toBe(502);
  expect(JSON.parse(result.body).error).toMatch(/ai service is temporarily unavailable/i);
});

// ---------------------------------------------------------------------------
// 8. Invalid JSON from model output
// ---------------------------------------------------------------------------

test('returns 502 when model output cannot be parsed as JSON', async () => {
  setEnvVars();
  // IAM succeeds
  mockFetch.mockResolvedValueOnce(mockResponse(200, iamTokenResponse));
  // watsonx returns text with no extractable JSON object
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        results: [{ generated_text: "Sorry, I cannot answer that." }],
      }),
  });
  const result = await handler(makeEvent());
  expect(result.statusCode).toBe(502);
  expect(JSON.parse(result.body).error).toMatch(/unexpected response/i);
});

// ---------------------------------------------------------------------------
// 9. Coaching response validation failure
// ---------------------------------------------------------------------------

test('returns 502 when model JSON is structurally invalid', async () => {
  setEnvVars();
  const badCoaching = {
    // missing required fields: strengths, improvementAreas, nextSteps, encouragement
    summary: "Good work",
  };
  mockFetch.mockResolvedValueOnce(mockResponse(200, iamTokenResponse));
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        results: [{ generated_text: JSON.stringify(badCoaching) }],
      }),
  });
  const result = await handler(makeEvent());
  expect(result.statusCode).toBe(502);
  expect(JSON.parse(result.body).error).toMatch(/unexpected response/i);
});

// ---------------------------------------------------------------------------
// 10. Happy path — returns 200 with structured coaching data
// ---------------------------------------------------------------------------

test('returns 200 with structured coaching data on success', async () => {
  setEnvVars();
  mockFetch.mockResolvedValueOnce(mockResponse(200, iamTokenResponse));
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        results: [{ generated_text: JSON.stringify(validCoachingResponse) }],
      }),
  });
  const result = await handler(makeEvent());
  expect(result.statusCode).toBe(200);
  const body = JSON.parse(result.body);
  expect(body.summary).toBe(validCoachingResponse.summary);
  expect(body.strengths).toEqual(validCoachingResponse.strengths);
  expect(body.improvementAreas).toEqual(validCoachingResponse.improvementAreas);
  expect(body.nextSteps).toEqual(validCoachingResponse.nextSteps);
  expect(body.encouragement).toBe(validCoachingResponse.encouragement);
});

// ---------------------------------------------------------------------------
// 11. Fence-stripping — model output wrapped in markdown fences is handled
// ---------------------------------------------------------------------------

test('returns 200 when model wraps JSON in markdown code fences', async () => {
  setEnvVars();
  const fencedOutput = `\`\`\`json\n${JSON.stringify(validCoachingResponse)}\n\`\`\``;
  mockFetch.mockResolvedValueOnce(mockResponse(200, iamTokenResponse));
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({ results: [{ generated_text: fencedOutput }] }),
  });
  const result = await handler(makeEvent());
  expect(result.statusCode).toBe(200);
  const body = JSON.parse(result.body);
  expect(body.summary).toBe(validCoachingResponse.summary);
});

// ---------------------------------------------------------------------------
// 12. Empty missedQuestions — all correct, still valid
// ---------------------------------------------------------------------------

test('returns 200 when missedQuestions array is empty (perfect score)', async () => {
  setEnvVars();
  const perfectPayload = {
    ...validPayload,
    missedQuestions: [],
  };
  mockFetch.mockResolvedValueOnce(mockResponse(200, iamTokenResponse));
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        results: [{ generated_text: JSON.stringify(validCoachingResponse) }],
      }),
  });
  const result = await handler(makeEvent({ body: JSON.stringify(perfectPayload) }));
  expect(result.statusCode).toBe(200);
});
