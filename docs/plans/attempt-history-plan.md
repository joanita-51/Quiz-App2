# Attempt History — Local Storage Feature Plan

## Top-Level Overview

Add a minimal, zero-dependency localStorage feature that records each completed
quiz submission and surfaces the five most recent attempts to the learner on the
results page. No authentication, no backend, no new packages.

The work splits into four independently reviewable sub-tasks:

1. **Storage utility** — pure functions, fully unit-tested, dependency-injected
2. **Quiz.jsx integration** — save once on successful submit, hold history in state
3. **RecentAttempts component** — read-only display, accessible, mobile-safe
4. **Documentation update** — README note on browser storage

---

## Repository Findings Relevant to Integration

### submitQuiz flow (src/pages/Quiz.jsx lines 58–84)

```
submitQuiz()
  ├── Guard: unanswered questions → setError, return early
  ├── results = calculateQuizResults(questions, answers)   ← pure, deterministic
  ├── setQuizResults(results)
  ├── setShowResults(true)
  └── window.scrollTo(...)
```

The save must happen **inside** `submitQuiz`, between `calculateQuizResults` and
`setQuizResults`, so it runs exactly once per synchronous submit call and is
never triggered by a React re-render or StrictMode double-effect.

### tryAgain (src/pages/Quiz.jsx lines 167–177)

Resets `answers`, `currentQuestionIndex`, `quizResults`, `showResults`, `error`,
and all coaching state. History state must **not** be reset here.

### calculateQuizResults return shape

```
{
  totalCorrect: number,
  totalQuestions: number,
  overallPercentage: number,
  categories: [
    { categoryId, categoryName, correct, total, percentage, level, missedQuestionIds }
  ]
}
```

`missedQuestionIds` is internal scoring data and must **not** be stored.

### quiz.id

Static string `"ai-web-development-fundamentals"` exported from
`src/data/questions.js` as `quiz.id`. Already imported in Quiz.jsx.

### QuizResults.jsx section order (top to bottom)

1. Overall result card + Try Again button
2. Skills breakdown (categories)
3. Skills summary
4. CoachingPanel
5. Review your answers

**Recent attempts** belongs below "Review your answers" — it is history, not
part of the current result, and placing it last keeps the critical result
information prominent.

### Existing utils directory

Only `calculateQuizResults.js` and its test file. New file goes alongside them.

---

## Final Storage Schema

```
localStorage key: "quizote.attempts.v1"
value: JSON-serialized array, newest first, maximum 5 items

Attempt object:
{
  id:          string,   // crypto.randomUUID() or fallback
  quizId:      string,   // quiz.id — "ai-web-development-fundamentals"
  completedAt: string,   // ISO 8601 UTC — new Date(now).toISOString()
  overall: {
    correct:    number,
    total:      number,
    percentage: number,
    passed:     boolean
  },
  categories: [
    {
      id:         string,   // categoryId from calculateQuizResults
      name:       string,   // categoryName
      correct:    number,
      total:      number,
      percentage: number,
      level:      string    // "Strong"|"Developing"|"Needs improvement"|"Not assessed"
    }
  ]
}
```

**Not stored:** `missedQuestionIds`, `answers`, question/option text,
coaching requests or responses, API credentials, personal information.

---

## Storage Utility Interface

**File:** `src/utils/attemptStorage.js`

```js
export const ATTEMPT_STORAGE_KEY = "quizote.attempts.v1";
export const MAX_ATTEMPTS = 5;

/**
 * Generates a unique attempt ID.
 * Uses crypto.randomUUID() where available; falls back to a
 * Date.now() + random hex string that does NOT use the timestamp alone.
 */
export function generateId()

/**
 * Builds a storable attempt record from quiz result data.
 * Pure function — accepts an optional `now` and `id` for testability.
 *
 * @param {{ quizId, quizResults, passingPercentage, now?: number, id?: string }}
 * @returns {AttemptRecord}
 */
export function createAttemptRecord({ quizId, quizResults, passingPercentage, now, id })

/**
 * Reads stored attempts from localStorage.
 * Returns [] on any failure (unavailable, parse error, not an array).
 * Accepts an optional storage object (default: window.localStorage) for testing.
 */
export function loadAttempts(storage = window.localStorage)

/**
 * Validates that a value is a well-shaped attempt record.
 * Returns true only if all required fields are present and typed correctly.
 * Missing `categories` fields from older data are tolerated by
 * requiring at minimum { id, quizId, completedAt, overall }.
 */
export function isValidAttempt(value)

/**
 * Prepends `attempt` to the stored list, deduplicates by ID,
 * keeps newest MAX_ATTEMPTS, and persists the result.
 * Returns the saved array, or returns the existing array unchanged on
 * any write failure (quota, security, unavailable).
 * Accepts an optional storage object for testing.
 */
export function saveAttempt(attempt, storage = window.localStorage)
```

The `storage` parameter on `loadAttempts` and `saveAttempt` is a duck-typed
object with `getItem(key)` and `setItem(key, value)` — any object with those
two methods works, making mock injection trivial in tests without sinon or
module-mocking.

---

## Sub-Task 1 — Storage Utility

**Status:** [ ] pending

### Intent
Create `src/utils/attemptStorage.js` with the interface above and a matching
test file. No component changes yet.

### Expected Outcomes
- Five exported functions with documented contracts.
- Test file covering all 14 utility scenarios from the test plan below.
- Zero changes to any existing file.

### Todo List
1. Create `src/utils/attemptStorage.js`.
2. Implement `generateId` — try `crypto.randomUUID()`, fall back to
   `Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10)`.
3. Implement `createAttemptRecord` — maps `quizResults` fields to the stored
   schema; uses `quizResults.overallPercentage >= passingPercentage` for
   `overall.passed`; strips `missedQuestionIds` from categories; accepts
   optional `now` and `id` overrides.
4. Implement `loadAttempts` — `try/catch` around `getItem` + `JSON.parse`;
   return `[]` on any falsy result, parse error, or non-array.
5. Implement `isValidAttempt` — checks id (string), quizId (string),
   completedAt (string), overall (object with correct/total/percentage/passed).
6. Implement `saveAttempt` — load existing, prepend new, deduplicate by id,
   slice to MAX_ATTEMPTS, `try/catch` around `setItem`; return saved array on
   success, existing array on write failure.
7. Create `src/utils/attemptStorage.test.js` and write all tests (see test plan).
8. Run `npm test -- --watchAll=false` and confirm all pass.

### Relevant Context
- `calculateQuizResults` return shape: `totalCorrect`, `totalQuestions`,
  `overallPercentage`, `categories[]` (each with `categoryId`, `categoryName`,
  `correct`, `total`, `percentage`, `level`, `missedQuestionIds`).
- Existing test pattern: Jest `describe`/`test`/`beforeEach`, inline fixtures.
- `quiz.passingPercentage` = 70 (from `src/data/questions.js`).

---

## Sub-Task 2 — Quiz.jsx Integration

**Status:** [ ] pending

### Intent
Wire `saveAttempt` into `submitQuiz` (synchronously, after `calculateQuizResults`)
and hold the returned history in a new state variable. `tryAgain` must not clear
history state.

### Expected Outcomes
- One attempt is saved per successful submission.
- History state persists across Try Again cycles.
- All existing behaviour (validation, coaching, scoring) unchanged.
- No new React effect added.

### Todo List
1. Import `createAttemptRecord`, `saveAttempt` from `../utils/attemptStorage`.
2. Import `quiz` from `../data/questions` (already imported).
3. Add state: `const [attemptHistory, setAttemptHistory] = useState([])`.
4. Inside `submitQuiz`, **after** `calculateQuizResults` and **before**
   `setQuizResults`, add:
   ```
   const attempt = createAttemptRecord({
     quizId: quiz.id,
     quizResults: results,
     passingPercentage: quiz.passingPercentage,
   });
   const history = saveAttempt(attempt);
   setAttemptHistory(history);
   ```
5. Do **not** touch `tryAgain` — `attemptHistory` is not in its reset list.
6. Pass `attemptHistory` as a new prop to `<QuizResults>`:
   `attemptHistory={attemptHistory}`.
7. Run `npm test -- --watchAll=false` to confirm existing tests still pass.

### Relevant Context
- `submitQuiz` is at lines 58–84 of `src/pages/Quiz.jsx`.
- `tryAgain` is at lines 167–177; do not modify it.
- `<QuizResults>` is rendered at lines 202–216 with all current props preserved.
- `saveAttempt` catches all storage failures and returns the existing array
  unchanged — so a storage failure can never throw out of `submitQuiz`.

---

## Sub-Task 3 — RecentAttempts Component and QuizResults Wiring

**Status:** [ ] pending

### Intent
Create a small, self-contained `RecentAttempts` component and add it as the
last section in `QuizResults`.

### Expected Outcomes
- A "Recent attempts" heading, privacy note, and attempt list appear below
  "Review your answers".
- The current attempt is always visible as the first entry (newest-first).
- Maximum 5 entries shown.
- Empty/unavailable state shows nothing (the section is absent, not broken).
- Pass/fail communicated by text, not colour alone.
- Accessible heading, list markup, and readable date strings.

### UI Design

```
── Recent attempts ──────────────────────────────────
Attempts are saved only in this browser.

• 15 Jan 2025, 14:32  ·  8 of 11  ·  73%  ·  Passed
• 14 Jan 2025, 09:10  ·  6 of 11  ·  55%  ·  Not passed
...
```

**Category summary:** Omitted from this MVP. Each attempt row shows
overall score and pass/fail only — category breakdown adds little in the
small-screen list context and can be added later.

**Clear history:** Deferred. The current MVP has no sensitive information
to clear, a single storage key with five entries is a negligible footprint,
and a confirmation flow would add scope disproportionate to the value.
The localStorage key is named and documented, so a user can clear it from
dev tools. Revisit in a later increment.

### Todo List
1. Create `src/components/RecentAttempts.jsx`.
   - Props: `attempts` (array, default `[]`).
   - If `attempts.length === 0`, return `null`.
   - Render an `<h2>` "Recent attempts" (consistent with other h2s in
     QuizResults).
   - Render privacy note: `<p>Attempts are saved only in this browser.</p>`.
   - Render an `<ol>` (ordered, newest-first) with one `<li>` per attempt.
   - Each `<li>`: formatted date, score `"N of T correct"`, percentage,
     pass/fail label.
   - Date formatting: use `new Date(attempt.completedAt).toLocaleString()`
     — no extra library needed.
   - Pass/fail label: plain text `"Passed"` / `"Not passed"` with an
     appropriate `aria-label` or visually hidden prefix if colour is used.
   - Cap at 5 entries with `.slice(0, 5)`.
2. Add `attemptHistory = []` default prop to `QuizResults`.
3. Render `<RecentAttempts attempts={attemptHistory} />` after the
   "Review your answers" `</div>` block (line 293 in QuizResults.jsx).
4. Create `src/components/RecentAttempts.test.jsx` (see test plan).
5. Run `npm test -- --watchAll=false` and `npm run build`.

### Relevant Context
- QuizResults section order ends with the answer-review `<div>` closing
  at line 293, then `</section>` at line 294. New section goes between them.
- All existing `h2` headings in QuizResults use class
  `"text-2xl font-bold text-[#10316B]"` — match that for consistency.
- Existing test file for QuizResults is at
  `src/components/QuizResults.test.jsx`; do not break existing tests.

---

## Sub-Task 4 — Documentation

**Status:** [ ] pending

### Intent
Add a short, accurate note to README.md explaining the browser-only storage.

### Expected Outcomes
- README contains a "Attempt history" section covering: localStorage, browser
  scope, no synchronisation, and how to clear.

### Todo List
1. Locate the README.md (workspace root).
2. Add a section (after the existing feature description, before deployment
   or contributing notes): **Attempt history** — four-sentence paragraph
   covering: stored in localStorage; data stays in that browser only;
   clearing browser storage removes history; no account or synchronisation.
3. No code changes needed.

---

## Detailed Test Plan

### Utility tests — `src/utils/attemptStorage.test.js`

All use an injected mock storage object:
```js
function makeStorage(initial = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_, v) => { value = v; },
  };
}
```

| # | Scenario | Assertion |
|---|----------|-----------|
| 1 | Empty storage (`getItem` returns `null`) | `loadAttempts` returns `[]` |
| 2 | Valid array of one attempt | `loadAttempts` returns that attempt |
| 3 | `getItem` throws (SecurityError) | `loadAttempts` returns `[]` |
| 4 | Stored value is malformed JSON | `loadAttempts` returns `[]` |
| 5 | Stored value is a JSON object, not array | `loadAttempts` returns `[]` |
| 6 | Stored array contains one invalid entry | `loadAttempts` returns `[]` (invalid entries filtered) |
| 7 | `saveAttempt` on empty storage | Result has 1 entry; entry matches the attempt |
| 8 | `saveAttempt` adds newest first | Result[0] is the new attempt |
| 9 | `saveAttempt` deduplicates by id | Duplicate id → only one entry in result |
| 10 | Six saves → only five kept | `result.length === 5`; oldest dropped |
| 11 | `setItem` throws (QuotaExceededError) | `saveAttempt` returns existing array without throwing |
| 12 | `createAttemptRecord` with fixed `now` and `id` | `completedAt` matches ISO string; `id` matches provided id; `overall.passed` correct; categories strip `missedQuestionIds` |
| 13 | `createAttemptRecord` does not mutate input | Input categories array unchanged after call |
| 14 | `generateId` returns a non-empty string | Result is truthy string; calling twice gives different values |

**`crypto.randomUUID` fallback:** If `crypto.randomUUID` is not a function in
the Jest environment (jsdom), the fallback branch runs automatically — the
"generateId returns a non-empty string" test exercises it without any mocking.

### Component / integration tests

**`src/components/RecentAttempts.test.jsx`**

| # | Scenario | Assertion |
|---|----------|-----------|
| 1 | `attempts=[]` | Component renders nothing (null) |
| 2 | One attempt passed | Shows "Recent attempts" heading |
| 3 | One attempt passed | Shows privacy note text |
| 4 | One attempt | Score "N of T correct" visible |
| 5 | One attempt | Percentage visible |
| 6 | Passed attempt | "Passed" text visible |
| 7 | Not-passed attempt | "Not passed" text visible |
| 8 | Date rendered | `completedAt` ISO string → human-readable text visible |
| 9 | Six attempts passed | Only 5 list items rendered |

**`src/components/QuizResults.test.jsx` additions**

| # | Scenario | Assertion |
|---|----------|-----------|
| 10 | `attemptHistory=[]` (default) | "Recent attempts" section absent |
| 11 | `attemptHistory` with one entry | "Recent attempts" heading present |

**`src/pages/Quiz.jsx` integration** — via existing test patterns or new smoke test

| # | Scenario | Assertion |
|---|----------|-----------|
| 12 | Complete submission | `saveAttempt` called once |
| 13 | Incomplete submission (not all answered) | `saveAttempt` not called |
| 14 | Try Again after submit | `attemptHistory` still contains prior entry |

> Note: Quiz.jsx is a page-level component with no dedicated test file today.
> A lightweight smoke test covering save-once and Try Again can be added, or
> the utility tests can stand in for integration coverage. Decide during
> implementation.

---

## Privacy and Accessibility Considerations

### Privacy
- Storage key `quizote.attempts.v1` is namespaced to avoid collision.
- Only aggregate scores are stored — no question text, no answer choices,
  no AI responses, no identifiers beyond a random attempt ID.
- Privacy note is **visible in the UI**, not only in documentation.
- README documents how to clear the data.

### Accessibility
- "Recent attempts" uses an `<h2>` element to match the heading hierarchy
  already used in QuizResults (`<h2>` for "Review your answers" etc.).
- Pass/fail communicated with text (`"Passed"` / `"Not passed"`), not colour.
- Attempt list uses `<ol>` with each attempt as `<li>` — semantic list markup.
- Date strings are plain text rendered in a `<time>` element where practical.
- No `aria-live` region needed: the list is rendered synchronously as part of
  the results page mount; it is not dynamically updated after the user sees it.
- Keyboard navigation is unaffected (no interactive elements added in this MVP).

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/utils/attemptStorage.js` | Storage utility — pure functions |
| `src/utils/attemptStorage.test.js` | 14 utility unit tests |
| `src/components/RecentAttempts.jsx` | Read-only attempts list component |
| `src/components/RecentAttempts.test.jsx` | 9 component tests |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Quiz.jsx` | Import utility; save attempt in `submitQuiz`; add `attemptHistory` state; pass prop to `<QuizResults>` |
| `src/components/QuizResults.jsx` | Accept `attemptHistory` prop; render `<RecentAttempts>` after answer review |
| `README.md` | Add "Attempt history" paragraph |

---

## Verification Commands

Run after each sub-task:
```bash
npm test -- --watchAll=false
```

Run after Sub-Task 3:
```bash
npm run build
```

Full verification (all sub-tasks complete):
```bash
npm test -- --watchAll=false && npm run build
```

Expected: all existing tests plus new tests pass; build compiles with no
new errors.

---

## Risks and Rollback

| Risk | Mitigation |
|------|------------|
| `saveAttempt` throws in an environment without localStorage | Full `try/catch` in utility; quiz flow is unaffected |
| React 18 StrictMode double-call of `submitQuiz` | Save is synchronous inside the event handler, not an effect — StrictMode does not double-fire event handlers |
| Stored attempt ID collision | Deduplication by ID in `saveAttempt` ensures no duplicates even if two calls share an ID |
| Malformed data in storage from a future format change | `isValidAttempt` filter in `loadAttempts` drops invalid entries silently; UI shows `[]` |
| `QuizResults` prop change breaks existing tests | `attemptHistory` has a default of `[]`; existing tests that do not pass it continue to pass without modification |

**Rollback:** All changes are isolated to new files and additive changes to
two existing components. To revert: delete the four new files and remove the
five touched lines in `Quiz.jsx` and `QuizResults.jsx`. No schema migrations,
no database, no dependency changes.
