import React from "react";

/**
 * CoachingPanel
 *
 * Renders the Meta Llama (hosted through IBM watsonx.ai) coaching plan UI in four states:
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
            using IBM watsonx.ai.
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
      {/* Success state */}
      {coachingStatus === "success" && coachingData && (
        <div className="mt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-600">
                Your focus area
              </p>

              <p className="mt-2 font-semibold leading-6 text-slate-900">
                {coachingData.improvementAreas?.[0] ||
                  "Continue strengthening your development skills."}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#10316B]">
                Recommended next step
              </p>

              <p className="mt-2 font-semibold leading-6 text-slate-900">
                {coachingData.nextSteps?.[0] ||
                  "Review your answers and practise the concepts you missed."}
              </p>
            </div>
          </div>

          <details className="mt-5 rounded-xl border border-slate-200">
            <summary className="cursor-pointer px-4 py-3 font-semibold text-[#10316B]">
              View full coaching plan
            </summary>

            <div className="space-y-5 border-t border-slate-200 px-4 py-5 text-slate-700">
              <div>
                <h3 className="font-bold text-slate-900">Summary</h3>
                <p className="mt-2 leading-7">{coachingData.summary}</p>
              </div>

              {coachingData.strengths?.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900">Strengths</h3>

                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {coachingData.strengths.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {coachingData.improvementAreas?.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900">
                    Areas to improve
                  </h3>

                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {coachingData.improvementAreas.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {coachingData.nextSteps?.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900">Next steps</h3>

                  <ol className="mt-2 list-decimal space-y-1 pl-5">
                    {coachingData.nextSteps.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ol>
                </div>
              )}

              {coachingData.encouragement && (
                <p className="rounded-xl bg-slate-50 p-4 leading-7">
                  {coachingData.encouragement}
                </p>
              )}
            </div>
          </details>
        </div>
      )}
    </section>
  );
};

export default CoachingPanel;
