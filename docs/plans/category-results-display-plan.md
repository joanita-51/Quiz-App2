# Category Results Display Plan

**Status:** Implemented and verified with minor test-query adjustments. See the IBM Bob development log for the final implementation details.

## Top-Level Overview

`QuizResults.jsx` currently shows an overall score, a pass/fail message, and a
per-question answer-review list. This plan adds two new sections between the
overall result card and the review list:

1. **Skills breakdown** — one card per category showing name, raw score,
   percentage, skill level, and a progress indicator.
2. **Skills summary** — a short deterministic paragraph identifying the
   student's strongest area, priority improvement area, and a fixed
   recommendation for that priority category.

`calculateQuizResults.js` is not changed.
`Quiz.jsx` gains one new prop on `<QuizResults>`.
All existing UI, behaviour, and test cases are preserved.

---

## Section Order in the Rendered Output

```
┌─ Overall result card ─────────────────────────────┐
│  Quiz complete / Your result                       │
│  Percentage, score, pass/fail message              │
│  Try again button                                  │
└───────────────────────────────────────────────────┘

┌─ Skills breakdown (NEW) ───────────────────────────┐
│  h2 "Skills breakdown"                             │
│  One card per categoryResults entry, in order      │
│    [assessed]  name · x of y · % · level · bar    │
│    [not-assessed] name · "Not assessed" · bar N/A  │
└───────────────────────────────────────────────────┘

┌─ Skills summary (NEW) ─────────────────────────────┐
│  Strongest area / Priority improvement area        │
│  Deterministic recommendation                      │
└───────────────────────────────────────────────────┘

┌─ Review your answers (existing) ───────────────────┐
│  h2 "Review your answers"                          │
│  Per-question articles with answer, explanation    │
└───────────────────────────────────────────────────┘
```

---

## Proposed Prop Interface for `QuizResults`

Existing props — all unchanged:

```
questions         array    full questions array (for review list)
answers           object   questionId → selectedOptionId
score             number   totalCorrect
totalQuestions    number   total question count
resultPercentage  number   overall percentage
passingPercentage number   passing threshold
onTryAgain        func     reset callback
```

New prop:

```
categoryResults   array    quizResults.categories from calculateQuizResults
                           shape: [{ categoryId, categoryName, correct, total,
                                     percentage, level, missedQuestionIds }]
```

`Quiz.jsx` passes it as:
```
categoryResults={quizResults.categories}
```

---

## Summary-Selection Logic: Inside `QuizResults`

The summary computes three values from `categoryResults`:

1. `assessedCategories` — `categoryResults` filtered to entries where
   `level !== "Not assessed"`.
2. `strongestCategory` — entry with the highest `percentage` in
   `assessedCategories`. On a tie, the first entry in array order wins
   (because `reduce` or `sort` with stable ordering preserves original
   order when values are equal).
3. `priorityCategory` — entry with the lowest `percentage` in
   `assessedCategories`. Same tie-breaking rule.

These are three `const` declarations at the top of the component body.
They involve no React hooks, no async work, and no side effects. Extracting
them to a separate file would add a file, an import, and a `describe` block
for a function whose only complexity is a `.filter` and two `.reduce` calls.
The render tests below cover every edge case directly through the component
output, which is the most useful form of coverage here.

**Decision: keep inside `QuizResults` as derived values. Do not extract.**

### Deterministic recommendation strings (keyed by `categoryId`)

```
"web-fundamentals":   "Review how HTML and JavaScript work together in a
                       web application."
"react-state":        "Practise connecting controlled inputs and user
                       actions to React state."
"testing-debugging":  "Practise writing tests that expose scoring and
                       state-management errors."
"responsible-ai":     "Practise reviewing AI-generated code for security,
                       accessibility, and reliability."
```

Store these as a plain object literal inside the component, keyed by
`categoryId`. Look up `priorityCategory.categoryId` to retrieve the string.
Do not derive recommendation text dynamically.

---

## Sub-Tasks

---

### Sub-Task 1 — Pass `categoryResults` from `Quiz.jsx`

**Status:** [ ] pending

#### Intent

Wire the new prop into the call site so `QuizResults` receives the structured
category data. This is a one-line change to `Quiz.jsx`.

#### Expected Outcomes

- `<QuizResults>` in `Quiz.jsx` includes `categoryResults={quizResults.categories}`.
- All 50 existing tests continue to pass (the new prop is not yet rendered so
  existing snapshot/render tests are unaffected).

#### Todo List

1. Open `src/pages/Quiz.jsx`.
2. Add `categoryResults={quizResults.categories}` to the `<QuizResults>` JSX
   block, after the existing `onTryAgain` prop.
3. Run `npm test -- --watchAll=false` to confirm all 50 tests still pass.

#### Relevant Context

- `Quiz.jsx` call site: lines 112–121. The prop list currently ends at
  `onTryAgain={tryAgain}`.
- `quizResults` is non-null when `showResults` is true (guaranteed by
  `submitQuiz` setting both state values in the same synchronous block).
- `quizResults.categories` is always an array of exactly four objects
  (guaranteed by `calculateQuizResults`).

---

### Sub-Task 2 — Add `categoryResults` to `QuizResults` and render the skills breakdown

**Status:** [ ] pending

#### Intent

Add the `categoryResults` prop to `QuizResults`'s destructuring and render the
"Skills breakdown" section. Each category appears as a card. Assessed categories
show score, percentage, level, and a progress bar. Not-assessed categories show
the name and "Not assessed" with no percentage judgment.

#### Expected Outcomes

- `QuizResults.jsx` accepts and destructures `categoryResults`.
- A `<section>` with an `<h2>Skills breakdown</h2>` heading appears after the
  overall result card and before the existing "Review your answers" section.
- Each category renders one card in the order received (no sorting).
- Assessed card content: category name, `{correct} of {total} correct`,
  `{percentage}%`, skill-level text, accessible progress indicator.
- Not-assessed card content: category name, text "Not assessed", progress
  indicator with value 0 and an accessible label stating the category is not
  assessed (or no progress indicator — see Accessibility section).
- Visual style is consistent with the existing white rounded-2xl card pattern.
- No existing rendered output changes.

#### Todo List

1. Add `categoryResults` to the props destructuring at the top of
   `QuizResults`.
2. After the closing `</div>` of the overall result card (line 50) and before
   the `<div className="mt-8">` of the review section (line 52), insert the
   skills-breakdown `<section>`.
3. Inside the section, render `categoryResults.map(...)`. For each entry:
   a. If `entry.level === "Not assessed"`:
      - Show category name.
      - Show the text "Not assessed".
      - Render a `<progress>` element with `value={0}` `max={100}` and
        `aria-label` set to `{entry.categoryName}: not assessed`.
   b. Otherwise:
      - Show category name.
      - Show `{entry.correct} of {entry.total} correct`.
      - Show `{entry.percentage}%`.
      - Show `entry.level` as visible text.
      - Render a `<progress>` element with `value={entry.percentage}`
        `max={100}` and `aria-label` set to
        `{entry.categoryName}: {entry.percentage}%`.
4. Use `entry.categoryId` as the React list key.
5. Do not sort `categoryResults`.
6. Preserve all existing JSX below the insertion point exactly.

#### Accessibility Approach

- The section carries an `<h2>` heading "Skills breakdown" which names the
  region for screen-reader users.
- Skill level is always rendered as visible text, not communicated through
  color alone. Color accents (if any) are additive to the text label.
- Each `<progress>` element uses `aria-label` containing both the category
  name and the meaningful value ("not assessed" or the percentage string).
  This gives screen-reader users a complete accessible description without
  relying on surrounding context.
- Native `<progress>` with valid `value` and `max` attributes is the
  simplest accessible choice — it is keyboard-focusable and announced
  correctly by assistive technology without custom ARIA roles.
- No content is hidden from assistive technology that is visible to sighted
  users.
- The existing `focus:ring` and `focus:outline-none` patterns on interactive
  elements are not in this section (the cards are not interactive), so no
  focus-ring changes are needed.

#### Relevant Context

- Insertion point in `QuizResults.jsx`: between line 50 (`</div>` closing the
  overall result card) and line 52 (`<div className="mt-8">` opening the review
  section).
- Existing card style in the file: `rounded-2xl bg-white p-5 shadow-sm sm:p-6`
  — use this for category cards to stay consistent.
- Tailwind class for a progress bar fill color: Tailwind does not style the
  native `<progress>` element's fill directly; use `accent-orange-500` on the
  element or accept the browser default. Either is acceptable.

---

### Sub-Task 3 — Add the skills summary section

**Status:** [ ] pending

#### Intent

After the skills-breakdown section and before the "Review your answers" section,
render a deterministic summary paragraph identifying the strongest area, the
priority improvement area, and a fixed recommendation for that area.

#### Expected Outcomes

- A `<section>` with an `<h2>Skills summary</h2>` heading renders between the
  breakdown cards and the review list.
- The strongest-area and priority-area names are displayed as visible text.
- The correct recommendation string for the priority category appears.
- Tie behavior is handled: if all assessed categories have equal percentages,
  the tie message is shown and no category is labeled both strongest and
  priority.
- If no categories are assessed, the no-assessment message is shown.
- The existing review section is unchanged below.

#### Todo List

1. At the top of the `QuizResults` component body, after the props
   destructuring, add the three derived values:
   ```
   const assessedCategories = categoryResults.filter(
     (cat) => cat.level !== "Not assessed"
   );
   ```
   For `strongestCategory`: reduce over `assessedCategories`, keeping the
   entry with the highest `percentage`. If equal, keep the first (earlier
   index wins).
   For `priorityCategory`: same approach, keeping the entry with the lowest
   `percentage`.

2. Define the `recommendations` object literal inside the component body,
   keyed by `categoryId` with the four fixed strings from the plan.

3. Insert a `<section>` with `<h2>Skills summary</h2>` between the
   skills-breakdown section and the review section.

4. Inside the section, render conditionally:

   a. If `assessedCategories.length === 0`:
      Show "Complete an assessed quiz to receive a skills summary."

   b. Else if all assessed categories have the same percentage
      (`assessedCategories.every(c => c.percentage === assessedCategories[0].percentage)`):
      Show "Your results are currently even across the assessed skills."

   c. Otherwise:
      - Show "Strongest area: {strongestCategory.categoryName}".
      - Show "Priority improvement area: {priorityCategory.categoryName}".
      - Show the recommendation string for `priorityCategory.categoryId`.

5. Do not use the same category for both strongest and priority in case c —
   the all-equal guard in case b prevents this by definition (if they would
   be the same, all percentages are equal and case b fires first).

#### Relevant Context

- Insertion point: after the skills-breakdown `<section>` added in Sub-Task 2,
  before the `<div className="mt-8">` of the review section.
- The `recommendations` object has exactly four keys matching the four
  `CATEGORY_IDS` values. Using a plain object rather than a `Map` or a
  separate import keeps the logic self-contained.
- The "tie" guard compares `assessedCategories[0].percentage` against all
  entries. This is safe because `assessedCategories` is non-empty at that
  point (the `length === 0` case is handled above it).

---

### Sub-Task 4 — Extend `QuizResults.test.jsx`

**Status:** [ ] pending

#### Intent

Add tests for all new UI behaviour. All existing 7 tests must remain valid and
continue to pass. New tests use inline fixtures only — no imports from
`questions.js` or `categories.js`.

#### Expected Outcomes

- All 50 existing tests pass.
- All new tests pass.
- Total passing tests after this sub-task: 50 + new count.

#### Fixture additions for the test file

All new fixtures are added at the top of the existing test file alongside the
existing `questionA`, `questionB`, and answer-map fixtures.

**`categoryResults` fixture — assessed, all different percentages:**

```
catWF  = { categoryId: "web-fundamentals",  categoryName: "Web Fundamentals",
           correct: 2, total: 2, percentage: 100, level: "Strong",
           missedQuestionIds: [] }

catRS  = { categoryId: "react-state",        categoryName: "React and State",
           correct: 1, total: 2, percentage: 50, level: "Developing",
           missedQuestionIds: ["q-rs-2"] }

catTD  = { categoryId: "testing-debugging",  categoryName: "Testing and Debugging",
           correct: 0, total: 2, percentage: 0,  level: "Needs improvement",
           missedQuestionIds: ["q-td-1", "q-td-2"] }

catRAI = { categoryId: "responsible-ai",     categoryName: "Responsible AI Coding",
           correct: 3, total: 5, percentage: 60, level: "Developing",
           missedQuestionIds: ["q-rai-3", "q-rai-4"] }

fourCategories = [catWF, catRS, catTD, catRAI]
```

**`notAssessedCategories` fixture** — all four categories with level
"Not assessed":

```
Each entry: { categoryId, categoryName, correct: 0, total: 0,
              percentage: 0, level: "Not assessed", missedQuestionIds: [] }
```

**`tieCategories` fixture** — all assessed at 50%:

```
Each entry: same shape as catWF/catRS/etc. but percentage: 50, level: "Developing"
            total: 2, correct: 1 for all four categories
```

**Updated `baseProps`** — add `categoryResults: fourCategories` to the existing
`baseProps` object. All existing tests that use `baseProps` must also pass
`categoryResults` (or default it). The simplest approach is to add it to
`baseProps` so existing tests receive it without modification — they do not
assert anything about the breakdown so they are unaffected.

---

#### New test cases (all in `QuizResults.test.jsx`)

Group in a `describe("skills breakdown")` block and a
`describe("skills summary")` block.

---

**`describe("skills breakdown")`**

| # | Test name | What to assert |
|---|---|---|
| 1 | skills-breakdown heading present | `getByRole("heading", { name: /skills breakdown/i })` is in the document |
| 2 | all category names displayed | each of "Web Fundamentals", "React and State", "Testing and Debugging", "Responsible AI Coding" is in the document |
| 3 | correct x-of-y for assessed category | "2 of 2 correct" appears (catWF fixture) |
| 4 | percentage shown for assessed category | "100%" appears in the document |
| 5 | skill-level text shown | "Strong" appears in the document |
| 6 | progress indicator present for assessed category | `getByRole("progressbar", { name: /web fundamentals.*100/i })` is in the document |
| 7 | category order matches prop order | query all four names in document order; assert their positions match `fourCategories` order |
| 8 | not-assessed category shows "Not assessed" text | render with `notAssessedCategories`; "Not assessed" appears (use `getAllByText` if all four show it) |
| 9 | not-assessed category does not show a misleading percentage | render with `notAssessedCategories`; `queryByText("0%")` returns `null` (or no element with a percentage pattern appears for a not-assessed category) |
| 10 | not-assessed progress indicator has accessible label | `getByRole("progressbar", { name: /web fundamentals.*not assessed/i })` is in the document |

---

**`describe("skills summary")`**

| # | Test name | What to assert |
|---|---|---|
| 11 | skills-summary heading present | `getByRole("heading", { name: /skills summary/i })` is in the document |
| 12 | strongest area label shown | text "Web Fundamentals" appears in the context of "Strongest area" (use `getByText(/strongest area/i)` and check parent contains "Web Fundamentals", or assert the text directly from the rendered output) |
| 13 | priority improvement area label shown | text "Testing and Debugging" appears near "Priority improvement area" |
| 14 | correct recommendation for priority category | text "Practise writing tests that expose scoring and state-management errors." appears in the document |
| 15 | recommendation not shown for tie scenario | render with `tieCategories`; "Practise" does not appear; tie message does appear |
| 16 | tie message shown | render with `tieCategories`; "Your results are currently even across the assessed skills." appears |
| 17 | no-assessment message shown | render with `notAssessedCategories`; "Complete an assessed quiz to receive a skills summary." appears |

---

**Existing 7 tests — preserve without modification**

The existing `baseProps` object gains `categoryResults: fourCategories`. The
existing tests do not assert anything about the skills breakdown or summary, so
adding the prop does not break them. Confirm all 7 still pass after the fixture
update.

Note on test 9 (`not-assessed category does not show 0%`): the assertion is
`queryByText(/^\d+%$/)` returns null, OR a targeted check that no element
within the not-assessed card contains a percentage string. The simpler
formulation is: assert that the string `"0%"` does not appear anywhere in the
rendered output when all categories are not assessed. This works because the
overall result card will show `0%` only if `resultPercentage` is 0 — so use a
`resultPercentage` of 50 in that render to make the assertion unambiguous.

---

## Files to Modify

| File | Sub-Task | Change |
|---|---|---|
| `src/pages/Quiz.jsx` | 1 | Add `categoryResults={quizResults.categories}` prop |
| `src/components/QuizResults.jsx` | 2, 3 | Add prop, two new sections, derived summary values |
| `src/components/QuizResults.test.jsx` | 4 | Add fixtures and new test cases |

## Files to Create

None.

## Files Not Changed

`src/utils/calculateQuizResults.js`, `src/utils/calculateQuizResults.test.js`,
`src/data/categories.js`, `src/data/questions.js`,
`src/data/questions.test.js`, `src/App.js`, `src/App.test.js`,
`src/pages/Landing.jsx`, all dashboard scaffold files, `package.json`.

---

## Verification Commands

```bash
# After Sub-Task 1 — all 50 existing tests pass
npm test -- --watchAll=false

# After Sub-Task 2 — new breakdown tests pass, existing tests pass
npm test -- --watchAll=false
npm start   # visually confirm skills-breakdown cards appear after result card

# After Sub-Task 3 — summary tests pass
npm test -- --watchAll=false
npm start   # visually confirm summary paragraph appears before review list

# After Sub-Task 4 — all tests pass
npm test -- --watchAll=false

# Final
npm run build
```

---

## Risks and Rollback

### Risk 1 — `categoryResults` is `undefined` when existing tests render `QuizResults`

The 7 existing tests currently pass `baseProps` which does not include
`categoryResults`. After Sub-Task 2 adds rendering of `categoryResults`, calling
`.map()` on `undefined` will throw.

**Mitigation:** Add `categoryResults: fourCategories` to `baseProps` in Sub-Task
4 before any new test is written, OR give `categoryResults` a default parameter
value of `[]` in the props destructuring:
```js
const QuizResults = ({ ..., categoryResults = [] }) => { ... }
```
The default-parameter approach protects existing tests without requiring every
test to supply the prop, and it is safer for any future call site that omits it.
The plan uses the default-parameter approach. This must be applied in Sub-Task 2.

### Risk 2 — `assessedCategories` is empty for an empty `categoryResults` array

If `categoryResults` defaults to `[]`, `assessedCategories` is `[]`, and
`strongestCategory`/`priorityCategory` reduce operations have no initial value.
Use a `reduce` with an explicit `null` initial value and guard the output:
```
const strongestCategory = assessedCategories.reduce(
  (best, cat) => (!best || cat.percentage > best.percentage ? cat : best),
  null
);
```
The `assessedCategories.length === 0` guard in the summary section then catches
`null` before it is used.

### Risk 3 — Native `<progress>` styling varies by browser

Tailwind does not reliably style the `<progress>` element's filled portion
across browsers without custom CSS. The plan uses `accent-orange-500` on the
element, which applies the brand colour in Chromium-based browsers and Firefox
(via `accent-color`). If visual consistency across browsers is critical, a
custom `<div>` progress bar can be substituted without changing any test
(tests assert via `role="progressbar"` which is available on both `<progress>`
and a `<div role="progressbar">`).

**Mitigation:** If `<progress>` rendering is inconsistent in review, replace
with a `<div role="progressbar" aria-valuenow={...} aria-valuemin="0"
aria-valuemax="100" aria-label={...}>` with a filled inner `<div>`. The test
assertions in Sub-Task 4 use `role="progressbar"` which works for both.

### Risk 4 — Tie test relies on `queryByText("Practise")`

If any other text in the document starts with "Practise", the assertion fails.
Check the existing rendered output — currently no text begins with "Practise" in
either `QuizResults` or the fixtures. This is safe.

### Rollback

- Sub-Task 1: `git checkout src/pages/Quiz.jsx`
- Sub-Task 2+3: `git checkout src/components/QuizResults.jsx`
- Sub-Task 4: `git checkout src/components/QuizResults.test.jsx`

No data files, utilities, or routing are changed. Any rollback is a single
`git checkout` on one or two component files.
