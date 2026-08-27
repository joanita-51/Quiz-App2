import React, { useState } from "react";
import { Link } from "react-router-dom";
import { questions, quiz } from "../data/questions";
import QuizResults from "../components/QuizResults";
import { calculateQuizResults } from "../utils/calculateQuizResults";

const Quiz = () => {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);
  const [quizResults, setQuizResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");

  const currentQuestion = questions[currentQuestionIndex];

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion =
    currentQuestionIndex === questions.length - 1;

  const progressPercentage = Math.round(
    ((currentQuestionIndex + 1) / questions.length) * 100
  );

  const selectAnswer = (questionId, optionId) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: optionId,
    }));

    setError("");
  };

  const goToNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(
        (previousIndex) => previousIndex + 1
      );
      setError("");
    }
  };

  const goToPreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(
        (previousIndex) => previousIndex - 1
      );
      setError("");
    }
  };

  const submitQuiz = () => {
    const firstUnansweredIndex = questions.findIndex(
      (question) => !answers[question.id]
    );

    if (firstUnansweredIndex !== -1) {
      const unansweredCount = questions.filter(
        (question) => !answers[question.id]
      ).length;

      setCurrentQuestionIndex(firstUnansweredIndex);

      setError(
        `You have ${unansweredCount} unanswered question${
          unansweredCount === 1 ? "" : "s"
        }. Complete them before submitting.`
      );

      return;
    }

    const results = calculateQuizResults(questions, answers);
    setQuizResults(results);
    setShowResults(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tryAgain = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setQuizResults(null);
    setShowResults(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-[#10316B]"
            aria-label="Quizote home"
          >
            QuiZ
            <span className="text-[#f57328]">
              ote
            </span>
          </Link>

          <Link
            to="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Exit quiz
          </Link>
        </header>

        {showResults ? (
          <QuizResults
            questions={questions}
            answers={answers}
            score={quizResults.totalCorrect}
            totalQuestions={quizResults.totalQuestions}
            resultPercentage={quizResults.overallPercentage}
            passingPercentage={quiz.passingPercentage}
            onTryAgain={tryAgain}
            categoryResults={quizResults.categories}
          />
        ) : (
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-orange-500">
                {quiz.title}
              </p>

              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-[#10316B]">
                  Question {currentQuestionIndex + 1} of{" "}
                  {questions.length}
                </p>

                <p className="text-sm text-slate-500">
                  {progressPercentage}% complete
                </p>
              </div>

              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-label="Quiz progress"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={progressPercentage}
              >
                <div
                  className="h-full rounded-full bg-[#f57328] transition-all duration-300"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <fieldset className="mt-8">
              <legend className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                {currentQuestion.prompt}
              </legend>

              <p className="mt-3 text-sm capitalize text-slate-500">
                {currentQuestion.category.replaceAll(
                  "-",
                  " "
                )}{" "}
                · {currentQuestion.difficulty}
              </p>

              <div className="mt-7 space-y-3">
                {currentQuestion.options.map(
                  (option) => {
                    const isSelected =
                      answers[currentQuestion.id] ===
                      option.id;

                    return (
                      <label
                        key={option.id}
                        htmlFor={`${currentQuestion.id}-${option.id}`}
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                            : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          id={`${currentQuestion.id}-${option.id}`}
                          name={currentQuestion.id}
                          value={option.id}
                          checked={isSelected}
                          onChange={() =>
                            selectAnswer(
                              currentQuestion.id,
                              option.id
                            )
                          }
                          className="h-5 w-5 shrink-0 accent-orange-500"
                        />

                        <span className="leading-6 text-slate-800">
                          {option.text}
                        </span>
                      </label>
                    );
                  }
                )}
              </div>
            </fieldset>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={goToPreviousQuestion}
                disabled={isFirstQuestion}
                className="rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
              >
                Previous
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={submitQuiz}
                  className="rounded-lg bg-[#f57328] px-4 py-3 font-semibold text-white transition hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300 sm:px-6"
                >
                  Submit quiz
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goToNextQuestion}
                  className="rounded-lg bg-[#10316B] px-4 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:px-6"
                >
                  Next
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Quiz;