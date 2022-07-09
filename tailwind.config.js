/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern': "url('/home/anita/Desktop/Ablestate Work Space/QuizApp/quiz/src/data/img/background1.jpg')",

      }
    },
  },
  plugins: [],
}
