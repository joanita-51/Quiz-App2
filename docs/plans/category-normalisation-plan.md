# Category Normalisation Plan

**Status:** Implemented and verified.

## Top-Level Overview

Ten questions in `src/data/questions.js` each carry a granular `category` string
chosen when the question was written. Those strings (e.g. `"javascript"`,
`"ai-code-review"`, `"version-control"`) do not match the four assessment
categories required for category-level scoring.

This plan normalises the data in two steps:

1. **Create a category registry** — a new file `src/data/categories.js` that is
   the single source of truth for the four approved category IDs, display names,
   and descriptions.

2. **Remap every question** — update the `category` field on each question in
   `src/data/questions.js` to one of the four approved IDs and add one new
   question to bring `react-state` to a minimum of two questions.

3. **Add data-validation tests** — a new test file
   `src/data/questions.test.js` that asserts structural and referential integrity
   of the question data against the registry.

No scoring logic is implemented. No components are changed. No dependencies are
added or upgraded.

---

## Approved Category Registry

| ID | Display name | Short description |
|---|---|---|
| `web-fundamentals` | Web Fundamentals | HTML, JavaScript, and application structure |
| `react-state` | React and State | Managing answers and changing interface state |
| `testing-debugging` | Testing and Debugging | Finding errors and verifying generated code |
| `responsible-ai` | Responsible AI Coding | Security, accessibility, Git, and AI reliability |

---

## Proposed Question-to-Category Mapping

| ID | Shortened prompt | Current category | New category | Reason |
|---|---|---|---|---|
| q1 | Primary role of HTML | `web-fundamentals` | `web-fundamentals` | Unchanged — canonical HTML knowledge |
| q2 | What JavaScript is used for | `javascript` | `web-fundamentals` | JavaScript is a core web-layer technology alongside HTML |
| q3 | Where to store selected answers in React | `react` | `react-state` | Directly tests React component state knowledge |
| q4 | AI generates score-on-click bug — best fix | `debugging` | `testing-debugging` | Diagnosing and correcting a logic bug in generated code |
| q5 | What to do before using AI-generated code | `ai-code-review` | `responsible-ai` | Reviewing AI output responsibly before deployment |
| q6 | AI places API key in React component | `security` | `responsible-ai` | Security harm caused by unreviewed AI-generated code |
| q7 | Most important test for quiz scoring logic | `testing` | `testing-debugging` | Selecting the correct test for a specific logic concern |
| q8 | Why create small descriptive Git commits | `version-control` | `responsible-ai` | Git discipline is listed under Responsible AI Coding topic |
| q9 | How to connect a label to a radio input | `accessibility` | `responsible-ai` | Accessibility is listed under Responsible AI Coding topic |
| q10 | What to do if AI service is unavailable | `ai-reliability` | `responsible-ai` | AI reliability and graceful degradation |
| q11 | NEW — second React and State question | — | `react-state` | `react-state` has only 1 question; 1 is below minimum floor |

### Category counts after remapping

| Category | Count | Question IDs |
|---|---|---|
| `web-fundamentals` | 2 | q1, q2 |
| `react-state` | 2 | q3, q11 |
| `testing-debugging` | 2 | q4, q7 |
| `responsible-ai` | 5 | q5, q6, q8, q9, q10 |
| **Total** | **11** | |

### Distribution note

`responsible-ai` holds 5 of 11 questions. This reflects the quiz subject matter
but means the overall score is weighted toward that category. This is a known
limitation of the ten-question set and is acceptable at this stage. It should
be noted in any category score display so students understand the weighting.

---

## Content Gap and New Question Specification

`react-state` has only one question after remapping. One question produces only
a binary 0% or 100% category score — not a meaningful assessment signal.

**One new question must be added** to bring `react-state` to two questions.

Specification for `q11`:

- `id`: `"q11"`
- `category`: `"react-state"`
- `difficulty`: `"beginner"`
- Prompt must test a second, distinct React or state concept — for example:
  what `useState` returns, when a component re-renders after state changes, or
  how an `onChange` handler connects a controlled input to state.
- Must have exactly four options with distinct `id` values.
- Must have a `correctOptionId` that matches one of the four option IDs.
- Must have an `explanation` of at least one sentence.
- Must not duplicate the concept tested by q3 (where to store answers).

The implementer chooses the exact wording during Sub-Task 2, subject to the
constraints above.

---

## Sub-Tasks

---

### Sub-Task 1 — Create the category registry

**Status:** [x] done

#### Intent

Create a single file that defines the four approved assessment categories.
Every other part of the application — scoring logic, UI components, and
validation tests — will import from this file rather than hard-coding category
strings. This eliminates the risk of category IDs diverging across files.

#### Expected Outcomes

- A new file `src/data/categories.js` exists and exports a `categories` array
  with exactly four objects.
- Each object contains `id`, `displayName`, and `description`.
- The four `id` values are exactly: `"web-fundamentals"`, `"react-state"`,
  `"testing-debugging"`, `"responsible-ai"`.
- No other file is modified in this sub-task.

#### Todo List

1. Create `src/data/categories.js`.
2. Export a named `categories` array containing the four objects from the
   Approved Category Registry table at the top of this plan.
3. Export a named `CATEGORY_IDS` object that maps each key to its string value
   (e.g. `WEB_FUNDAMENTALS: "web-fundamentals"`) so consuming code can reference
   category IDs without repeating bare strings.
4. Do not import this file into any other file yet — that happens in Sub-Task 2.

#### Relevant Context

- File to create: `src/data/categories.js`
- Pattern: follows the style of `src/data/questions.js` — named exports, plain
  JavaScript objects, no default export required but acceptable.
- The four IDs and display names are fixed in the registry table above.
  The descriptions are taken from the landing-page topic cards in
  `src/pages/Landing.jsx` (lines 216–232) which already use these exact phrases.

---

### Sub-Task 2 — Remap question categories and add q11

**Status:** [x] done

#### Intent

Update the `category` field on all ten existing questions to use one of the four
approved IDs from the registry, and add the new `q11` question to bring
`react-state` to a minimum of two questions. This is the only change to
`src/data/questions.js`.

#### Expected Outcomes

- Every question in `src/data/questions.js` has a `category` value that is one
  of the four approved IDs.
- The mapping matches the Proposed Question-to-Category Mapping table above.
- A new question with `id: "q11"` and `category: "react-state"` exists at the
  end of the `questions` array.
- `q11` satisfies the new-question specification in the Content Gap section above.
- All existing question IDs, prompts, options, `correctOptionId`, and
  `explanation` fields are unchanged.
- The `quiz` metadata object at the bottom of the file is unchanged except that
  `questions` now contains 11 items.
- No other file is modified in this sub-task.

#### Todo List

1. Open `src/data/questions.js`.
2. Update the `category` field on each question according to the mapping table.
   Changes required:
   - q2: `"javascript"` → `"web-fundamentals"`
   - q3: `"react"` → `"react-state"`
   - q4: `"debugging"` → `"testing-debugging"`
   - q5: `"ai-code-review"` → `"responsible-ai"`
   - q6: `"security"` → `"responsible-ai"`
   - q7: `"testing"` → `"testing-debugging"`
   - q8: `"version-control"` → `"responsible-ai"`
   - q9: `"accessibility"` → `"responsible-ai"`
   - q10: `"ai-reliability"` → `"responsible-ai"`
   - q1: already `"web-fundamentals"` — no change needed
3. Add `q11` at the end of the `questions` array, following the specification
   in the Content Gap section. Write the question object in the same style as
   the existing ten objects.
4. Do not change the `quiz` export object — it references `questions` by
   variable, so it automatically includes `q11`.
5. Do not import `categories.js` into `questions.js` — the registry and the
   data file are kept independent. The validation tests in Sub-Task 3 will
   import both.

#### Relevant Context

- File to modify: `src/data/questions.js`
- The `category` field is currently displayed in `Quiz.jsx` at line 185 via
  `.replaceAll("-", " ")`. After remapping, the four new IDs still contain
  hyphens and will display correctly with that transformation:
  - `"web-fundamentals"` → "web fundamentals"
  - `"react-state"` → "react state"
  - `"testing-debugging"` → "testing debugging"
  - `"responsible-ai"` → "responsible ai"
  No change to `Quiz.jsx` is needed for display.
- `quiz.questions` in the `quiz` export references the `questions` array by
  name, not by length, so adding q11 is automatically reflected.

---

### Sub-Task 3 — Add data-validation tests

**Status:** [x] done

#### Intent

Add a test file that validates the structural and referential integrity of
`questions.js` against `categories.js`. These tests catch:

- A future question added with a misspelled or uncategorised category.
- A `correctOptionId` that does not match any option in the question.
- A duplicate question ID.
- A question missing a required field.

They run as part of the existing `npm test` command and require no new
dependencies.

#### Expected Outcomes

- A new file `src/data/questions.test.js` exists.
- All validation tests pass under `npm test -- --watchAll=false`.
- The existing 8 tests (smoke + QuizResults unit) continue to pass.
- Total passing tests: 13 or more (8 existing + 5 new validation tests).

#### Proposed Test Cases

Five test cases, each in its own `test()` block:

**a. All questions have a recognised category**
Import `questions` from `questions.js` and `CATEGORY_IDS` from `categories.js`.
Derive the set of valid IDs from `Object.values(CATEGORY_IDS)`.
For each question, assert that `validIds.includes(question.category)`.

**b. All question IDs are unique**
Collect all `question.id` values into an array.
Assert that `new Set(ids).size === ids.length`.

**c. Every correctOptionId matches one of the question's options**
For each question, find the option whose `id === question.correctOptionId`.
Assert that the found option is not `undefined`.

**d. Every question has a non-empty explanation**
For each question, assert that `typeof question.explanation === "string"` and
`question.explanation.trim().length > 0`.

**e. Only the four approved category IDs are used**
Collect the set of distinct `category` values from the questions array.
Assert that every value in that set is one of the four approved IDs.
Assert that no category is present that is not in the approved list.

#### Todo List

1. Create `src/data/questions.test.js`.
2. Import `questions` from `./questions` and `categories`, `CATEGORY_IDS` from
   `./categories`.
3. Write the five test cases described above.
4. Do not test display logic, React rendering, or UI behaviour — this file
   validates data only.
5. Run `npm test -- --watchAll=false` and confirm all tests pass.

#### Relevant Context

- Test tooling: Jest is already configured via `react-scripts`. No additional
  imports needed beyond the data files themselves.
- The existing test pattern in `src/components/QuizResults.test.jsx` can be
  used as a style reference, but this file contains no React rendering so it
  needs only the `questions` and `categories` imports — no
  `@testing-library/react`.
- `src/setupTests.js` imports `@testing-library/jest-dom` globally, so
  `toBeInTheDocument` is available but not needed here. Plain Jest `expect`
  matchers (`toBe`, `toEqual`, `toBeDefined`, `toHaveLength`) are sufficient.

---

## Files to Create

| File | Sub-Task | Purpose |
|---|---|---|
| `src/data/categories.js` | 1 | Single source of truth for the four approved category IDs, names, and descriptions |
| `src/data/questions.test.js` | 3 | Data-integrity validation tests for the questions array |

## Files to Modify

| File | Sub-Task | Changes |
|---|---|---|
| `src/data/questions.js` | 2 | Remap `category` on q2–q10; add q11 |

## Files Not Changed

`src/pages/Quiz.jsx`, `src/components/QuizResults.jsx`,
`src/components/QuizResults.test.jsx`, `src/App.test.js`,
`src/App.js`, `src/pages/Landing.jsx`, all dashboard scaffold files,
`package.json`.

---

## Verification Commands

```bash
# After Sub-Task 1 — confirm the file exists and exports parse without error
node -e "const c = require('./src/data/categories.js'); console.log(c.categories.length, 'categories')"

# After Sub-Task 2 — confirm questions parse and count is correct
node -e "const q = require('./src/data/questions.js'); console.log(q.questions.length, 'questions')"

# After Sub-Task 3 — all 13+ tests must pass
npm test -- --watchAll=false

# Production build must still succeed (same pre-existing warning expected)
npm run build
```

---

## Risks and Limitations

### Risk 1 — `responsible-ai` dominates the score

5 of 11 questions (45%) belong to `responsible-ai`. A student who masters
responsible AI concepts will score well overall even with weak web or React
knowledge. This is a content limitation, not a code bug. It should be
documented in any category-score UI so students understand the weighting.

**Mitigation at this stage:** none — adding more questions is out of scope.
The imbalance should be noted in the results UI when category scoring is
implemented.

### Risk 2 — 2-question categories produce only three outcomes

`web-fundamentals`, `react-state`, and `testing-debugging` each have 2
questions. Per-category percentage scores for those categories can only be
0%, 50%, or 100%. This gives limited diagnostic resolution.

**Mitigation:** The results UI should display raw correct/total counts
alongside percentages — e.g. "1 / 2 correct" — so the coarse resolution
is transparent.

### Risk 3 — category display in Quiz.jsx after remapping

`Quiz.jsx` line 185 renders `currentQuestion.category.replaceAll("-", " ")`.
After remapping:
- `"react-state"` displays as "react state" (lowercase, two words)
- `"testing-debugging"` displays as "testing debugging"

These are readable but may look different from the `displayName` values in the
registry ("React and State", "Testing and Debugging"). If the display name is
ever shown in the question view, the rendering code will need to look up the
registry rather than just replacing hyphens.

**Mitigation at this stage:** none required — the `.replaceAll` display is
unchanged. The divergence between displayed string and display name is noted
here so it is not surprising during future UI work.

### Risk 4 — questions.js imports nothing from categories.js

The registry and data file are kept independent by design (see Sub-Task 2 Todo
step 5). This means a developer can edit a question category string without the
app throwing an error — only the tests will catch the mismatch. Tests must be
run after every edit to `questions.js`.

**Mitigation:** The data-validation tests in Sub-Task 3 exist precisely to
catch this. They should be run as part of any CI check.

### Risk 5 — q11 content quality

The new question's wording is left to the implementer. A poorly worded question
or one that overlaps with q3 would reduce the value of the `react-state`
category score.

**Mitigation:** The specification in the Content Gap section constrains the
topic. The implementer must confirm the question does not duplicate q3's concept
before committing.
