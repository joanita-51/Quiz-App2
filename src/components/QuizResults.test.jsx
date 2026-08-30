import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuizResults from './QuizResults';

// ---------------------------------------------------------------------------
// Inline fixtures — isolated from src/data/questions.js and categories.js
// ---------------------------------------------------------------------------

const questionA = {
  id: 'q-a',
  prompt: 'What is 2 + 2?',
  options: [
    { id: 'four', text: 'Four' },
    { id: 'five', text: 'Five' },
  ],
  correctOptionId: 'four',
  explanation: '2 plus 2 equals 4.',
};

const questionB = {
  id: 'q-b',
  prompt: 'What colour is the sky?',
  options: [
    { id: 'blue', text: 'Blue' },
    { id: 'red', text: 'Red' },
  ],
  correctOptionId: 'blue',
  explanation: 'The sky appears blue due to Rayleigh scattering.',
};

const allCorrectAnswers = { 'q-a': 'four', 'q-b': 'blue' };
const oneWrongAnswers   = { 'q-a': 'four', 'q-b': 'red' };

// Category result fixtures — one per assessed category at different percentages
const catWF = {
  categoryId: 'web-fundamentals',
  categoryName: 'Web Fundamentals',
  correct: 2, total: 2, percentage: 100, level: 'Strong',
  missedQuestionIds: [],
};
const catRS = {
  categoryId: 'react-state',
  categoryName: 'React and State',
  correct: 1, total: 2, percentage: 50, level: 'Developing',
  missedQuestionIds: ['q-rs-2'],
};
const catTD = {
  categoryId: 'testing-debugging',
  categoryName: 'Testing and Debugging',
  correct: 0, total: 2, percentage: 0, level: 'Needs improvement',
  missedQuestionIds: ['q-td-1', 'q-td-2'],
};
const catRAI = {
  categoryId: 'responsible-ai',
  categoryName: 'Responsible AI Coding',
  correct: 3, total: 5, percentage: 60, level: 'Developing',
  missedQuestionIds: ['q-rai-3', 'q-rai-4'],
};

const fourCategories = [catWF, catRS, catTD, catRAI];

// All four categories not assessed
const notAssessedCategories = [
  { categoryId: 'web-fundamentals',  categoryName: 'Web Fundamentals',      correct: 0, total: 0, percentage: 0, level: 'Not assessed', missedQuestionIds: [] },
  { categoryId: 'react-state',       categoryName: 'React and State',        correct: 0, total: 0, percentage: 0, level: 'Not assessed', missedQuestionIds: [] },
  { categoryId: 'testing-debugging', categoryName: 'Testing and Debugging',  correct: 0, total: 0, percentage: 0, level: 'Not assessed', missedQuestionIds: [] },
  { categoryId: 'responsible-ai',    categoryName: 'Responsible AI Coding',  correct: 0, total: 0, percentage: 0, level: 'Not assessed', missedQuestionIds: [] },
];

// All four categories at exactly 50% — tie scenario
const tieCategories = [
  { categoryId: 'web-fundamentals',  categoryName: 'Web Fundamentals',      correct: 1, total: 2, percentage: 50, level: 'Developing', missedQuestionIds: [] },
  { categoryId: 'react-state',       categoryName: 'React and State',        correct: 1, total: 2, percentage: 50, level: 'Developing', missedQuestionIds: [] },
  { categoryId: 'testing-debugging', categoryName: 'Testing and Debugging',  correct: 1, total: 2, percentage: 50, level: 'Developing', missedQuestionIds: [] },
  { categoryId: 'responsible-ai',    categoryName: 'Responsible AI Coding',  correct: 1, total: 2, percentage: 50, level: 'Developing', missedQuestionIds: [] },
];


const attemptHistory = [
  {
    id: "attempt-1",
    quizId: "ai-web-development-fundamentals",
    completedAt: "2026-08-28T12:30:00.000Z",
    overall: {
      correct: 9,
      total: 11,
      percentage: 82,
      passed: true,
    },
    categories: [],
  },
];

// Base props shared by all tests
const baseProps = {
  questions: [questionA, questionB],
  totalQuestions: 2,
  passingPercentage: 70,
  categoryResults: fourCategories,
  coachingStatus: "idle",
  coachingData: null,
  coachingError: "",
  onGenerateCoaching: () => {},
  attemptHistory,
};

function getQuestionSummary(questionNumber, promptPattern) {
  const promptElement = screen.getByText(promptPattern, {
    selector: "summary, summary *",
  });

  const summaryElement = promptElement.closest("summary");

  if (!summaryElement) {
    throw new Error(
      `Question ${questionNumber} was found, but it was not inside a summary element.`
    );
  }

  expect(summaryElement).toHaveTextContent(
    new RegExp(`question\\s*${questionNumber}`, "i")
  );

  return summaryElement;
}

// ---------------------------------------------------------------------------
// Existing tests — preserved without modification
// ---------------------------------------------------------------------------

test('passing result — shows pass message', () => {
  render(
    <QuizResults
      {...baseProps}
      answers={allCorrectAnswers}
      score={2}
      resultPercentage={100}
      onTryAgain={() => {}}
    />
  );
  expect(
    screen.getByText('Well done! You passed the quiz.')
  ).toBeInTheDocument();
});

test('passing result — shows review heading', () => {
  render(
    <QuizResults
      {...baseProps}
      answers={allCorrectAnswers}
      score={2}
      resultPercentage={100}
      onTryAgain={() => {}}
    />
  );
  expect(
    screen.getByRole('heading', { name: /review your answers/i })
  ).toBeInTheDocument();
});

test('failing result — shows fail message', () => {
  render(
    <QuizResults
      {...baseProps}
      answers={oneWrongAnswers}
      score={1}
      resultPercentage={50}
      onTryAgain={() => {}}
    />
  );
  expect(
    screen.getByText('Review the explanations and try again.')
  ).toBeInTheDocument();
});

test("correct answer display — selected answer shown after choosing show all", async () => {
  render(
    <QuizResults
      {...baseProps}
      answers={oneWrongAnswers}
      score={1}
      resultPercentage={50}
      onTryAgain={() => {}}
    />
  );

  await userEvent.click(
    screen.getByRole("button", { name: /show all 2 answers/i })
  );

  await userEvent.click(
    getQuestionSummary(1, /what is 2 \+ 2\?/i)
  );

  expect(screen.getByText("Four")).toBeInTheDocument();
});

test('incorrect answer display — wrong choice and correct answers shown after expanding', () => {
  render(
    <QuizResults
      {...baseProps}
      answers={oneWrongAnswers}
      score={1}
      resultPercentage={50}
      onTryAgain={() => {}}
    />
  );

  userEvent.click(
    getQuestionSummary(2, /what colour is the sky/i)
  );

  expect(screen.getByText('Red')).toBeInTheDocument();
  expect(screen.getByText('Blue')).toBeInTheDocument();
});

test("explanation display — explanation shown after expanding an answer", async () => {
  render(
    <QuizResults
      {...baseProps}
      answers={oneWrongAnswers}
      score={1}
      resultPercentage={50}
      onTryAgain={() => {}}
    />
  );

  await userEvent.click(
    screen.getByRole("button", { name: /show all 2 answers/i })
  );

  await userEvent.click(
    getQuestionSummary(1, /what is 2 \+ 2\?/i)
  );

  expect(
    screen.getByText("2 plus 2 equals 4.")
  ).toBeInTheDocument();
});

test('try again callback — called once when button clicked', () => {
  const handleTryAgain = jest.fn();
  render(
    <QuizResults
      {...baseProps}
      answers={allCorrectAnswers}
      score={2}
      resultPercentage={100}
      onTryAgain={handleTryAgain}
    />
  );
  const button = screen.getByRole('button', { name: /try again/i });
  userEvent.click(button);
  expect(handleTryAgain).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------------------
// Skills breakdown
// ---------------------------------------------------------------------------

describe('skills breakdown', () => {
  const renderWithCategories = (cats, resultPercentage = 75) =>
    render(
      <QuizResults
        {...baseProps}
        categoryResults={cats}
        answers={allCorrectAnswers}
        score={2}
        resultPercentage={resultPercentage}
        onTryAgain={() => {}}
      />
    );

  test('skills-breakdown heading is present', () => {
    renderWithCategories(fourCategories);
    expect(
      screen.getByRole('heading', { name: /skills breakdown/i })
    ).toBeInTheDocument();
  });

  test('all four category names are displayed', () => {
    renderWithCategories(fourCategories);
    // Each name appears at least once (breakdown card + possibly summary)
    expect(screen.getAllByText('Web Fundamentals').length).toBeGreaterThan(0);
    expect(screen.getAllByText('React and State').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Testing and Debugging').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Responsible AI Coding').length).toBeGreaterThan(0);
  });

  test('x-of-y score shown for an assessed category', () => {
    renderWithCategories(fourCategories);
    expect(screen.getByText('2 of 2 correct')).toBeInTheDocument();
  });

  test('percentage shown for an assessed category', () => {
    renderWithCategories(fourCategories);
    // catWF is 100%; check it appears within breakdown context
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('skill-level text shown for an assessed category', () => {
    renderWithCategories(fourCategories);
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  test('progress bar has accessible label with category name and percentage', () => {
    renderWithCategories(fourCategories);
    expect(
      screen.getByRole('progressbar', { name: /web fundamentals.*100%/i })
    ).toBeInTheDocument();
  });

  test('progress bar has correct aria attributes', () => {
    renderWithCategories(fourCategories);
    const bar = screen.getByRole('progressbar', {
      name: /web fundamentals.*100%/i,
    });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  test('category cards appear in the same order as categoryResults prop', () => {
    renderWithCategories(fourCategories);
    const names = screen
      .getAllByText(
        /^(Web Fundamentals|React and State|Testing and Debugging|Responsible AI Coding)$/
      )
      // Limit to the breakdown section headings (uppercase orange labels)
      .map((el) => el.textContent);
    // The first four occurrences must match fourCategories order
    expect(names[0]).toBe('Web Fundamentals');
    expect(names[1]).toBe('React and State');
    expect(names[2]).toBe('Testing and Debugging');
    expect(names[3]).toBe('Responsible AI Coding');
  });

  test('not-assessed category shows "Not assessed" text', () => {
    renderWithCategories(notAssessedCategories);
    const notAssessedLabels = screen.getAllByText('Not assessed');
    expect(notAssessedLabels.length).toBeGreaterThan(0);
  });

  test('not-assessed category does not show 0%', () => {
    // resultPercentage=75 so the overall card shows 75% not 0%
    renderWithCategories(notAssessedCategories, 75);
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  test('no progress bar rendered for a not-assessed category', () => {
    renderWithCategories(notAssessedCategories);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Skills summary
// ---------------------------------------------------------------------------

describe('skills summary', () => {
  const renderSummary = (cats, resultPercentage = 75) =>
    render(
      <QuizResults
        {...baseProps}
        categoryResults={cats}
        answers={allCorrectAnswers}
        score={2}
        resultPercentage={resultPercentage}
        onTryAgain={() => {}}
      />
    );

  test('skills-summary heading is present', () => {
    renderSummary(fourCategories);
    expect(
      screen.getByRole('heading', { name: /skills summary/i })
    ).toBeInTheDocument();
  });

  test('strongest area text identifies the highest-percentage category', () => {
    renderSummary(fourCategories);
    // catWF has percentage 100 — highest
    // The <p> contains a <span> child so we match on textContent with a function
    expect(
      screen.getByText((_, el) =>
        el?.tagName === 'P' &&
        /strongest area:/i.test(el.textContent) &&
        /web fundamentals/i.test(el.textContent)
      )
    ).toBeInTheDocument();
  });

  test('priority area identifies the lowest-percentage category', () => {
    renderSummary(fourCategories);
    // catTD has percentage 0 — lowest
    expect(
      screen.getByText((_, element) => {
        if (element?.tagName !== 'P'){
          return false;
        }

        return (
          /priority area:/i.test(element.textContent) &&
          /testing and debugging/i.test(element.textContent)
        )
      })
    ).toBeInTheDocument();
  });

  test('deterministic recommendation shown for the priority category', () => {
    renderSummary(fourCategories);
    expect(
      screen.getByText(
        'Practise writing tests that expose scoring and state-management errors.'
      )
    ).toBeInTheDocument();
  });

  test('tie: even-results message is shown', () => {
    renderSummary(tieCategories);
    expect(
      screen.getByText(
        'Your results are currently even across the assessed skills.'
      )
    ).toBeInTheDocument();
  });

  test('tie: no "Practise" recommendation shown', () => {
    renderSummary(tieCategories);
    expect(screen.queryByText(/^practise/i)).not.toBeInTheDocument();
  });

  test('tie: no strongest/priority labels shown', () => {
    renderSummary(tieCategories);
    expect(screen.queryByText(/strongest area/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/priority area/i)).not.toBeInTheDocument();
  });

  test('no-assessment: fallback message shown', () => {
    renderSummary(notAssessedCategories);
    expect(
      screen.getByText(
        'Complete an assessed quiz to receive a skills summary.'
      )
    ).toBeInTheDocument();
  });

  test('no-assessment: no strongest/priority labels shown', () => {
    renderSummary(notAssessedCategories);
    expect(screen.queryByText(/strongest area/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/priority area/i)).not.toBeInTheDocument();
  });


  test("renders recent attempts when history is supplied", () => {
    render(<QuizResults {...baseProps} answers={allCorrectAnswers}  attemptHistory={attemptHistory}/>);

    expect(
      screen.getByRole("heading", { name: /recent attempts/i })
    ).toBeInTheDocument();

    expect(screen.getByText("9 of 11 correct")).toBeInTheDocument();
  });

  test("renders recent attempts after the answer review", () => {
    render(<QuizResults {...baseProps}  answers={allCorrectAnswers}  attemptHistory={attemptHistory} />);

    const recentAttemptsHeading = screen.getByRole("heading", {
      name: /recent attempts/i,
    });

    const reviewHeading = screen.getByRole("heading", {
      name: /review your answers/i,
    });

    const headings = screen.getAllByRole("heading");

    expect(headings.indexOf(recentAttemptsHeading)).toBeGreaterThan(
      headings.indexOf(reviewHeading)
    );
  });

  test("skills summary is hidden after personalized coaching succeeds", () => {
    render(
      <QuizResults
        {...baseProps}
        answers={oneWrongAnswers}
        score={1}
        resultPercentage={50}
        coachingStatus="success"
        coachingData={{
          summary: "A personalized summary.",
          strengths: ["Web fundamentals"],
          improvementAreas: ["Testing and debugging"],
          nextSteps: ["Write a scoring test"],
          encouragement: "Keep practising.",
        }}
        onTryAgain={() => {}}
      />
    );

    expect(
      screen.queryByRole("heading", { name: /skills summary/i })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /personalised coaching plan/i,
      })
    ).toBeInTheDocument();
  });


});
