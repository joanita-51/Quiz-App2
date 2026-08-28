function defaultFormatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString();
}

function RecentAttempts({
  attemptHistory = [],
  formatDate = defaultFormatDate,
}) {
  const visibleAttempts = attemptHistory.slice(0, 5);

  if (visibleAttempts.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="recent-attempts-heading"
      className="rounded-2xl bg-white p-5 shadow-sm sm:p-8"
    >
      <div>
        <h2
          id="recent-attempts-heading"
          className="text-2xl font-bold text-[#10316B]"
        >
          Recent attempts
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Attempts are saved only in this browser.
        </p>
      </div>

      <ol className="mt-6 space-y-3">
        {visibleAttempts.map((attempt) => (
          <li
            key={attempt.id}
            className="rounded-xl border border-slate-200 p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <time
                  dateTime={attempt.completedAt}
                  className="text-sm text-slate-600"
                >
                  {formatDate(attempt.completedAt)}
                </time>

                <p className="mt-1 font-semibold text-slate-900">
                  {attempt.overall.correct} of {attempt.overall.total} correct
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-lg font-bold text-[#10316B]">
                  {attempt.overall.percentage}%
                </p>

                <p className="text-sm font-semibold text-slate-700">
                  {attempt.overall.passed ? "Passed" : "Needs review"}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default RecentAttempts;