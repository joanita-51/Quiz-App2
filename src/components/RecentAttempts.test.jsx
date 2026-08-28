import { render, screen } from "@testing-library/react";
import RecentAttempts from "./RecentAttempts";

const attempts = [
  {
    id: "attempt-2",
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
  {
    id: "attempt-1",
    quizId: "ai-web-development-fundamentals",
    completedAt: "2026-08-27T12:30:00.000Z",
    overall: {
      correct: 5,
      total: 11,
      percentage: 45,
      passed: false,
    },
    categories: [],
  },
];

const formatDate = (value) =>
  value === "2026-08-28T12:30:00.000Z"
    ? "August 28, 2026"
    : "August 27, 2026";

test("renders nothing when attempt history is empty", () => {
  const { container } = render(<RecentAttempts />);

  expect(container).toBeEmptyDOMElement();
});

test("renders the heading and browser-storage note", () => {
  render(
    <RecentAttempts
      attemptHistory={attempts}
      formatDate={formatDate}
    />
  );

  expect(
    screen.getByRole("heading", { name: /recent attempts/i })
  ).toBeInTheDocument();

  expect(
    screen.getByText(/attempts are saved only in this browser/i)
  ).toBeInTheDocument();
});

test("renders completion dates using the supplied formatter", () => {
  render(
    <RecentAttempts
      attemptHistory={attempts}
      formatDate={formatDate}
    />
  );

  expect(screen.getByText("August 28, 2026")).toBeInTheDocument();
  expect(screen.getByText("August 27, 2026")).toBeInTheDocument();
});

test("renders scores and percentages", () => {
  render(
    <RecentAttempts
      attemptHistory={attempts}
      formatDate={formatDate}
    />
  );

  expect(screen.getByText("9 of 11 correct")).toBeInTheDocument();
  expect(screen.getByText("5 of 11 correct")).toBeInTheDocument();
  expect(screen.getByText("82%")).toBeInTheDocument();
  expect(screen.getByText("45%")).toBeInTheDocument();
});

test("renders pass and review status as visible text", () => {
  render(
    <RecentAttempts
      attemptHistory={attempts}
      formatDate={formatDate}
    />
  );

  expect(screen.getByText("Passed")).toBeInTheDocument();
  expect(screen.getByText("Needs review")).toBeInTheDocument();
});

test("uses semantic list and time elements", () => {
  const { container } = render(
    <RecentAttempts
      attemptHistory={attempts}
      formatDate={formatDate}
    />
  );

  expect(screen.getByRole("list")).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);

  const times = container.querySelectorAll("time");
  expect(times).toHaveLength(2);
  expect(times[0]).toHaveAttribute(
    "datetime",
    "2026-08-28T12:30:00.000Z"
  );
});

test("shows no more than five attempts", () => {
  const sixAttempts = Array.from({ length: 6 }, (_, index) => ({
    ...attempts[0],
    id: `attempt-${index}`,
  }));

  render(
    <RecentAttempts
      attemptHistory={sixAttempts}
      formatDate={() => "August 28, 2026"}
    />
  );

  expect(screen.getAllByRole("listitem")).toHaveLength(5);
});

test("preserves the received newest-first order", () => {
  render(
    <RecentAttempts
      attemptHistory={attempts}
      formatDate={formatDate}
    />
  );

  const items = screen.getAllByRole("listitem");

  expect(items[0]).toHaveTextContent("9 of 11 correct");
  expect(items[1]).toHaveTextContent("5 of 11 correct");
});

test("handles an invalid date without crashing", () => {
  const invalidAttempt = {
    ...attempts[0],
    id: "invalid-date-attempt",
    completedAt: "not-a-date",
  };

  render(<RecentAttempts attemptHistory={[invalidAttempt]} />);

  expect(screen.getByText("Date unavailable")).toBeInTheDocument();
});