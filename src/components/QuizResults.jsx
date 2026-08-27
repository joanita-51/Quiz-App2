import React from "react";

const RECOMMENDATIONS = {
  "web-fundamentals":
    "Review how HTML and JavaScript work together in a web application.",
  "react-state":
    "Practise connecting controlled inputs and user actions to React state.",
  "testing-debugging":
    "Practise writing tests that expose scoring and state-management errors.",
  "responsible-ai":
    "Practise reviewing AI-generated code for security, accessibility, and reliability.",
};

const FALLBACK_RECOMMENDATION =
  "Review your missed questions and practise the concepts that need improvement.";

const QuizResults = ({
  questions,
  answers,
  score,
  totalQuestions,
  resultPercentage,
  passingPercentage,
  onTryAgain,
  categoryResults = [],
}) => {
  // ---------------------------------------------------------------------------
  // Summary-selection derived values
  // ---------------------------------------------------------------------------

  const assessedCategories = categoryResults.filter(
    (cat) => cat.level !== "Not assessed"
  );

  const strongestCategory = assessedCategories.reduce(
    (best, cat) =>
      !best || cat.percentage > best.percentage ? cat : best,
    null
  );

  const priorityCategory = assessedCategories.reduce(
    (best, cat) =>
      !best || cat.percentage < best.percentage ? cat : best,
    null
  );

  const allEqual =
    assessedCategories.length > 0 &&
    assessedCategories.every(
      (cat) => cat.percentage === assessedCategories[0].percentage
    );

  return (
    <section>
      {/* ------------------------------------------------------------------ */}
      {/* Overall result card                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
          Quiz complete
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#10316B] sm:text-4xl">
          Your result
        </h1>

        <p className="mt-5 text-5xl font-bold text-slate-900">
          {resultPercentage}%
        </p>

        <p className="mt-3 text-lg text-slate-600">
          {score} out of {totalQuestions} correct
        </p>

        <p
          className={`mt-4 font-semibold ${
            resultPercentage >= passingPercentage
              ? "text-green-700"
              : "text-orange-600"
          }`}
        >
          {resultPercentage >= passingPercentage
            ? "Well done! You passed the quiz."
            : "Review the explanations and try again."}
        </p>

        <button
          type="button"
          onClick={onTryAgain}
          className="mt-7 rounded-lg bg-[#f57328] px-6 py-3 font-semibold text-white transition hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          Try again
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Skills breakdown                                                    */}
      {/* ------------------------------------------------------------------ */}
      {categoryResults.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#10316B]">
            Skills breakdown
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {categoryResults.map((cat) => (
              <div
                key={cat.categoryId}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-orange-500">
                  {cat.categoryName}
                </p>

                {cat.level === "Not assessed" ? (
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Not assessed
                  </p>
                ) : (
                  <>
                    <p className="mt-2 text-base font-bold text-slate-900">
                      {cat.correct} of {cat.total} correct
                    </p>

                    <p className="mt-0.5 text-sm text-slate-600">
                      {cat.percentage}%
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {cat.level}
                    </p>

                    <div
                      role="progressbar"
                      aria-label={`${cat.categoryName}: ${cat.percentage}%`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={cat.percentage}
                      className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200"
                    >
                      <div
                        className="h-full rounded-full bg-[#f57328]"
                        style={{ width: `${cat.percentage}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Skills summary                                                      */}
      {/* ------------------------------------------------------------------ */}
      {categoryResults.length > 0 && (
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-[#10316B]">
            Skills summary
          </h2>

          {assessedCategories.length === 0 ? (
            <p className="mt-3 leading-7 text-slate-700">
              Complete an assessed quiz to receive a skills summary.
            </p>
          ) : allEqual ? (
            <p className="mt-3 leading-7 text-slate-700">
              Your results are currently even across the assessed skills.
            </p>
          ) : (
            <div className="mt-3 space-y-2 text-slate-700">
              <p>
                <span className="font-semibold">Strongest area:</span>{" "}
                {strongestCategory.categoryName}
              </p>
              <p>
                <span className="font-semibold">
                  Priority improvement area:
                </span>{" "}
                {priorityCategory.categoryName}
              </p>
              <p className="mt-3 leading-7">
                {RECOMMENDATIONS[priorityCategory.categoryId] ??
                  FALLBACK_RECOMMENDATION}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Review your answers                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-[#10316B]">
          Review your answers
        </h2>

        <div className="mt-5 space-y-5">
          {questions.map((question, index) => {
            const selectedOption = question.options.find(
              (option) => option.id === answers[question.id]
            );

            const correctOption = question.options.find(
              (option) => option.id === question.correctOptionId
            );

            const isCorrect =
              answers[question.id] === question.correctOptionId;

            return (
              <article
                key={question.id}
                className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-500">
                    Question {index + 1}
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold">
                  {question.prompt}
                </h3>

                <dl className="mt-4 space-y-3 text-sm sm:text-base">
                  <div>
                    <dt className="font-semibold text-slate-500">
                      Your answer
                    </dt>
                    <dd
                      className={
                        isCorrect ? "text-green-700" : "text-red-700"
                      }
                    >
                      {selectedOption?.text}
                    </dd>
                  </div>

                  {!isCorrect && (
                    <div>
                      <dt className="font-semibold text-slate-500">
                        Correct answer
                      </dt>
                      <dd className="text-green-700">
                        {correctOption?.text}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-[#10316B]">
                    Explanation
                  </p>

                  <p className="mt-2 leading-7 text-slate-700">
                    {question.explanation}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuizResults;
