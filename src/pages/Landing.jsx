import React from "react";
import hero from "../data/hero.png";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#10316B] text-white">
      <header className="border-b border-white/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            aria-label="Quizote home"
          >
            QuiZ<span className="text-[#f57328]">ote</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="font-medium text-blue-100 transition hover:text-[#f57328]"
            >
              How it works
            </a>

            <a
              href="#topics"
              className="font-medium text-blue-100 transition hover:text-[#f57328]"
            >
              Topics
            </a>
          </div>

          {/* <Link
            to="/login"
            className="rounded-lg border border-white/30 px-4 py-2 font-semibold transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            Log in
          </Link> */}
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-14 sm:px-8 lg:min-h-[calc(100vh-81px)] lg:-translate-y-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div className="max-w-2xl">
          <p className="mb-4 font-semibold uppercase tracking-[0.18em] text-orange-300">
            AI web development quiz
          </p>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:whitespace-nowrap lg:text-5xl xl:text-6xl">
            Code smarter
            <span className="text-[#f57328]"> with AI.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-blue-100 sm:text-lg">
            Test your web skills and learn to review AI-generated code safely.
          </p>

          <div className="mt-8">
            <Link
              to="/quiz"
              className="inline-block w-full rounded-lg bg-[#f57328] px-6 py-3.5 text-center font-semibold shadow-lg transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 sm:w-auto"
            >
              Start quiz
            </Link>
          </div>

          <p className="mt-7 text-sm text-blue-200">
            10 questions
            <span className="mx-2" aria-hidden="true">•</span>
            8 minutes
            <span className="mx-2" aria-hidden="true">•</span>
            Beginner
          </p>
        </div>

        {/* <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-xl">
          <div className="absolute inset-12 rounded-full bg-orange-400/20 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 px-5 pt-3">
            <img
              src={hero}
              alt="Student ready to learn web development"
              className="mx-auto block w-full max-w-md scale-110 object-contain"
              style={{ transformOrigin: "bottom center" }}
            />
          </div>
        </div> */}

        <div className="relative mx-auto w-[90%] max-w-sm sm:max-w-md lg:max-w-xl">
          {/* Background glow */}
          <div
            aria-hidden="true"
            className="absolute inset-8 rounded-full bg-orange-400/20 blur-3xl"
          />

          {/* Image card */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-white/10 to-blue-950/20 px-5 pt-3 shadow-2xl shadow-blue-950/30">
            {/* Decorative circles */}
            <div
              aria-hidden="true"
              className="absolute -right-14 -top-14 h-40 w-40 rounded-full border border-orange-400/20"
            />

            <div
              aria-hidden="true"
              className="absolute -right-8 -top-8 h-24 w-24 rounded-full border border-orange-400/30"
            />

            {/* Subtle code decoration */}
            <div
              aria-hidden="true"
              className="absolute left-6 top-6 font-mono text-sm text-white/15"
            >
              {"{ code }"}
            </div>

            <img
              src={hero}
              alt="Student ready to learn web development"
              className="relative z-10 mx-auto block w-full max-w-md scale-105 object-contain"
              style={{ transformOrigin: "bottom center" }}
            />
          </div>

          {/* Floating badges: hidden on very small screens */}
          <div className="absolute -left-5 top-16 hidden rounded-xl border border-white/15 bg-[#173c78]/90 px-4 py-3 shadow-xl backdrop-blur sm:block">
            <p className="font-mono text-sm font-semibold text-orange-300">
              {"</>"}
            </p>
            <p className="text-xs text-blue-100">Web skills</p>
          </div>

          <div className="absolute -right-5 bottom-16 hidden rounded-xl border border-white/15 bg-[#173c78]/90 px-4 py-3 shadow-xl backdrop-blur sm:block">
            <p className="text-sm font-semibold text-orange-300">
              AI
            </p>
            <p className="text-xs text-blue-100">Code safely</p>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-t border-white/10 bg-[#0d2b60] px-5 py-20 sm:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Learn through short, focused quizzes
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="text-sm font-bold text-orange-300">01</span>
              <h3 className="mt-4 text-xl font-semibold">
                Answer the questions
              </h3>
              <p className="mt-3 leading-7 text-blue-100">
                Complete ten beginner-friendly questions about web development
                and AI-assisted coding.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="text-sm font-bold text-orange-300">02</span>
              <h3 className="mt-4 text-xl font-semibold">
                Check your result
              </h3>
              <p className="mt-3 leading-7 text-blue-100">
                Submit your answers and receive an accurate score based on your
                final selections.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="text-sm font-bold text-orange-300">03</span>
              <h3 className="mt-4 text-xl font-semibold">
                Learn from mistakes
              </h3>
              <p className="mt-3 leading-7 text-blue-100">
                Review explanations, understand incorrect answers, and retry the
                quiz when you are ready.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="topics" className="bg-[#10316B] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">
              Topics
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              What you will practise
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">
              Foundational skills for developers building web applications with
              AI coding assistants.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                title: "Web fundamentals",
                description: "HTML, JavaScript, and application structure.",
              },
              {
                number: "02",
                title: "React and state",
                description: "Managing answers and changing interface state.",
              },
              {
                number: "03",
                title: "Testing and debugging",
                description: "Finding errors and verifying generated code.",
              },
              {
                number: "04",
                title: "Responsible AI coding",
                description: "Security, accessibility, Git, and AI reliability.",
              },
            ].map((topic) => (
              <article
                key={topic.number}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-orange-300/40"
              >
                <span className="text-sm font-bold text-orange-300">
                  {topic.number}
                </span>

                <h3 className="mt-4 text-lg font-semibold">
                  {topic.title}
                </h3>

                <p className="mt-2 leading-6 text-blue-100">
                  {topic.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0d2b60] px-5 py-16 text-center sm:px-8">
        <h2 className="text-3xl font-bold">
          Ready to test your knowledge?
        </h2>

        <p className="mt-3 text-blue-100">
          Ten questions. About eight minutes.
        </p>

        <Link
          to="/quiz"
          className="mt-7 inline-block rounded-lg bg-[#f57328] px-7 py-3.5 font-semibold transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          Start quiz
        </Link>
      </section>

      <footer className="border-t border-white/10 bg-[#081f49] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-center text-sm text-blue-200 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <Link
            to="/"
            className="text-xl font-bold text-white"
            aria-label="Quizote home"
          >
            QuiZ<span className="text-[#f57328]">ote</span>
          </Link>

          <p>
            Built to help beginner developers understand the code they create.
          </p>

          <a
            href="https://github.com/joanita-51/Quiz-App2"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-white hover:text-orange-300"
          >
            View on GitHub
          </a>
        </div>
      </footer>


    </main>
  );
};

export default Landing;