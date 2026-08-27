import { categories } from "../data/categories";

/**
 * Returns a deterministic skill level label for a given percentage score.
 * Called only when a category has at least one question (total > 0).
 *
 * @param {number} percentage - Integer 0–100
 * @returns {"Strong"|"Developing"|"Needs improvement"}
 */
export function getSkillLevel(percentage) {
  if (percentage >= 80) return "Strong";
  if (percentage >= 50) return "Developing";
  return "Needs improvement";
}

/**
 * Derives a complete quiz result from the questions array and the student's
 * selected answers. Pure function — does not mutate any input.
 *
 * Unanswered questions (missing key in answers) are counted as incorrect and
 * their IDs appear in missedQuestionIds.
 *
 * A registered category that has no matching questions receives:
 *   correct: 0, total: 0, percentage: 0, level: "Not assessed", missedQuestionIds: []
 *
 * If the questions array is empty every category receives the same shape and
 * overallPercentage is 0.
 *
 * @param {Array}  questions - Array of question objects from questions.js
 * @param {Object} answers   - Map of questionId → selectedOptionId
 * @returns {{
 *   totalCorrect: number,
 *   totalQuestions: number,
 *   overallPercentage: number,
 *   categories: Array<{
 *     categoryId: string,
 *     categoryName: string,
 *     correct: number,
 *     total: number,
 *     percentage: number,
 *     level: string,
 *     missedQuestionIds: string[]
 *   }>
 * }}
 */
export function calculateQuizResults(questions, answers) {
  const totalQuestions = questions.length;

  let totalCorrect = 0;

  // Build per-category data in a single pass over questions.
  // Use a Map keyed by categoryId so look-up is O(1).
  const categoryMap = new Map();

  for (const question of questions) {
    const isCorrect = answers[question.id] === question.correctOptionId;

    if (isCorrect) {
      totalCorrect += 1;
    }

    if (!categoryMap.has(question.category)) {
      categoryMap.set(question.category, { correct: 0, total: 0, missedIds: [] });
    }

    const entry = categoryMap.get(question.category);
    entry.total += 1;

    if (isCorrect) {
      entry.correct += 1;
    } else {
      entry.missedIds.push(question.id);
    }
  }

  const overallPercentage =
    totalQuestions === 0
      ? 0
      : Math.round((totalCorrect / totalQuestions) * 100);

  // Iterate over the registry to guarantee all four categories appear in
  // registry order and display names come from the registry.
  const categoryResults = categories.map((registryEntry) => {
    const entry = categoryMap.get(registryEntry.id);

    if (!entry || entry.total === 0) {
      return {
        categoryId: registryEntry.id,
        categoryName: registryEntry.displayName,
        correct: 0,
        total: 0,
        percentage: 0,
        level: "Not assessed",
        missedQuestionIds: [],
      };
    }

    const percentage = Math.round((entry.correct / entry.total) * 100);

    return {
      categoryId: registryEntry.id,
      categoryName: registryEntry.displayName,
      correct: entry.correct,
      total: entry.total,
      percentage,
      level: getSkillLevel(percentage),
      missedQuestionIds: entry.missedIds,
    };
  });

  return {
    totalCorrect,
    totalQuestions,
    overallPercentage,
    categories: categoryResults,
  };
}
