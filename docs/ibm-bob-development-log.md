# IBM Bob Development Log

Branch: `ibm-wildcard`
Application: Quiz-App2 — a React quiz application for beginner web developers
learning to build with AI coding assistants.

Each section records one implementation stage: goal, mode, files changed, key
decisions, human constraints, and validated outcomes. Test counts are cumulative
running totals at the end of each stage.

---

## 1. Repository analysis and scoring preparation

**Goal:** Establish a working test baseline and extract the results view into a
standalone component before adding category-level scoring.

**Bob mode:** Agent (plan → implement).

### Files created

| File | Purpose |
|---|---|
| `src/components/QuizResults.jsx` | Extracted results section — props: `questions`, `answers`, `score`, `totalQuestions`, `resultPercentage`, `passingPercentage`, `onTryAgain` |
| `src/components/QuizResults.test.jsx` | 7 unit tests using inline fixtures |

### Files modified

| File | Change |
|---|---|
| `src/App.test.js` | Replaced stale "learn react" boilerplate assertion with `getByRole("heading", { name: /code smarter with ai/i })` |
| `src/pages/Quiz.jsx` | Replaced 136-line inline results block with `<QuizResults … />`; all state and logic retained |

### Key implementation decisions

- The smoke test asserts the unique landing-page `h1` heading rather than
  "Start quiz" (which appears twice) or "QuiZote" (which appears in both header
  and footer).
- `resultPercentage` was kept in `Quiz.jsx` rather than derived inside
  `QuizResults`, so that the category scoring feature could extend it in one
  place.
- `passingPercentage` was passed as a primitive (not the full `quiz` object) to
  keep `QuizResults` free of data-model dependencies.

### Human decisions and constraints

- Use `@testing-library/user-event` v13 API (`userEvent.click`) — confirmed
  installed version is 13.5.0; do not upgrade.
- Render `<App />` directly in the smoke test — `App.js` already owns
  `BrowserRouter`, so no `MemoryRouter` wrapper.
- Do not delete the old dashboard scaffold or remove Syncfusion.
- Do not implement category scoring yet.

### Tests and build

- **8 tests passed** (1 smoke + 7 `QuizResults` unit tests).
- Build succeeded with pre-existing warnings:
  - `ReactDOMTestUtils.act` deprecation (`@testing-library/react` v13 vs React 18).
  - React Router v6 future-flag warnings.
  - ESLint `no-unused-vars` in `src/components/contexts/ContextProvider.js`
    (dead dashboard scaffold — causes `CI=true npm run build` to exit 1 on the
    unmodified repository; normal `npm run build` succeeds).

---

## 2. Category normalisation

**Goal:** Remap all 11 question `category` strings to four approved assessment
category IDs, create a central category registry, add one new question to bring
`react-state` to a minimum of two questions, and add data-integrity validation
tests.

**Bob mode:** Agent (plan → implement).

### Files created

| File | Purpose |
|---|---|
| `src/data/categories.js` | Registry — exports `CATEGORY_IDS` constants object and `categories` array; array entries use `CATEGORY_IDS` constants as `id` values |
| `src/data/questions.test.js` | 5 data-integrity tests: recognised category, unique IDs, `correctOptionId` integrity, non-empty explanation, all four IDs represented |

### Files modified

| File | Change |
|---|---|
| `src/data/questions.js` | Remapped `category` on q2–q10 to approved IDs; q1 already correct; added `q11` (react-state, controlled input `onChange`) bringing total from 10 to 11 questions |

### Key implementation decisions

- `categories.js` exports both `CATEGORY_IDS` (constants) and `categories`
  (array). The array uses `CATEGORY_IDS` values as `id` fields — no raw strings
  repeated.
- `q11` covers a second distinct React/state concept (controlled input
  `onChange`) to avoid duplicating q3 (where to store answers).
- Final distribution: `web-fundamentals` 2, `react-state` 2,
  `testing-debugging` 2, `responsible-ai` 5 (11 total).
- `questions.js` does not import `categories.js`; the registry and data file
  are kept independent. Only the validation tests import both.
- The unused `categories` import was removed from `questions.test.js` after
  review — only `CATEGORY_IDS` is needed there.

### Human decisions and constraints

- `responsible-ai` holding 5 of 11 questions (45%) is intentional for this
  application's subject matter; no rebalancing.
- Export both `CATEGORY_IDS` and `categories`; use constants as `id` values
  in the array.
- Tests must distinguish validity (each question uses a recognised category)
  from coverage (all four IDs are represented in the set).
- Preserve existing question IDs and question-object structure.
- Do not create a category registry or normalise categories before approval.

### Tests and build

- **13 tests passed** (8 previous + 5 new data-validation tests).
- Build succeeded with pre-existing warnings (same as stage 1).

---

## 3. Category-level scoring

**Goal:** Add a pure `calculateQuizResults` utility that derives per-category
scores from the questions array and answers object, integrate it into `Quiz.jsx`
replacing the hand-written `reduce`, and add comprehensive unit tests.

**Bob mode:** Agent (plan → implement).

### Files created

| File | Purpose |
|---|---|
| `src/utils/calculateQuizResults.js` | Pure scoring utility — exports `getSkillLevel` and `calculateQuizResults` |
| `src/utils/calculateQuizResults.test.js` | 37 unit tests across 9 scenarios |

### Files modified

| File | Change |
|---|---|
| `src/pages/Quiz.jsx` | Replaced `score` state with `quizResults` state (`null` at mount/reset); replaced `reduce` block with `calculateQuizResults` call; removed `resultPercentage` derived variable; updated three props passed to `QuizResults` |

### Key implementation decisions

- `getSkillLevel` is an exported named function (not a private inner function)
  so that boundary tests at 0, 49, 50, 79, 80, 100 can be asserted directly
  without large synthetic fixtures. The real 2-question and 5-question categories
  cannot produce those percentages organically.
- `calculateQuizResults` iterates over the `categories` registry (not the
  questions array) for the output array, guaranteeing all four categories appear
  in registry order and display names come from the registry — not from
  `.replaceAll("-", " ")`.
- A registered category with zero questions receives `level: "Not assessed"`;
  an empty questions array is handled safely with `overallPercentage: 0`.
- Unanswered questions (missing key in `answers`) are counted as incorrect and
  appear in `missedQuestionIds`.
- `QuizResults.jsx` was not modified — the `categoryResults` prop was explicitly
  deferred to the next stage.
- `quizResults` state is `null` at mount and after `tryAgain`; it is non-null
  when `showResults` is true (both set in the same synchronous block).

### Human decisions and constraints

- `"Not assessed"` is the exact string for a registered category with zero
  questions.
- Handle the empty questions array edge case with a dedicated unit test
  (Scenario I).
- Do not pass `categoryResults` to `QuizResults` yet; defer to the display
  stage.
- Do not change `QuizResults.jsx` unless integration genuinely required it
  (it did not).

### Tests and build

- **50 tests passed** (13 previous + 37 new utility tests).
- Build succeeded with pre-existing warnings (same as stages 1–2).
- `QuizResults.jsx` not modified; all 7 existing component tests passed
  without change.

---

## 4. Category-results display

**Goal:** Add a Skills breakdown section (one card per assessed category with
score, percentage, level, and progress bar) and a Skills summary section
(strongest area, priority improvement area, deterministic recommendation) to
`QuizResults.jsx`. Wire `categoryResults` from `Quiz.jsx`.

**Bob mode:** Agent (plan → implement).

### Files modified

| File | Change |
|---|---|
| `src/pages/Quiz.jsx` | Added `categoryResults={quizResults.categories}` prop to `<QuizResults>` |
| `src/components/QuizResults.jsx` | Added `categoryResults = []` default prop; `RECOMMENDATIONS` and `FALLBACK_RECOMMENDATION` constants; derived values (`assessedCategories`, `strongestCategory`, `priorityCategory`, `allEqual`); Skills breakdown section; Skills summary section |
| `src/components/QuizResults.test.jsx` | Added category fixtures; updated `baseProps` to include `categoryResults`; added 20 new tests in two `describe` blocks |

### Key implementation decisions

- Custom `<div role="progressbar">` with `aria-label`, `aria-valuemin`,
  `aria-valuemax`, `aria-valuenow` and an inner filled `<div aria-hidden="true">`
  — chosen over native `<progress>` to avoid cross-browser fill-colour
  inconsistency.
- Not-assessed categories render category name and "Not assessed" text only —
  no progress bar, no `0%`, no `0 of 0 correct`.
- Summary selection (strongest, priority, all-equal, no-assessment) is
  implemented as three `const` derivations inside the component body, not
  extracted to a separate helper. The logic is three comparisons on a prop
  that is already present; the render tests cover all edge cases directly.
- Tie-breaking: first entry in received array order wins (stable `reduce` with
  strict `>` / `<` keeps the existing `best` on equal values).
- Fallback recommendation string added for unexpected category IDs (defensive
  only; no unregistered categories exist).
- `categoryResults` is rendered only when `categoryResults.length > 0`, so
  the component degrades gracefully if the prop is omitted.

### Human decisions and constraints

- Use a custom progress bar, not native `<progress>`.
- Do not render a progress bar for not-assessed categories.
- Render summary relationships as complete readable text in single `<p>`
  elements; test with `getByText` function matchers that check `textContent`.
- `categoryResults = []` as default prop so existing tests remain valid without
  supplying the prop.
- Do not extract summary logic to a separate file.
- Do not render category cards yet in any other context.

### Test-query adjustments (deviations from the plan document)

Two test queries required adjustment during implementation — the component was
built as planned, but the queries needed to account for the actual DOM structure:

1. `getByText('Web Fundamentals')` → `getAllByText('Web Fundamentals')` —
   the category name appears in both the breakdown card and the summary sentence,
   so `getByText` (requiring a unique match) would throw.
2. Regex `getByText(/strongest area:.*web fundamentals/i)` →
   `getByText((_, el) => el?.tagName === 'P' && /strongest area:/i.test(el.textContent) && ...)`
   — the `<span>` inside the `<p>` splits the text tree; `getByText` with a
   regex only matches direct text content of a single node, not composite
   `textContent`.

### Tests and build

- **70 tests passed** (50 previous + 20 new `QuizResults` tests).
- Build succeeded with pre-existing warnings (same as stages 1–3).
- CSS bundle grew by 26 B due to new Tailwind classes; JS bundle grew by 611 B
  gzipped due to new component logic and recommendation strings.
- `calculateQuizResults.js` not modified.
