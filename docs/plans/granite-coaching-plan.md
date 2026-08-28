# Granite Personalized Coaching Plan

**Status:** Pending implementation approval.

---

## Repository Findings

### Facts confirmed from the repository

| Finding | Detail |
|---|---|
| Build toolchain | Create React App (`react-scripts 5.0.1`) — confirmed by `package.json` scripts |
| `netlify.toml` | **Does not exist** |
| `netlify/functions/` directory | **Does not exist** |
| Existing Netlify config | `public/_redirects` contains one rule: `/* /index.html 200` (SPA fallback) |
| `.env` files | No `.env*` files present; `.gitignore` lists `.env.local`, `.env.development.local`, `.env.test.local`, `.env.production.local` — standard CRA pattern |
| Existing serverless functions | None |
| HTTP-request library | None installed — `fetch` (browser-native) is sufficient for the frontend call |
| Validation library | `yup ^0.32.11` is present but unused in the quiz flow; available for response validation in the function if desired |
| `node-fetch` or `axios` | Not installed |
| `@ibm-cloud/watsonx-ai` SDK | Not installed |
| CRA env-var convention | `REACT_APP_` prefix exposes variables to the browser bundle — must not be used for secrets |
| Function module format | `package.json` has no `"type": "module"`, so Node.js defaults to CommonJS. Netlify Functions also default to CommonJS. The function must use `require`/`module.exports` unless `netlify.toml` sets `node_bundler = "esbuild"` with ES module support. Plan uses CommonJS to match the project default and avoid adding build configuration. |

### What must be confirmed from the IBM watsonx.ai account

The following cannot be determined from the repository. They are required before
implementation and must be obtained from the IBM watsonx.ai console and current
official documentation.

| Item | Why it cannot be assumed |
|---|---|
| Regional API base URL | Differs between `us-south`, `eu-de`, `au-syd`, and other regions |
| IAM authentication endpoint | Standard is `https://iam.cloud.ibm.com/identity/token` but should be confirmed |
| API version date string | IBM watsonx.ai uses a `version` query parameter (e.g. `<WATSONX_API_VERSION>`); the current supported value must be confirmed |
| Granite model ID | Multiple Granite model IDs exist (`ibm/granite-13b-instruct-v2`, `ibm/granite-3-8b-instruct`, etc.); the correct ID for text generation must be chosen and confirmed available in the account's region |
| Token limits | `max_new_tokens` appropriate for the coaching JSON response; depends on the model |
| Project ID vs. Space ID | watsonx.ai generation endpoints accept either a `project_id` or a `space_id`; which is in use must be determined from the account |
| Rate limits and quotas | Vary by plan; needed to decide whether to add per-user throttling |
| Response format parameter | Whether the selected model supports a `response_format: { type: "json_object" }` parameter (available on some models, not all) |

---

## Top-Level Overview

A Netlify serverless function (`netlify/functions/generate-coaching.js`) acts
as a secure proxy between the React frontend and the IBM watsonx.ai Granite
text-generation API. The frontend sends a minimal JSON summary of the learner's
results; the function validates the payload, constructs a fixed server-side
prompt, calls Granite, validates the returned JSON structure, and returns a
clean coaching object. IBM credentials never reach the browser.

The coaching panel renders below the existing Skills summary. If generation
fails, the deterministic results remain visible and the learner can retry.

---

## Proposed Architecture

```
React (QuizResults.jsx)
  │
  │  POST /.netlify/functions/generate-coaching
  │  { overall, categories, missedQuestions }
  │
  ▼
netlify/functions/generate-coaching.js
  │  1. Reject non-POST
  │  2. Parse and size-limit body
  │  3. Validate payload shape
  │  4. Build fixed prompt (server-side only)
  │  5. Fetch IAM bearer token using API key
  │  6. POST to watsonx.ai generate endpoint
  │  7. Validate JSON structure of model output
  │  8. Return coaching object
  │
  ▼
IBM watsonx.ai Granite (text generation)
  │
  ▼
React (CoachingPanel component)
  Renders: summary, strengths[], improvementAreas[], nextSteps[], encouragement
```

---

## Minimal Request Schema

The proposed request body in the task specification includes `missedQuestionIds`
nested inside categories. These IDs are opaque strings that Granite cannot
interpret without the corresponding question text. They should be omitted from
the category objects and instead surfaced as full `missedQuestions` objects.

### Recommended minimal request body

```json
{
  "overall": {
    "correct": 8,
    "total": 11,
    "percentage": 73,
    "passed": true
  },
  "categories": [
    {
      "id": "web-fundamentals",
      "name": "Web Fundamentals",
      "correct": 2,
      "total": 2,
      "percentage": 100,
      "level": "Strong"
    }
  ],
  "missedQuestions": [
    {
      "id": "q4",
      "category": "testing-debugging",
      "prompt": "An AI assistant generates...",
      "selectedAnswer": "disable-clicks",
      "correctAnswer": "calculate-submit",
      "explanation": "The application should store one current answer..."
    }
  ]
}
```

Fields removed from the specification compared to the original proposal:

- `missedQuestionIds` inside each category object — replaced by the full
  `missedQuestions` array which gives Granite the actual question context.
- `difficulty` — not present in the result object and adds no coaching value.

Fields retained because they are useful to Granite:

- `overall.passed` — allows Granite to calibrate the tone (encouragement vs
  reinforcement).
- `level` per category — the already-computed skill label removes the need for
  Granite to interpret raw numbers.
- `explanation` per missed question — allows Granite to reference the
  correct concept without Granite having to know the question bank.

The function must construct `missedQuestions` server-side from the incoming
`categories[].missedQuestionIds` crossed with a server-side copy of the question
bank — OR the frontend sends the full `missedQuestions` array assembled from
`questions` and `answers` in `Quiz.jsx`, which is simpler and has no security
implication since the question text is already public.

**Decision: the frontend assembles and sends `missedQuestions`.** The question
content is part of the public application; there is no security reason to
reconstruct it server-side.

### Maximum request body size

The 11-question quiz produces at most 11 missed-question objects. Each object
contains question text (≤ 200 characters), two answer texts (≤ 100 characters
each), and an explanation (≤ 300 characters). Upper bound: approximately 8 KB.
The function should reject bodies larger than 16 KB.

---

## Server-Side Prompt Design

The function constructs the prompt from validated fields only. The browser never
sends prompt text.

### Prompt template

```
You are a supportive coding coach for beginner web developers.

A learner has just completed a quiz on building web applications with AI
assistants. Here are their results:

Overall: {correct} of {total} correct ({percentage}%). 
Result: {passed ? "Passed" : "Did not pass"}.

Category results:
{categories
  .filter(c => c.level !== "Not assessed")
  .map(c => `- ${c.name}: ${c.correct}/${c.total} (${c.percentage}%) — ${c.level}`)
  .join("\n")}

Questions the learner answered incorrectly:
{missedQuestions.map(q =>
  `Question: ${q.prompt}\n` +
  `Their answer: ${q.selectedAnswer}\n` +
  `Correct answer: ${q.correctAnswer}\n` +
  `Explanation: ${q.explanation}`
).join("\n\n")}

Based only on these results, write a coaching plan in valid JSON matching
exactly this schema — no other text, no markdown, no code fences:
{
  "summary": "Up to 3 sentences.",
  "strengths": ["up to 3 strings"],
  "improvementAreas": ["up to 3 strings"],
  "nextSteps": ["exactly 3 practical strings"],
  "encouragement": "Up to 2 sentences."
}

Rules:
- Base all advice on the supplied results only.
- Do not claim the learner was assessed on untested skills.
- Do not invent or alter scores.
- Use a supportive tone suitable for beginners.
- Return only valid JSON. No preamble, no explanation outside the JSON.
```

The template is a string literal inside the function. It is never sent from or
constructed in the browser.

---

## Response-Validation Design

The function validates the model output before forwarding it to React. If
validation fails, the function returns a 502 with a generic error message.

### Validation rules

| Field | Type | Constraint |
|---|---|---|
| `summary` | string | length > 0, length ≤ 600 |
| `strengths` | string[] | length 1–3; each item is a non-empty string |
| `improvementAreas` | string[] | length 1–3; each item is a non-empty string |
| `nextSteps` | string[] | length exactly 3; each item is a non-empty string |
| `encouragement` | string | length > 0, length ≤ 400 |
| (all string values) | — | must not contain HTML tags — strip or reject if `/<[^>]+>/` matches |

The function parses the model's text output with `JSON.parse` inside a
`try/catch`. If the model returns markdown fences around the JSON (a common
failure mode), the function strips the fence before parsing.

---

## Frontend State Design

All coaching state lives in `Quiz.jsx` alongside `quizResults`. It is passed
down to `QuizResults` as new props.

### New state in `Quiz.jsx`

```js
const [coachingStatus, setCoachingStatus] = useState("idle");
// "idle" | "loading" | "success" | "error"

const [coachingData, setCoachingData] = useState(null);
// null | { summary, strengths, improvementAreas, nextSteps, encouragement }

const [coachingError, setCoachingError] = useState("");
// "" | human-readable error string
```

### `generateCoaching` function in `Quiz.jsx`

```
1. Guard: if coachingStatus === "loading", return immediately (prevents duplicates).
2. Set status to "loading", clear previous error.
3. Assemble the request body from quizResults and questions/answers.
4. POST to /.netlify/functions/generate-coaching.
5. On success: parse response, set coachingData, set status to "success".
6. On any failure: set coachingError to a user-facing message,
   set status to "error". Do NOT clear quizResults or categoryResults.
```

### New props passed to `QuizResults`

```
coachingStatus     "idle" | "loading" | "success" | "error"
coachingData       null | coaching object
coachingError      string
onGenerateCoaching function — calls generateCoaching in Quiz.jsx
```

### `tryAgain` reset

```js
setCoachingStatus("idle");
setCoachingData(null);
setCoachingError("");
```

---

## Environment Variable Names

| Variable | Location | Purpose |
|---|---|---|
| `WATSONX_API_KEY` | Netlify environment (server-only) | IBM Cloud IAM API key |
| `WATSONX_PROJECT_ID` | Netlify environment (server-only) | watsonx.ai project or space ID |
| `WATSONX_BASE_URL` | Netlify environment (server-only) | Regional API base URL |
| `WATSONX_MODEL_ID` | Netlify environment (server-only) | Granite model ID string |

None use `REACT_APP_` prefix. None appear in any file committed to the
repository. The function reads them with `process.env.VARIABLE_NAME` and
immediately returns a 500 error if any are absent.

---

## Sub-Tasks

---

### Sub-Task 1 — Add `netlify.toml`

**Status:** [ ] pending

#### Intent

Netlify needs to know the build command, publish directory, and function
directory. Currently there is no `netlify.toml`. CRA builds to `build/`; Netlify
Functions default to `netlify/functions/` but the path must be explicit.

#### Expected Outcomes

- `netlify.toml` at the repository root.
- Build command: `npm run build`.
- Publish directory: `build`.
- Functions directory: `netlify/functions`.
- The existing `public/_redirects` SPA rule is preserved (Netlify respects it
  even with `netlify.toml` present).

#### Todo List

1. Create `netlify.toml` with `[build]` section specifying `command`, `publish`,
   and `functions`.
2. Confirm the `public/_redirects` rule still applies (it does — Netlify merges
   both).
3. Do not add redirect rules for `/.netlify/functions/*` — Netlify routes these
   automatically.

#### Relevant Context

- Current `public/_redirects`: `/* /index.html 200`.
- CRA output directory: `build/` (confirmed by `.gitignore` entry `/build`).
- No existing `netlify.toml` in the repository.

---

### Sub-Task 2 — Create the Netlify Function

**Status:** [ ] pending

#### Intent

Create `netlify/functions/generate-coaching.js` as a CommonJS module. This
function is the secure proxy between React and IBM watsonx.ai.

#### Expected Outcomes

- File exists at `netlify/functions/generate-coaching.js`.
- Rejects non-POST methods with 405.
- Rejects bodies larger than 16 KB with 413.
- Parses and validates the request body shape.
- Rejects invalid structures with 400.
- Returns 500 if required environment variables are absent.
- Fetches an IAM bearer token using `WATSONX_API_KEY`.
- Posts to the watsonx.ai generate endpoint with the server-side prompt.
- Enforces a request timeout (recommend 20 seconds).
- Strips markdown code fences from model output if present.
- Validates the JSON structure of the model output.
- Returns 502 if model output is malformed.
- Returns the validated coaching object with 200.
- Returns consistent `{ error: "..." }` JSON for all failure paths.
- Never includes credentials, stack traces, or internal details in error
  responses.

#### Todo List

1. Create `netlify/functions/generate-coaching.js`.
2. Implement method guard, body-size guard, JSON parse, payload validation.
3. Implement IAM token fetch using `node-fetch` OR the built-in `fetch`
   available in Node 18+ (confirm Netlify's Node version for this site).
4. Implement the fixed prompt builder.
5. Implement the watsonx.ai API call with timeout.
6. Implement JSON fence stripping and `JSON.parse` with try/catch.
7. Implement response-shape validation.
8. Return validated result or appropriate error response.

#### Relevant Context

- Module format: CommonJS (`require` / `module.exports`) — matches the project's
  Node default (no `"type": "module"` in `package.json`).
- Netlify Functions export a `handler` async function.
- No IBM SDK installation planned — direct HTTP via `fetch` or `node-fetch`.
  Confirm Node version available on Netlify to decide between native `fetch`
  (Node 18+) and `node-fetch`.
- `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, `WATSONX_BASE_URL`,
  `WATSONX_MODEL_ID` are read from `process.env`.
- The API version date string must be confirmed before implementation.
- The model ID must be confirmed before implementation.

---

### Sub-Task 3 — Add coaching state to `Quiz.jsx`

**Status:** [ ] pending

#### Intent

Add `coachingStatus`, `coachingData`, and `coachingError` state to `Quiz.jsx`.
Add the `generateCoaching` async function. Reset coaching state in `tryAgain`.
Pass the four new props to `<QuizResults>`.

#### Expected Outcomes

- Three new state variables in `Quiz.jsx`.
- `generateCoaching` assembles the minimal request body and calls the function.
- `generateCoaching` is a no-op if `coachingStatus === "loading"`.
- `tryAgain` resets all coaching state to initial values.
- `<QuizResults>` receives `coachingStatus`, `coachingData`, `coachingError`,
  `onGenerateCoaching`.
- All 70 existing tests continue to pass.

#### Todo List

1. Add three `useState` declarations after the existing `quizResults` state.
2. Write `generateCoaching` as an async function inside `Quiz.jsx`.
3. Add coaching reset to `tryAgain`.
4. Add four props to the `<QuizResults>` JSX.
5. Run `npm test -- --watchAll=false` to confirm all existing tests pass.

#### Relevant Context

- `Quiz.jsx` currently passes 7 props to `<QuizResults>`. After this sub-task
  it passes 11.
- `generateCoaching` must assemble `missedQuestions` by crossing
  `quizResults.categories[].missedQuestionIds` with the `questions` array and
  the `answers` state object to build the prompt-ready shape. Both are available
  in `Quiz.jsx` scope.
- The `fetch` call targets `/.netlify/functions/generate-coaching` (relative
  URL — works on both Netlify and `netlify dev` local).

---

### Sub-Task 4 — Create `CoachingPanel.jsx`

**Status:** [ ] pending

#### Intent

Create a new component `src/components/CoachingPanel.jsx` that receives the
coaching props and renders: the "Generate" button (idle state), a loading
indicator, the structured coaching content (success state), or an error message
with a Retry button (error state).

#### Expected Outcomes

- File exists at `src/components/CoachingPanel.jsx`.
- Renders a "Generate my coaching plan" button when `coachingStatus === "idle"`.
- Button is disabled and shows loading text when `coachingStatus === "loading"`.
- Renders structured coaching sections when `coachingStatus === "success"`.
- Renders error message and Retry button when `coachingStatus === "error"`.
- Never uses `dangerouslySetInnerHTML`.
- All string values from `coachingData` are rendered as text nodes.
- `onGenerateCoaching` is called on button click (both initial and retry).
- Design is consistent with existing white rounded-2xl card style.

#### Todo List

1. Create `src/components/CoachingPanel.jsx`.
2. Destructure: `coachingStatus`, `coachingData`, `coachingError`,
   `onGenerateCoaching`.
3. Render idle state: button "Generate my coaching plan".
4. Render loading state: disabled button with accessible loading indicator.
5. Render success state:
   - `coachingData.summary` as a paragraph.
   - `coachingData.strengths` as a labelled list.
   - `coachingData.improvementAreas` as a labelled list.
   - `coachingData.nextSteps` as a labelled ordered list.
   - `coachingData.encouragement` as a paragraph.
6. Render error state: friendly message + Retry button.
7. Never use `dangerouslySetInnerHTML`.

#### Relevant Context

- All text fields from the coaching response arrive as plain strings validated
  server-side to contain no HTML tags. Rendering as text nodes is safe and
  correct.
- Existing button styles in `QuizResults.jsx`: `rounded-lg bg-[#f57328] px-6
  py-3 font-semibold text-white transition hover:bg-orange-500 focus:outline-none
  focus:ring-2 focus:ring-orange-300`.
- Loading indicator: a simple visible "Generating…" text alongside `aria-busy`
  and `aria-live="polite"` on the status region.

---

### Sub-Task 5 — Integrate `CoachingPanel` into `QuizResults.jsx`

**Status:** [ ] pending

#### Intent

Import `CoachingPanel` and render it in `QuizResults` after the Skills summary
section and before the Review your answers section. Add the four new props to
`QuizResults`'s destructuring.

#### Expected Outcomes

- `QuizResults.jsx` imports and renders `<CoachingPanel>`.
- The coaching panel appears between Skills summary and Review your answers.
- All four new props are destructured with safe defaults.
- All existing 70 tests continue to pass (the new props default to `"idle"`,
  `null`, `""`, and a no-op respectively, so existing tests that omit them are
  unaffected).

#### Todo List

1. Add `coachingStatus = "idle"`, `coachingData = null`, `coachingError = ""`,
   `onGenerateCoaching = () => {}` to the props destructuring.
2. Import `CoachingPanel`.
3. Insert `<CoachingPanel>` between the closing `</section>` of Skills summary
   and the `<div className="mt-8">` of Review your answers.
4. Run `npm test -- --watchAll=false` to confirm all 70 tests pass.

---

### Sub-Task 6 — Add tests

**Status:** [ ] pending

#### Intent

Add frontend tests for `CoachingPanel` and function tests for
`generate-coaching.js`.

#### Expected Outcomes

- A new file `src/components/CoachingPanel.test.jsx` exists with frontend tests.
- A new file `netlify/functions/generate-coaching.test.js` exists with function
  tests using inline mocks (no real IBM network calls).
- All tests pass under `npm test -- --watchAll=false`.

#### Proposed Frontend Tests (`CoachingPanel.test.jsx`)

| # | Test | Assertion |
|---|---|---|
| 1 | Idle — button renders | `getByRole("button", { name: /generate my coaching plan/i })` |
| 2 | Idle — click calls `onGenerateCoaching` | mock fn called once on click |
| 3 | Loading — button disabled | `getByRole("button").disabled === true` |
| 4 | Loading — loading text visible | text `/generating/i` in document |
| 5 | Loading — second click does not call handler again | guard tested in `Quiz.jsx` (the prop itself is a no-op when loading); button disabled prevents click |
| 6 | Success — summary rendered | `coachingData.summary` text in document |
| 7 | Success — strengths rendered | each `strengths` item in document |
| 8 | Success — nextSteps rendered | each `nextSteps` item in document |
| 9 | Success — encouragement rendered | `coachingData.encouragement` text in document |
| 10 | Error — error message rendered | `coachingError` text in document |
| 11 | Error — Retry button renders | `getByRole("button", { name: /retry/i })` |
| 12 | Error — Retry calls `onGenerateCoaching` | mock fn called once |
| 13 | Malicious HTML rendered as text | pass a `summary` containing `<script>alert(1)</script>`; assert `getByText` finds the literal string; assert no `<script>` element in document |

#### Proposed Function Tests (`generate-coaching.test.js`)

These tests exercise the function handler with mocked `fetch` and mocked
`process.env`. No real network calls are made.

| # | Test | Assertion |
|---|---|---|
| 1 | Rejects GET | returns `{ statusCode: 405 }` |
| 2 | Rejects oversized body | returns `{ statusCode: 413 }` |
| 3 | Rejects malformed JSON body | returns `{ statusCode: 400 }` |
| 4 | Rejects missing `overall` field | returns `{ statusCode: 400 }` |
| 5 | Rejects missing env vars | returns `{ statusCode: 500 }`, error body contains no key values |
| 6 | IBM auth failure | mocked IAM returns 401; handler returns `{ statusCode: 502 }` |
| 7 | Timeout | mocked generate call never resolves within timeout; returns `{ statusCode: 504 }` |
| 8 | Model returns markdown-fenced JSON | handler strips fences and returns 200 |
| 9 | Model returns non-JSON | returns `{ statusCode: 502 }` |
| 10 | Model returns wrong schema | returns `{ statusCode: 502 }` |
| 11 | Valid request returns coaching object | returns `{ statusCode: 200 }` with all five fields |
| 12 | Error response body contains no secrets | for all error cases, response body does not contain the string value of `WATSONX_API_KEY` |

Note: the function tests require a test runner that supports `require()`
(Jest as configured by CRA works for files in `src/`; for files in
`netlify/functions/` the same Jest config should apply since CRA runs Jest
globally). Confirm this or add a separate Jest config for the function.

---

## Files to Create

| File | Sub-Task | Purpose |
|---|---|---|
| `netlify.toml` | 1 | Netlify build and function configuration |
| `netlify/functions/generate-coaching.js` | 2 | Serverless proxy to Granite |
| `src/components/CoachingPanel.jsx` | 4 | Coaching panel UI component |
| `src/components/CoachingPanel.test.jsx` | 6 | Frontend tests for CoachingPanel |
| `netlify/functions/generate-coaching.test.js` | 6 | Function unit tests |

## Files to Modify

| File | Sub-Task | Change |
|---|---|---|
| `src/pages/Quiz.jsx` | 3 | Add coaching state, `generateCoaching`, reset, four new props |
| `src/components/QuizResults.jsx` | 5 | Add four new props with defaults, import and render `CoachingPanel` |
| `src/components/QuizResults.test.jsx` | 5 | Add four default props to existing `baseProps` so existing tests are unaffected |
| `.gitignore` | 3 | Add `.env.local` for local Netlify dev if not already covered (it is — already in `.gitignore`) |

---

## Verification Commands

```bash
# After Sub-Task 1 — toml parses and netlify dev starts without error
npx netlify dev --dry-run   # (requires Netlify CLI installed)

# After Sub-Task 2 — function loads; test locally
npx netlify dev             # starts local function server
curl -X POST http://localhost:8888/.netlify/functions/generate-coaching \
  -H "Content-Type: application/json" \
  -d '{"overall":{"correct":8,"total":11,"percentage":73,"passed":true},"categories":[],"missedQuestions":[]}'

# After Sub-Tasks 3–5 — all existing tests pass
npm test -- --watchAll=false

# After Sub-Task 6 — all tests pass
npm test -- --watchAll=false

# Production build still succeeds
npm run build
```

---

## Risks and Rollback

### Risk 1 — IBM API credentials not yet available

The function cannot be tested end-to-end without a valid IBM Cloud API key,
project ID, and confirmed regional URL. Sub-Tasks 1–5 can be implemented and
reviewed without credentials. Sub-Task 2's end-to-end path cannot be validated
locally until credentials are available.

**Mitigation:** Mock the IBM calls in unit tests. Test the full path manually
after credentials are available in Netlify environment variables.

### Risk 2 — Model output format varies by model version

Granite models differ in their tendency to return bare JSON versus
markdown-fenced JSON. The fence-stripping logic handles the most common case,
but the model may return JSON embedded in prose. The validation step catches
this and returns a 502 rather than passing malformed data to the frontend.

**Mitigation:** Tune the prompt's "no preamble, no explanation outside the JSON"
instruction. If a specific model version consistently produces well-formed
output, pin that version in `WATSONX_MODEL_ID`.

### Risk 3 — CRA Jest does not run files in `netlify/functions/`

CRA's Jest configuration uses `src/` as the root. Test files in
`netlify/functions/` may not be picked up automatically.

**Mitigation:** Either move function tests to `src/__tests__/functions/` (imports
the function directly) or add a `jest.config.js` that extends the CRA config
with `testMatch` patterns covering `netlify/functions/`. Confirm before Sub-Task 6.

### Risk 4 — Netlify function cold starts

Serverless functions have cold-start latency. For a coaching request that
already involves a Granite API round-trip, adding cold-start delay is
acceptable. The 20-second timeout is generous enough to accommodate this.

### Risk 5 — `public/_redirects` and `netlify.toml` redirect conflict

Adding `netlify.toml` alongside `public/_redirects` is safe — Netlify processes
both. The `/* /index.html 200` rule in `_redirects` continues to apply.
`/.netlify/functions/*` is routed automatically and does not need a redirect
rule.

**Mitigation:** Verified by inspecting Netlify's documented precedence rules.
No change to `_redirects` is needed.

### Risk 6 — No rate limiting on the function

The function currently has no per-IP or per-session rate limit. A learner (or
automated caller) could send rapid repeated requests.

**Mitigation for MVP:** The "disable button while loading" guard prevents
duplicate requests from a single browser session. Full rate limiting (e.g.
Netlify Edge Functions or a token bucket) is out of scope for the initial
implementation but should be added before production traffic ramps up.

### Rollback

All changes are confined to new files and surgical edits to `Quiz.jsx` and
`QuizResults.jsx`:

- Remove `netlify.toml` and `netlify/functions/` — no Netlify function is deployed.
- `git checkout src/pages/Quiz.jsx` — removes coaching state and prop.
- `git checkout src/components/QuizResults.jsx` — removes `CoachingPanel` import and props.
- `git rm src/components/CoachingPanel.jsx src/components/CoachingPanel.test.jsx`.

The deterministic scoring, category breakdown, and skills summary are completely
unaffected by any of these changes.
