import React from "react";

/**
 * CoachingPanel
 *
 * Renders the Granite coaching plan UI in four states:
 *   idle    — "Generate my coaching plan" button
 *   loading — disabled button with accessible loading indicator
 *   success — structured coaching sections
 *   error   — friendly message with Retry action
 *
 * All model text is rendered through React text nodes.
 * dangerouslySetInnerHTML is never used.
 */
const CoachingPanel = ({
  coachingStatus = "idle",
  coachingData = null,
  coachingError = "",
  onGenerateCoaching = () => {},
}) => {
  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-[#10316B]">
        Personalised coaching plan
      </h2>

      {/* ------------------------------------------------------------------ */}
      {/* Idle state                                                          */}
      {/* ------------------------------------------------------------------ */}
      {coachingStatus === "idle" && (
        <div className="mt-4">
          <p className="text-sm leading-6 text-slate-600">
            Generate a personalised coaching plan based on your quiz results
            using IBM watsonx.ai Granite.
          </p>
          <button
            type="button"
            onClick={onGenerateCoaching}
            className="mt-4 rounded-lg bg-[#10316B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Generate my coaching plan
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Loading state                                                       */}
      {/* ------------------------------------------------------------------ */}
      {coachingStatus === "loading" && (
        <div
          className="mt-4"
          aria-live="polite"
          aria-busy="true"
        >
          <button
            type="button"
            disabled
            className="rounded-lg bg-[#10316B] px-5 py-2.5 text-sm font-semibold text-white opacity-60 disabled:cursor-not-allowed"
          >
            Generating…
          </button>
          <p className="mt-3 text-sm text-slate-500">
            Preparing your coaching plan. This may take a few seconds.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Error state                                                         */}
      {/* ------------------------------------------------------------------ */}
      {coachingStatus === "error" && (
        <div className="mt-4" role="alert">
          <p className="text-sm text-red-700">
            {coachingError ||
              "Coaching generation failed. Your quiz results are still available above."}
          </p>
          <button
            type="button"
            onClick={onGenerateCoaching}
            className="mt-3 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Retry
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Success state                                                       */}
      {/* ------------------------------------------------------------------ */}
      {coachingStatus === "success" && coachingData && (
        <div className="mt-5 space-y-6 text-slate-700">

          {/* Summary */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-orange-500">
              Summary
            </p>
            <p className="mt-2 leading-7">{coachingData.summary}</p>
          </div>

          {/* Strengths */}
          {coachingData.strengths.length > 0 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-orange-500">
                Strengths
              </p>
              <ul className="mt-2 space-y-1">
                {coachingData.strengths.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 leading-7">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvement areas */}
          {coachingData.improvementAreas.length > 0 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-orange-500">
                Areas to improve
              </p>
              <ul className="mt-2 space-y-1">
                {coachingData.improvementAreas.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 leading-7">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next steps */}
          {coachingData.nextSteps.length > 0 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-orange-500">
                Next steps
              </p>
              <ol className="mt-2 space-y-1 list-none">
                {coachingData.nextSteps.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 leading-7">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10316B] text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Encouragement */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="leading-7">{coachingData.encouragement}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default CoachingPanel;
