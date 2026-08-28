import { render, screen } from '@testing-library/react';
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
  const renderSuccess = () =>
    render(
      <CoachingPanel
        coachingStatus="success"
        coachingData={sampleCoachingData}
      />
    );

  test('renders the summary text', () => {
    renderSuccess();
    expect(
      screen.getByText(sampleCoachingData.summary)
    ).toBeInTheDocument();
  });

  test('renders "Summary" as a heading', () => {
    renderSuccess();
    expect(
      screen.getByRole('heading', { name: /^summary$/i })
    ).toBeInTheDocument();
  });

  test('renders "Strengths" as a heading', () => {
    renderSuccess();
    expect(
      screen.getByRole('heading', { name: /^strengths$/i })
    ).toBeInTheDocument();
  });

  test('renders "Areas to improve" as a heading', () => {
    renderSuccess();
    expect(
      screen.getByRole('heading', { name: /^areas to improve$/i })
    ).toBeInTheDocument();
  });

  test('renders "Next steps" as a heading', () => {
    renderSuccess();
    expect(
      screen.getByRole('heading', { name: /^next steps$/i })
    ).toBeInTheDocument();
  });

  test('renders each strength item', () => {
    renderSuccess();
    sampleCoachingData.strengths.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test('renders each improvement area item', () => {
    renderSuccess();
    sampleCoachingData.improvementAreas.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test('renders all three next steps with numbered badges', () => {
    renderSuccess();
    sampleCoachingData.nextSteps.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
    // Numbered badges 1–3
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('renders the encouragement text', () => {
    renderSuccess();
    expect(
      screen.getByText(sampleCoachingData.encouragement)
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// HTML-as-text safety — model output must never be injected as raw HTML
// ---------------------------------------------------------------------------

test('HTML tags in model output are rendered as plain text, not injected as HTML', () => {
  const maliciousData = {
    summary: '<script>alert("xss")</script>',
    strengths: ['<b>Bold claim</b>'],
    improvementAreas: ['<img src=x onerror=alert(1)>'],
    nextSteps: ['<a href="evil">Click</a>', 'Step 2', 'Step 3'],
    encouragement: '<em>Well done</em>',
  };
  render(
    <CoachingPanel
      coachingStatus="success"
      coachingData={maliciousData}
    />
  );

  // The raw tag strings appear as visible text, not interpreted as elements
  expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
  expect(screen.getByText('<b>Bold claim</b>')).toBeInTheDocument();

  // No <script> elements exist in the DOM
  expect(document.querySelector('script[src]')).toBeNull();
  // No unexpected <b> elements injected by model output
  expect(document.querySelector('b')).toBeNull();
});
