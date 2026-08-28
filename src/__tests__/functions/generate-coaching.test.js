"use strict";

/**
 * Unit tests for netlify/functions/generate-coaching.js
 *
 * All IBM network calls are mocked — no real HTTP requests are made.
 * These tests verify: method guard, body-size guard, JSON parse guard,
 * payload validation, missing env vars, timeout handling, IAM failure,
 * watsonx failure, JSON extraction edge cases, validation failure,
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
// 7. watsonx.ai call failure — network-level throw
// ---------------------------------------------------------------------------

test('returns 502 when watsonx.ai API call throws a non-timeout error', async () => {
  setEnvVars();
  // IAM succeeds
  mockFetch.mockResolvedValueOnce(mockResponse(200, iamTokenResponse));
  // watsonx call fails at network level
  mockFetch.mockRejectedValueOnce(new Error("Service unavailable"));
  const result = await handler(makeEvent());
  expect(result.statusCode).toBe(502);
  expect(JSON.parse(result.body).error).toMatch(/ai service is temporarily unavailable/i);
});

// ---------------------------------------------------------------------------
// 7b. watsonx.ai call failure — HTTP non-2xx response (e.g. 403, 502)
// ---------------------------------------------------------------------------

test('returns generic 502 client response when watsonx.ai returns a non-2xx HTTP status', async () => {
  setEnvVars();
  // IAM succeeds
  mockFetch.mockResolvedValueOnce(mockResponse(200, iamTokenResponse));
  // watsonx returns HTTP 403 with an IBM-style error body
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 403,
    statusText: "Forbidden",
    headers: {
      get: (name) =>
        name === "x-request-id" ? "ibm-req-abc123" : null,
    },
    json: () =>
      Promise.resolve({
        error: {
          code: "insufficient_permissions",
          message: "The caller does not have the required permissions.",
        },
      }),
  });
  const result = await handler(makeEvent());

  // Client always receives the generic safe message
  expect(result.statusCode).toBe(502);
  const body = JSON.parse(result.body);
  expect(body.error).toMatch(/ai service is temporarily unavailable/i);

  // Credentials and IBM internals are NOT in the client response
  expect(result.body).not.toMatch(/test-api-key/);
  expect(result.body).not.toMatch(/mock-bearer-token/);
  expect(result.body).not.toMatch(/ibm-req-abc123/);
  expect(result.body).not.toMatch(/insufficient_permissions/);
});

test('returns generic 502 when watsonx.ai error body is plain text (not JSON)', async () => {
  setEnvVars();
  mockFetch.mockResolvedValueOnce(mockResponse(200, iamTokenResponse));
  // watsonx returns 502 with a plain-text body (gateway error, not JSON)
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 502,
    statusText: "Bad Gateway",
    headers: { get: () => null },
    json: () => Promise.reject(new SyntaxError("Unexpected token")),
    text: () => Promise.resolve("upstream connect error or disconnect/reset before headers"),
  });
  const result = await handler(makeEvent());
  expect(result.statusCode).toBe(502);
  expect(JSON.parse(result.body).error).toMatch(/ai service is temporarily unavailable/i);
  // Plain-text upstream message must not reach the client
  expect(result.body).not.toMatch(/upstream connect error/);
});

// ---------------------------------------------------------------------------
// 7c. watsonx.ai call failure — errors[] array shape
// ---------------------------------------------------------------------------

test('extracts code and message from errors[] array, still returns generic 502 to browser', async () => {
  setEnvVars();
  mockFetch.mockResolvedValueOnce(mockResponse(200, iamTokenResponse));
  // IBM response using the { errors: [{ code, message }] } shape
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 400,
    statusText: "Bad Request",
    headers: {
      get: (name) =>
        name === "content-type" ? "application/json" : null,
    },
    json: () =>
      Promise.resolve({
        errors: [
          {
            code: "invalid_parameter",
            message: "Example safe IBM validation message",
          },
        ],
      }),
  });

  // Spy before calling handler so the module's console.error is intercepted.
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  const result = await handler(makeEvent());

  // Capture calls BEFORE restoring, then restore immediately.
  const spyCalls = consoleSpy.mock.calls.slice();
  consoleSpy.mockRestore();

  // 1. Client always receives the generic safe response.
  expect(result.statusCode).toBe(502);
  const body = JSON.parse(result.body);
  expect(body.error).toMatch(/ai service is temporarily unavailable/i);

  // 2. IBM error details are NOT in the client response body.
  expect(result.body).not.toMatch(/invalid_parameter/);
  expect(result.body).not.toMatch(/Example safe IBM validation message/);
  expect(result.body).not.toMatch(/test-api-key/);
  expect(result.body).not.toMatch(/mock-bearer-token/);

  // 3. The diagnostic log received the extracted code and message.
  const diagnosticCall = spyCalls.find(
    (args) => args[0] === "watsonx.ai API call failed"
  );
  expect(diagnosticCall).toBeDefined();
  const diagnostic = diagnosticCall[1];
  expect(diagnostic.status).toBe(400);
  expect(diagnostic.code).toBe("invalid_parameter");
  expect(diagnostic.message).toBe("Example safe IBM validation message");
  expect(diagnostic.errorsCount).toBe(1);
});

// ---------------------------------------------------------------------------
// Helper — build a mock chat response with model content
// ---------------------------------------------------------------------------

/**
 * Returns a mock successful watsonx.ai chat response wrapping the given
 * content string in the choices[0].message.content shape.
 */
function mockChatResponse(content) {
  return {
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        choices: [{ message: { content } }],
      }),
  };
}

// ---------------------------------------------------------------------------
// 8. Invalid JSON from model output
// ---------------------------------------------------------------------------

test('returns 502 when model output cannot be parsed as JSON', async () => {
  setEnvVars();
  mockFetch.mockResolvedValueOnce(mockResponse(200, iamTokenResponse));
  mockFetch.mockResolvedValueOnce(mockChatResponse("Sorry, I cannot answer that."));
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
  mockFetch.mockResolvedValueOnce(mockChatResponse(JSON.stringify(badCoaching)));
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
  mockFetch.mockResolvedValueOnce(mockChatResponse(JSON.stringify(validCoachingResponse)));
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
// 11. Fence-stripping — ```json fenced JSON
// ---------------------------------------------------------------------------

test('returns 200 when model wraps JSON in ```json code fences', async () => {
  setEnvVars();
  const fencedOutput = `\`\`\`json\n${JSON.stringify(validCoachingResponse)}\n\`\`\``;
  mockFetch.mockResolvedValueOnce(mockResponse(200, iamTokenResponse));
  mockFetch.mockResolvedValueOnce(mockChatResponse(fencedOutput));
  const result = await handler(makeEvent());
  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body).summary).toBe(validCoachingResponse.summary);
});

// ---------------------------------------------------------------------------
// 12. Empty missedQuestions — all correct, still valid
// ---------------------------------------------------------------------------

test('returns 200 when missedQuestions array is empty (perfect score)', async () => {
  setEnvVars();
  const perfectPayload = { ...validPayload, missedQuestions: [] };
  mockFetch.mockResolvedValueOnce(mockResponse(200, iamTokenResponse));
  mockFetch.mockResolvedValueOnce(mockChatResponse(JSON.stringify(validCoachingResponse)));
  const result = await handler(makeEvent({ body: JSON.stringify(perfectPayload) }));
  expect(result.statusCode).toBe(200);
});

// ---------------------------------------------------------------------------
// 13. extractJsonFromText parsing edge cases
//     These exercise the parser directly via the full handler stack.
//     All use the chat choices shape.
// ---------------------------------------------------------------------------

describe('extractJsonFromText parsing', () => {
  /** Run the handler with a given raw model content string */
  async function runWith(content) {
    setEnvVars();
    jest.resetModules();
    jest.clearAllMocks();
    handler = require("../../../netlify/functions/generate-coaching").handler;
    mockFetch
      .mockResolvedValueOnce(mockResponse(200, iamTokenResponse))
      .mockResolvedValueOnce(mockChatResponse(content));
    return handler(makeEvent());
  }

  const valid = JSON.stringify(validCoachingResponse);

  test('bare valid JSON — parses successfully', async () => {
    const result = await runWith(valid);
    expect(result.statusCode).toBe(200);
  });

  test('JSON surrounded by whitespace — parses successfully', async () => {
    const result = await runWith(`   \n  ${valid}  \n  `);
    expect(result.statusCode).toBe(200);
  });

  test('```json fenced JSON — parses successfully', async () => {
    const result = await runWith(`\`\`\`json\n${valid}\n\`\`\``);
    expect(result.statusCode).toBe(200);
  });

  test('unlabelled ``` fenced JSON — parses successfully', async () => {
    const result = await runWith(`\`\`\`\n${valid}\n\`\`\``);
    expect(result.statusCode).toBe(200);
  });

  test('prose prefix followed by JSON — balanced-object extraction succeeds', async () => {
    const result = await runWith(`Here is your coaching result:\n${valid}`);
    expect(result.statusCode).toBe(200);
  });

  test('JSON followed by brief prose — balanced-object extraction succeeds', async () => {
    const result = await runWith(`${valid}\n\nI hope this helps!`);
    expect(result.statusCode).toBe(200);
  });

  test('braces inside quoted strings are not mistaken for object boundaries', async () => {
    // "summary" contains literal braces; the parser must stay in-string mode
    const tricky = {
      ...validCoachingResponse,
      summary: 'Scores look like {"x":1} — keep it up!',
    };
    const result = await runWith(JSON.stringify(tricky));
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).summary).toBe(tricky.summary);
  });

  test('escaped quotes inside strings are handled correctly', async () => {
    const tricky = {
      ...validCoachingResponse,
      encouragement: 'Remember: "practice makes perfect" — keep going!',
    };
    const result = await runWith(JSON.stringify(tricky));
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).encouragement).toBe(tricky.encouragement);
  });

  test('malformed JSON returns 502', async () => {
    const result = await runWith('{ "summary": "oops", bad json }');
    expect(result.statusCode).toBe(502);
    expect(JSON.parse(result.body).error).toMatch(/unexpected response/i);
  });

  test('no JSON object at all returns 502', async () => {
    const result = await runWith('Great job! No JSON here at all.');
    expect(result.statusCode).toBe(502);
    expect(JSON.parse(result.body).error).toMatch(/unexpected response/i);
  });

  test('valid JSON with invalid coaching schema returns 502', async () => {
    // Valid JSON but missing required coaching fields
    const result = await runWith(JSON.stringify({ foo: "bar" }));
    expect(result.statusCode).toBe(502);
    expect(JSON.parse(result.body).error).toMatch(/unexpected response/i);
  });

  test('missing choices returns 502', async () => {
    setEnvVars();
    jest.resetModules();
    jest.clearAllMocks();
    handler = require("../../../netlify/functions/generate-coaching").handler;
    // Override: respond with no choices array
    mockFetch
      .mockResolvedValueOnce(mockResponse(200, iamTokenResponse))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ choices: [] }),
      });
    const result = await handler(makeEvent());
    expect(result.statusCode).toBe(502);
    expect(JSON.parse(result.body).error).toMatch(/ai service is temporarily unavailable/i);
  });

  test('missing message content returns 502', async () => {
    setEnvVars();
    jest.resetModules();
    jest.clearAllMocks();
    handler = require("../../../netlify/functions/generate-coaching").handler;
    mockFetch
      .mockResolvedValueOnce(mockResponse(200, iamTokenResponse))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ choices: [{ message: { content: null } }] }),
      });
    const result = await handler(makeEvent());
    expect(result.statusCode).toBe(502);
    expect(JSON.parse(result.body).error).toMatch(/ai service is temporarily unavailable/i);
  });
});
