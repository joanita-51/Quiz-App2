import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoachingPanel from './CoachingPanel';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sampleCoachingData = {
  summary: 'You have a solid foundation but need to work on testing skills.',
  strengths: ['Strong understanding of web fundamentals', 'Good React state knowledge'],
  improvementAreas: ['Testing and debugging', 'Responsible AI practices'],
  nextSteps: [
    'Write unit tests for your React components',
    'Review common debugging techniques',
    'Study AI ethics guidelines',
  ],
  encouragement: 'Keep up the great work! Consistent practice will get you there.',
};

// ---------------------------------------------------------------------------
// Idle state
// ---------------------------------------------------------------------------

describe('idle state', () => {
  test('renders the section heading', () => {
    render(<CoachingPanel />);
    expect(
      screen.getByRole('heading', { name: /personalised coaching plan/i })
    ).toBeInTheDocument();
  });

  test('renders the "Generate my coaching plan" button', () => {
    render(<CoachingPanel />);
    expect(
      screen.getByRole('button', { name: /generate my coaching plan/i })
    ).toBeInTheDocument();
  });

  test('button is not disabled in idle state', () => {
    render(<CoachingPanel />);
    expect(
      screen.getByRole('button', { name: /generate my coaching plan/i })
    ).not.toBeDisabled();
  });

  test('clicking the button calls onGenerateCoaching once', () => {
    const handler = jest.fn();
    render(<CoachingPanel onGenerateCoaching={handler} />);
    userEvent.click(screen.getByRole('button', { name: /generate my coaching plan/i }));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

describe('loading state', () => {
  test('renders a disabled button labelled "Generating…"', () => {
    render(<CoachingPanel coachingStatus="loading" />);
    const btn = screen.getByRole('button', { name: /generating/i });
    expect(btn).toBeDisabled();
  });

  test('shows in-progress message', () => {
    render(<CoachingPanel coachingStatus="loading" />);
    expect(
      screen.getByText(/preparing your coaching plan/i)
    ).toBeInTheDocument();
  });

  test('does not show the idle "Generate" button', () => {
    render(<CoachingPanel coachingStatus="loading" />);
    expect(
      screen.queryByRole('button', { name: /generate my coaching plan/i })
    ).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

describe('error state', () => {
  test('renders the provided error message', () => {
    render(
      <CoachingPanel
        coachingStatus="error"
        coachingError="Network timeout. Please try again."
      />
    );
    expect(
      screen.getByText('Network timeout. Please try again.')
    ).toBeInTheDocument();
  });

  test('falls back to generic message when coachingError is empty', () => {
    render(<CoachingPanel coachingStatus="error" coachingError="" />);
    expect(
      screen.getByText(/coaching generation failed/i)
    ).toBeInTheDocument();
  });

  test('renders a "Retry" button', () => {
    render(<CoachingPanel coachingStatus="error" />);
    expect(
      screen.getByRole('button', { name: /retry/i })
    ).toBeInTheDocument();
  });

  test('clicking Retry calls onGenerateCoaching once', () => {
    const handler = jest.fn();
    render(
      <CoachingPanel
        coachingStatus="error"
        coachingError="Something went wrong."
        onGenerateCoaching={handler}
      />
    );
    userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Success state
// ---------------------------------------------------------------------------

describe('success state', () => {
  const renderSuccess = async () => {
    const result = render(
      <CoachingPanel
        coachingStatus="success"
        coachingData={sampleCoachingData}
      />
    );

    await userEvent.click(
      screen.getByText(/view full coaching plan/i)
    );

    return result;
  };

  test("shows the primary focus area before expanding", () => {
    render(
      <CoachingPanel
        coachingStatus="success"
        coachingData={sampleCoachingData}
      />
    );

    const focusLabel = screen.getByText(/your focus area/i);
    const focusCard = focusLabel.closest("div");

    expect(focusCard).not.toBeNull();

    expect(
      within(focusCard).getByText(
        sampleCoachingData.improvementAreas[0]
      )
    ).toBeInTheDocument();
  });

  test("shows the first recommended step before expanding", () => {
    render(
      <CoachingPanel
        coachingStatus="success"
        coachingData={sampleCoachingData}
      />
    );

    const recommendationLabel = screen.getByText(
      /recommended next step/i
    );

    const recommendationCard =
      recommendationLabel.closest("div");

    expect(recommendationCard).not.toBeNull();

    expect(
      within(recommendationCard).getByText(
        sampleCoachingData.nextSteps[0]
      )
    ).toBeInTheDocument();
  });

  test("full coaching plan is collapsed initially", () => {
    render(
      <CoachingPanel
        coachingStatus="success"
        coachingData={sampleCoachingData}
      />
    );

    const toggle = screen.getByText(/view full coaching plan/i);
    const details = toggle.closest("details");

    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute("open");
  });

  test("renders the summary text", async () => {
    await renderSuccess();

    expect(
      screen.getByText(sampleCoachingData.summary)
    ).toBeInTheDocument();
  });

    test('renders "Summary" as a heading', async () => {
    await renderSuccess();

    expect(
      screen.getByRole("heading", { name: /^summary$/i })
    ).toBeInTheDocument();
  });

  test('renders "Strengths" as a heading', async () => {
    await renderSuccess();

    expect(
      screen.getByRole("heading", { name: /^strengths$/i })
    ).toBeInTheDocument();
  });

  test('renders "Areas to improve" as a heading', async () => {
    await renderSuccess();

    expect(
      screen.getByRole("heading", { name: /^areas to improve$/i })
    ).toBeInTheDocument();
  });

  test('renders "Next steps" as a heading', async () => {
    await renderSuccess();

    expect(
      screen.getByRole("heading", { name: /^next steps$/i })
    ).toBeInTheDocument();
  });

  test("renders each strength item", async () => {
    await renderSuccess();

    sampleCoachingData.strengths.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test("renders each improvement area in the full plan", async () => {
    await renderSuccess();

    const fullPlan = screen
      .getByText(/view full coaching plan/i)
      .closest("details");

    expect(fullPlan).not.toBeNull();

    sampleCoachingData.improvementAreas.forEach((item) => {
      expect(
        within(fullPlan).getByText(item)
      ).toBeInTheDocument();
    });
  });

  test("renders all three next steps", async () => {
    await renderSuccess();

    sampleCoachingData.nextSteps.forEach((item) => {
      expect(screen.getAllByText(item).length).toBeGreaterThan(0);
    });
  });

  test("renders the encouragement text", async () => {
    await renderSuccess();

    expect(
      screen.getByText(sampleCoachingData.encouragement)
    ).toBeInTheDocument();
  });

});
// ---------------------------------------------------------------------------
// HTML-as-text safety — model output must never be injected as raw HTML
// ---------------------------------------------------------------------------

test(
  "HTML tags in model output are rendered as plain text, not injected as HTML",
  async () => {
    const maliciousData = {
      summary: '<script>alert("xss")</script>',
      strengths: ["<b>Bold claim</b>"],
      improvementAreas: ["<img src=x onerror=alert(1)>"],
      nextSteps: ['<a href="evil">Click</a>', "Step 2", "Step 3"],
      encouragement: "<em>Well done</em>",
    };

    render(
      <CoachingPanel
        coachingStatus="success"
        coachingData={maliciousData}
      />
    );

    await userEvent.click(
      screen.getByText(/view full coaching plan/i)
    );

    expect(
      screen.getByText('<script>alert("xss")</script>')
    ).toBeInTheDocument();

    expect(
      screen.getByText("<b>Bold claim</b>")
    ).toBeInTheDocument();

    expect(document.querySelector("script")).toBeNull();
    expect(document.querySelector("b")).toBeNull();
  }
);
