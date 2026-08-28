import { questions } from './questions';
import { CATEGORY_IDS } from './categories';

const validCategoryIds = Object.values(CATEGORY_IDS);

// ---------------------------------------------------------------------------
// a. Validity: every question uses a recognised category
// ---------------------------------------------------------------------------

test('every question has a recognised category', () => {
  questions.forEach((question) => {
    expect(validCategoryIds).toContain(question.category);
  });
});

// ---------------------------------------------------------------------------
// b. Uniqueness: all question IDs are distinct
// ---------------------------------------------------------------------------

test('all question IDs are unique', () => {
  const ids = questions.map((q) => q.id);
  expect(new Set(ids).size).toBe(ids.length);
});

// ---------------------------------------------------------------------------
// c. Referential integrity: correctOptionId matches one of the question's options
// ---------------------------------------------------------------------------

test('every correctOptionId matches one of the question options', () => {
  questions.forEach((question) => {
    const match = question.options.find(
      (option) => option.id === question.correctOptionId
    );
    expect(match).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// d. Completeness: every question has a non-empty explanation
// ---------------------------------------------------------------------------

test('every question has a non-empty explanation', () => {
  questions.forEach((question) => {
    expect(typeof question.explanation).toBe('string');
    expect(question.explanation.trim().length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// e. Coverage: all four approved category IDs are represented in the question set
// (intentionally distinct from the validity test above)
// ---------------------------------------------------------------------------

test('all four approved category IDs are represented in the question set', () => {
  const usedCategories = new Set(questions.map((q) => q.category));
  validCategoryIds.forEach((id) => {
    expect(usedCategories).toContain(id);
  });
});
