# Quizote

Quizote is a responsive learning application that helps beginner web developers test their web-development knowledge and learn how to review AI-generated code safely.

[View the live application](https://quizote.netlify.app/)

## Features

* Ten beginner-friendly questions
* One-question-at-a-time navigation
* Progress tracking
* Unanswered-question validation
* Automatic score calculation
* Correct-answer explanations
* Answer review and quiz retry
* Responsive desktop and mobile layouts

## How it works

1. Start the quiz from the landing page.
2. Answer all ten questions.
3. Navigate between questions without losing selected answers.
4. Submit the completed quiz.
5. Review your score, answers, and explanations.
6. Retry the quiz to improve your result.

## Planned AI feature

Personalized AI explanations are not implemented yet.

A future version will allow students to request:

* A simpler explanation
* A practical example
* A similar practice question
* Additional clarification about an incorrect answer

Quiz scoring will continue to be handled by the application rather than AI.

## Built with

* React
* React Router
* JavaScript
* Tailwind CSS
* Netlify

## Run locally

Clone the repository:

```bash
git clone https://github.com/joanita-51/Quiz-App2.git
cd Quiz-App2
```

Install dependencies:

```bash
npm install
```

If npm reports peer-dependency conflicts:

```bash
npm install --legacy-peer-deps
```

Start the development server:

```bash
npm start
```

Open http://localhost:3000 in your browser.

## Production build

```bash
npm run build
```

The production files are generated in the `build` directory.
