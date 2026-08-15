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

          <Link
            to="/login"
            className="rounded-lg border border-white/30 px-4 py-2 font-semibold transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            Log in
          </Link>
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
    </main>
  );
};

export default Landing;