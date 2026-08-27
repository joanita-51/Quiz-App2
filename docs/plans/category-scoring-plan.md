# Category Scoring Plan

**Status:** Implemented and verified.

## Top-Level Overview

The category-normalisation task established a registry of four approved
categories and remapped all 11 questions. This plan adds category-level scoring
on top of the existing flat score, without redesigning the results interface.

The work has three sub-tasks:

1. **Create `calculateQuizResults`** — a pure utility function in a new
   `src/utils/` directory that derives both the flat score and per-category
   breakdowns from `questions` and `answers`.

2. **Integrate into `Quiz.jsx`** — replace the hand-written `reduce` in
   `submitQuiz` with a call to `calculateQuizResults`, store the structured
   result object in state, and pass the relevant fields to `QuizResults`.

3. **Add unit tests** — a new test file
   `src/utils/calculateQuizResults.test.js` covering all specified scenarios
   including exact skill-level boundaries.

`QuizResults.jsx` receives two new props (`categoryResults` and
`totalQuestions` already exists) but **renders no new UI** — the category data
is present in the props and ready for the future category-cards stage.
Existing UI output is preserved exactly.

---

## Design Decision: `getSkillLevel` as an Exported Helper

**Recommendation: export `getSkillLevel` as a named function from
`calculateQuizResults.js` and test it directly.**

Rationale:

- The real question set has categories of 2 and 5 questions. That makes it
  impossible to produce boundary percentages of 49%, 50%, or 79% organically
  (2 questions can only yield 0%, 50%, 100%; 5 questions yields 0%, 20%, 40%,
  60%, 80%, 100%).
- Testing `getSkillLevel` indirectly through `calculateQuizResults` would
  require synthetic fixtures with contrived question counts (e.g. 100 questions
  per category). Those fixtures are large, fragile, and obscure the intent.
- A standalone exported helper takes a single integer and returns a string.
  Its tests are one line each. The intent is immediate.
- The alternative — making it a private inner function — saves one export but
  forces all boundary tests to carry synthetic fixture scaffolding.

`getSkillLevel(percentage)` accepts a rounded integer and returns one of four
strings. It is exported from the same file as `calculateQuizResults` and tested
in the same test file in a dedicated `describe` block.

---

## Function Signatures

### `getSkillLevel(percentage)`

```
Input:  percentage — integer, 0–100 (or exactly 0 when total is 0)
Output: string — one of:
          "Strong"           when percentage >= 80
          "Developing"       when percentage >= 50 and < 80
          "Needs improvement" when percentage > 0 and < 50
          "Not assessed"     when percentage === 0 AND the caller passes
                             total === 0 (see note in calculateQuizResults)
```

Note: `getSkillLevel` itself only receives the percentage integer. The "Not
assessed" case is handled by `calculateQuizResults` before calling
`getSkillLevel` — if a category has zero questions, the level is set to
`"Not assessed"` without calling `getSkillLevel` at all. `getSkillLevel` is
therefore only called with meaningful percentages and its boundary logic is:

- `>= 80` → "Strong"
- `>= 50` → "Developing"
- `< 50`  → "Needs improvement"

### `calculateQuizResults(questions, answers)`

```
Input:
  questions — array of question objects (shape from src/data/questions.js)
  answers   — plain object, keys are question IDs, values are selected option IDs
              (may be missing keys for unanswered questions)

Output: {
  totalCorrect:      number   — count of questions answered correctly
  totalQuestions:    number   — questions.length
  overallPercentage: number   — Math.round(totalCorrect / totalQuestions * 100)
  categories: [               — one entry per registry category, in registry order
    {
      categoryId:        string  — matches a CATEGORY_IDS value
      categoryName:      string  — displayName from the categories registry
      correct:           number  — count answered correctly in this category
      total:             number  — count of questions in this category
      percentage:        number  — Math.round(correct / total * 100), or 0 if total === 0
      level:             string  — from getSkillLevel, or "Not assessed" if total === 0
      missedQuestionIds: string[] — IDs of questions answered wrongly or not answered
    }
  ]
}
```

The function iterates over `categories` (imported from `src/data/categories.js`)
to guarantee registry ordering and that all four categories always appear,
even if no questions belong to one.

It does not mutate `questions`, `answers`, or `categories`.

---

## Proposed Result State Shape in `Quiz.jsx`

Currently `Quiz.jsx` holds:

```js
const [score, setScore] = useState(0);
```

After this change it holds:

```js
const [quizResults, setQuizResults] = useState(null);
```

`null` represents "not yet submitted". When `showResults` is `true`,
`quizResults` is guaranteed to be the structured object returned by
`calculateQuizResults`.

The derived values that are currently computed directly in `Quiz.jsx` move into
`calculateQuizResults` and are read from `quizResults`:

| Was in Quiz.jsx | Now comes from |
|---|---|
| `score` state | `quizResults.totalCorrect` |
| `resultPercentage` computed from `score` | `quizResults.overallPercentage` |

`quiz.passingPercentage` is still read from the quiz metadata in `Quiz.jsx`
and passed as a prop — it is not part of the results object.

---

## Sub-Tasks

---

### Sub-Task 1 — Create `src/utils/calculateQuizResults.js`

**Status:** [ ] pending

#### Intent

Isolate all scoring derivation into a pure, importable function. Pure means:
no React, no state, no side effects — input in, object out. This makes the
logic independently testable without rendering any component.

#### Expected Outcomes

- A new file `src/utils/calculateQuizResults.js` exists.
- It exports two named functions: `getSkillLevel` and `calculateQuizResults`.
- `calculateQuizResults` returns the exact shape specified above.
- Neither function mutates its inputs.
- No React import. No component code.

#### Todo List

1. Create the directory `src/utils/` and the file
   `src/utils/calculateQuizResults.js`.
2. Implement `getSkillLevel(percentage)`:
   - `>= 80` → `"Strong"`
   - `>= 50` → `"Developing"`
   - `< 50`  → `"Needs improvement"`
3. Implement `calculateQuizResults(questions, answers)`:
   a. Import `categories` from `../data/categories`.
   b. Compute `totalCorrect` and `totalQuestions` from the questions array.
      An unanswered question (`answers[q.id]` is `undefined` or missing) is
      counted as incorrect.
   c. Compute `overallPercentage`.
   d. Build the `categories` array by iterating over the imported `categories`
      registry (this guarantees order and completeness):
      - For each registry entry, filter `questions` to those belonging to
        `category.id`.
      - Count `correct` and `total`.
      - Compute `percentage` (0 if `total === 0`).
      - Set `level` to `"Not assessed"` if `total === 0`; otherwise call
        `getSkillLevel(percentage)`.
      - Collect `missedQuestionIds`: question IDs where
        `answers[q.id] !== q.correctOptionId` (covers both wrong and
        unanswered).
   e. Return the complete object.
4. Export both functions as named exports.
5. Do not import anything from React or from any component file.

#### Relevant Context

- `src/data/categories.js` — `categories` array gives registry order and
  `displayName` values. Import `categories` (not `CATEGORY_IDS`) for iteration.
- `src/data/questions.js` — question shape: `{ id, category, correctOptionId,
  options, prompt, explanation, difficulty }`.
- No `src/utils/` directory exists yet — it must be created.

---

### Sub-Task 2 — Integrate `calculateQuizResults` into `Quiz.jsx`

**Status:** [x] done

#### Intent

Replace the hand-written `reduce` in `submitQuiz` with a call to
`calculateQuizResults`. Replace the `score` state variable with a `quizResults`
state variable that holds the full structured result. Preserve all existing
behaviour: incomplete-submission guard, `tryAgain` reset, scroll-to-top, and
`showResults` flag.

#### Expected Outcomes

- `Quiz.jsx` calls `calculateQuizResults(questions, answers)` exactly once, at
  submission time, after the unanswered-question guard has passed.
- `quizResults` state is `null` at mount and after `tryAgain`.
- `QuizResults` receives updated props (see Prop Changes below).
- The overall percentage, pass/fail message, score count, and answer-review list
  all render identically to before.
- The existing 13 tests continue to pass.

#### Quiz.jsx Integration Steps

1. Add import: `import { calculateQuizResults } from "../utils/calculateQuizResults";`
2. Replace `const [score, setScore] = useState(0);` with
   `const [quizResults, setQuizResults] = useState(null);`
3. Remove the `resultPercentage` derived variable (it is now
   `quizResults.overallPercentage`).
4. In `submitQuiz`, replace the `finalScore` reduce block and `setScore` call
   with:
   ```
   const results = calculateQuizResults(questions, answers);
   setQuizResults(results);
   ```
   Keep the unanswered-question guard above it unchanged.
5. In `tryAgain`, replace `setScore(0)` with `setQuizResults(null)`.
6. Update the `<QuizResults>` JSX to pass the new and changed props (see below).
   `showResults` and `setShowResults` are unchanged.

#### QuizResults Prop Changes

Current props passed from `Quiz.jsx`:

```
questions         — unchanged
answers           — unchanged
score             — was from score state
totalQuestions    — unchanged (questions.length)
resultPercentage  — was derived from score state
passingPercentage — unchanged (quiz.passingPercentage)
onTryAgain        — unchanged
```

Updated props passed from `Quiz.jsx`:

```
questions         — unchanged
answers           — unchanged
score             — quizResults.totalCorrect
totalQuestions    — quizResults.totalQuestions
resultPercentage  — quizResults.overallPercentage
passingPercentage — unchanged (quiz.passingPercentage)
onTryAgain        — unchanged
categoryResults   — quizResults.categories  [NEW — not yet rendered]
```

`QuizResults.jsx` receives `categoryResults` in its props destructuring but
does not render it yet. Adding the prop now means the next stage (adding
category cards) only touches `QuizResults.jsx` and nothing in `Quiz.jsx`.

#### Relevant Context

- `Quiz.jsx` current state variables: `answers`, `currentQuestionIndex`,
  `score`, `showResults`, `error` — `score` is the only one being replaced.
- `resultPercentage` at line 24 is currently `Math.round((score / questions.length) * 100)`.
  After this change it becomes `quizResults?.overallPercentage ?? 0` — or it
  is simply removed and `quizResults.overallPercentage` is passed directly
  to the prop at render time (preferred, since `quizResults` is non-null when
  `showResults` is true).
- The incomplete-submission guard at lines 56–73 reads only `answers` and
  `questions` — it is completely unaffected.

---

### Sub-Task 3 — Add unit tests for `calculateQuizResults`

**Status:** [x] done

#### Intent

Verify the function's correctness across all specified scenarios without
rendering any React component. Tests are pure JavaScript — no
`@testing-library/react` needed.

#### Expected Outcomes

- A new file `src/utils/calculateQuizResults.test.js` exists.
- All new tests pass under `npm test -- --watchAll=false`.
- All 13 existing tests continue to pass.
- Total passing tests after this sub-task: 13 + (count from below).

#### Fixtures

All fixtures are defined inline at the top of the test file. No imports from
`src/data/questions.js` or real question data.

**Minimal question shape required:**
`{ id, category, correctOptionId, options: [{ id }] }`
(`prompt`, `explanation`, `difficulty` are not read by `calculateQuizResults`
and are omitted from fixtures.)

**Standard fixture set — four questions, one per category:**

```
qWF   — id: "q-wf",  category: "web-fundamentals",  correctOptionId: "correct"
qRS   — id: "q-rs",  category: "react-state",        correctOptionId: "correct"
qTD   — id: "q-td",  category: "testing-debugging",  correctOptionId: "correct"
qRAI  — id: "q-rai", category: "responsible-ai",     correctOptionId: "correct"

Each has options: [{ id: "correct" }, { id: "wrong" }]
```

**allCorrectAnswers:** `{ "q-wf": "correct", "q-rs": "correct", "q-td": "correct", "q-rai": "correct" }`
**allWrongAnswers:**   `{ "q-wf": "wrong",   "q-rs": "wrong",   "q-td": "wrong",   "q-rai": "wrong" }`
**emptyAnswers:**      `{}`

#### `describe` blocks and test cases

---

**`describe("getSkillLevel")`** — 5 tests, testing the exported helper directly:

| Test name | Input | Expected output |
|---|---|---|
| returns Strong at 80 | 80 | "Strong" |
| returns Strong at 100 | 100 | "Strong" |
| returns Developing at 50 | 50 | "Developing" |
| returns Developing at 79 | 79 | "Developing" |
| returns Needs improvement at 49 | 49 | "Needs improvement" |
| returns Needs improvement at 0 | 0 | "Needs improvement" |

Note: 6 tests are listed but they fit naturally as 6 single-line assertions.
Group them under one `describe` block.

---

**`describe("calculateQuizResults")`** — grouped by scenario:

**Scenario A — all correct (1 question per category):**
- `totalCorrect` is 4
- `totalQuestions` is 4
- `overallPercentage` is 100
- Each category: `correct` 1, `total` 1, `percentage` 100, `level` "Strong"
- No `missedQuestionIds` in any category

**Scenario B — all wrong:**
- `totalCorrect` is 0
- `overallPercentage` is 0
- Each category: `correct` 0, `percentage` 0, `level` "Needs improvement"
- Every question ID appears in its category's `missedQuestionIds`

**Scenario C — mixed answers across all four categories:**
Fixture: same four questions.
Answers: correct for `q-wf` and `q-rs`, wrong for `q-td` and `q-rai`.
- `totalCorrect` is 2, `overallPercentage` is 50
- `web-fundamentals`: correct 1, percentage 100, level "Strong"
- `react-state`: correct 1, percentage 100, level "Strong"
- `testing-debugging`: correct 0, percentage 0, level "Needs improvement",
  `missedQuestionIds` contains "q-td"
- `responsible-ai`: correct 0, percentage 0, level "Needs improvement",
  `missedQuestionIds` contains "q-rai"

**Scenario D — unanswered question counted as incorrect:**
Fixture: same four questions.
Answers: correct for `q-wf`, `q-rs`, `q-td` — `q-rai` not present in answers.
- `totalCorrect` is 3
- `responsible-ai` category: correct 0, percentage 0, level "Needs improvement"
- `responsible-ai` `missedQuestionIds` contains "q-rai"

**Scenario E — registered category with no questions:**
Fixture: only `qWF` (one web-fundamentals question). No question for the other
three categories.
Answers: `{ "q-wf": "correct" }`.
- `categories` array still has 4 entries.
- `react-state` entry: `correct` 0, `total` 0, `percentage` 0,
  `level` "Not assessed", `missedQuestionIds` is empty array.
- Other absent categories have the same shape.

**Scenario F — category order matches registry:**
Using the standard four-question fixture (any answers).
Assert that `result.categories.map(c => c.categoryId)` equals
`["web-fundamentals", "react-state", "testing-debugging", "responsible-ai"]`
in that exact order.

**Scenario G — display names come from registry:**
Using the standard four-question fixture.
Assert that `result.categories.map(c => c.categoryName)` equals
`["Web Fundamentals", "React and State", "Testing and Debugging",
"Responsible AI Coding"]`.

**Scenario H — no input mutation:**
Freeze the inputs with `Object.freeze()` before calling the function.
Assert that the function does not throw (a mutation attempt on a frozen object
throws in strict mode).
Use `Object.freeze(questions)` and `Object.freeze(answers)` as the inputs.
Note: `Object.freeze` is shallow; freezing the top-level array and object is
sufficient to catch accidental array push/sort or object property assignment.

---

### Skill-level boundary note

The six `getSkillLevel` tests cover 0, 49, 50, 79, 80, 100 directly because
`getSkillLevel` is exported. No large synthetic fixture is needed. The
`calculateQuizResults` tests verify that the level field is populated correctly
in real scoring scenarios (0%, 100%) and confirm the end-to-end wiring, but
the boundary precision is owned by `getSkillLevel`'s own tests.

---

## Files to Create

| File | Sub-Task | Purpose |
|---|---|---|
| `src/utils/calculateQuizResults.js` | 1 | Pure scoring utility — `getSkillLevel` and `calculateQuizResults` |
| `src/utils/calculateQuizResults.test.js` | 3 | Unit tests for the utility |

## Files to Modify

| File | Sub-Task | Changes |
|---|---|---|
| `src/pages/Quiz.jsx` | 2 | Replace `score` state with `quizResults` state; call `calculateQuizResults`; update props passed to `QuizResults` |
| `src/components/QuizResults.jsx` | 2 | Add `categoryResults` to props destructuring; do not render it yet |

## Files Not Changed

`src/data/questions.js`, `src/data/categories.js`, `src/data/questions.test.js`,
`src/App.js`, `src/App.test.js`, `src/components/QuizResults.test.jsx`,
`src/pages/Landing.jsx`, all dashboard scaffold files, `package.json`.

---

## Verification Commands

```bash
# After Sub-Task 1 — utility file parses and exports resolve
# (verified implicitly by Sub-Task 3 tests; no node CJS runner needed)

# After Sub-Task 2 — existing tests still pass; visual check of quiz flow
npm test -- --watchAll=false
npm start   # complete a quiz, verify results screen is identical

# After Sub-Task 3 — all tests pass
npm test -- --watchAll=false

# Final build check
npm run build
```

---

## Risks and Rollback

### Risk 1 — `quizResults` is `null` when `showResults` is true

If `setQuizResults` is not called before `setShowResults(true)`, the
`QuizResults` component will receive `null` values and throw. The fix is
that both calls happen in the same synchronous block in `submitQuiz`, in the
order: `setQuizResults(results)` then `setShowResults(true)`. React batches
these in the same render, so they are always consistent.

**Mitigation:** The existing `QuizResults.test.jsx` tests will catch missing
props if the signature change breaks any of the 7 existing unit tests.

### Risk 2 — `tryAgain` must reset `quizResults` to `null`

After extraction, `tryAgain` calls `setScore(0)`. That line must become
`setQuizResults(null)`. If left as `setScore` referencing a removed state
variable, the app throws immediately on click.

**Mitigation:** Sub-Task 2 todo list step 5 is explicit about this.

### Risk 3 — `QuizResults.jsx` receives `categoryResults` before it uses it

Adding a prop that is not yet destructured in `QuizResults.jsx` would be a
silent no-op. The plan requires adding `categoryResults` to the destructuring
in Sub-Task 2 so the prop contract is established even though the value is not
rendered. If this step is skipped, the next stage works fine — it just adds
the destructuring then. This risk has no user-facing impact.

### Risk 4 — `calculateQuizResults` boundary at exactly 0%

A category with questions but all wrong produces `percentage: 0`. This should
receive `level: "Needs improvement"`, not `"Not assessed"`. The distinction
is: `"Not assessed"` is reserved for `total === 0`. The implementation must
check `total === 0` before checking percentage. Scenario E in the tests
explicitly covers this.

### Rollback

All changes are confined to new files and surgical edits to `Quiz.jsx` and
`QuizResults.jsx`:

- Sub-Task 1: `git rm src/utils/calculateQuizResults.js` — removes the utility.
- Sub-Task 2: `git checkout src/pages/Quiz.jsx src/components/QuizResults.jsx`
  restores both files to the pre-task state.
- Sub-Task 3: `git rm src/utils/calculateQuizResults.test.js` — removes the
  tests.

None of the changes affect `questions.js`, `categories.js`, routing, or
dependencies.
