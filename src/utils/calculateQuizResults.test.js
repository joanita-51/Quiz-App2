import { getSkillLevel, calculateQuizResults } from './calculateQuizResults';

// ---------------------------------------------------------------------------
// Inline fixtures — isolated from src/data/questions.js
// All fields not read by calculateQuizResults are omitted.
// ---------------------------------------------------------------------------

const makeQuestion = (id, category, correctOptionId = 'correct') => ({
  id,
  category,
  correctOptionId,
  options: [{ id: 'correct' }, { id: 'wrong' }],
});

// Standard set: one question per category
const qWF  = makeQuestion('q-wf',  'web-fundamentals');
const qRS  = makeQuestion('q-rs',  'react-state');
const qTD  = makeQuestion('q-td',  'testing-debugging');
const qRAI = makeQuestion('q-rai', 'responsible-ai');

const fourQuestions = [qWF, qRS, qTD, qRAI];

const allCorrect   = { 'q-wf': 'correct', 'q-rs': 'correct', 'q-td': 'correct', 'q-rai': 'correct' };
const allWrong     = { 'q-wf': 'wrong',   'q-rs': 'wrong',   'q-td': 'wrong',   'q-rai': 'wrong' };
const emptyAnswers = {};

// ---------------------------------------------------------------------------
// getSkillLevel — boundary tests
// ---------------------------------------------------------------------------

describe('getSkillLevel', () => {
  test('returns Needs improvement at 0',   () => expect(getSkillLevel(0)).toBe('Needs improvement'));
  test('returns Needs improvement at 49',  () => expect(getSkillLevel(49)).toBe('Needs improvement'));
  test('returns Developing at 50',         () => expect(getSkillLevel(50)).toBe('Developing'));
  test('returns Developing at 79',         () => expect(getSkillLevel(79)).toBe('Developing'));
  test('returns Strong at 80',             () => expect(getSkillLevel(80)).toBe('Strong'));
  test('returns Strong at 100',            () => expect(getSkillLevel(100)).toBe('Strong'));
});

// ---------------------------------------------------------------------------
// calculateQuizResults
// ---------------------------------------------------------------------------

describe('calculateQuizResults', () => {

  // -------------------------------------------------------------------------
  // Scenario A — all answers correct
  // -------------------------------------------------------------------------

  describe('Scenario A: all answers correct', () => {
    let result;
    beforeEach(() => { result = calculateQuizResults(fourQuestions, allCorrect); });

    test('totalCorrect is 4',         () => expect(result.totalCorrect).toBe(4));
    test('totalQuestions is 4',       () => expect(result.totalQuestions).toBe(4));
    test('overallPercentage is 100',  () => expect(result.overallPercentage).toBe(100));

    test('each category has correct 1, total 1, percentage 100, level Strong', () => {
      result.categories.forEach((cat) => {
        expect(cat.correct).toBe(1);
        expect(cat.total).toBe(1);
        expect(cat.percentage).toBe(100);
        expect(cat.level).toBe('Strong');
      });
    });

    test('no missed question IDs in any category', () => {
      result.categories.forEach((cat) => {
        expect(cat.missedQuestionIds).toHaveLength(0);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Scenario B — all answers wrong
  // -------------------------------------------------------------------------

  describe('Scenario B: all answers wrong', () => {
    let result;
    beforeEach(() => { result = calculateQuizResults(fourQuestions, allWrong); });

    test('totalCorrect is 0',        () => expect(result.totalCorrect).toBe(0));
    test('overallPercentage is 0',   () => expect(result.overallPercentage).toBe(0));

    test('each category has correct 0, percentage 0, level Needs improvement', () => {
      result.categories.forEach((cat) => {
        expect(cat.correct).toBe(0);
        expect(cat.percentage).toBe(0);
        expect(cat.level).toBe('Needs improvement');
      });
    });

    test('each question ID appears in its category missedQuestionIds', () => {
      const wf  = result.categories.find(c => c.categoryId === 'web-fundamentals');
      const rs  = result.categories.find(c => c.categoryId === 'react-state');
      const td  = result.categories.find(c => c.categoryId === 'testing-debugging');
      const rai = result.categories.find(c => c.categoryId === 'responsible-ai');

      expect(wf.missedQuestionIds).toContain('q-wf');
      expect(rs.missedQuestionIds).toContain('q-rs');
      expect(td.missedQuestionIds).toContain('q-td');
      expect(rai.missedQuestionIds).toContain('q-rai');
    });
  });

  // -------------------------------------------------------------------------
  // Scenario C — mixed answers across all four categories
  // -------------------------------------------------------------------------

  describe('Scenario C: mixed answers', () => {
    // q-wf and q-rs correct; q-td and q-rai wrong
    const mixedAnswers = { 'q-wf': 'correct', 'q-rs': 'correct', 'q-td': 'wrong', 'q-rai': 'wrong' };
    let result;
    beforeEach(() => { result = calculateQuizResults(fourQuestions, mixedAnswers); });

    test('totalCorrect is 2',       () => expect(result.totalCorrect).toBe(2));
    test('overallPercentage is 50', () => expect(result.overallPercentage).toBe(50));

    test('web-fundamentals: correct 1, percentage 100, level Strong', () => {
      const cat = result.categories.find(c => c.categoryId === 'web-fundamentals');
      expect(cat.correct).toBe(1);
      expect(cat.percentage).toBe(100);
      expect(cat.level).toBe('Strong');
    });

    test('react-state: correct 1, percentage 100, level Strong', () => {
      const cat = result.categories.find(c => c.categoryId === 'react-state');
      expect(cat.correct).toBe(1);
      expect(cat.percentage).toBe(100);
      expect(cat.level).toBe('Strong');
    });

    test('testing-debugging: correct 0, percentage 0, level Needs improvement, q-td missed', () => {
      const cat = result.categories.find(c => c.categoryId === 'testing-debugging');
      expect(cat.correct).toBe(0);
      expect(cat.percentage).toBe(0);
      expect(cat.level).toBe('Needs improvement');
      expect(cat.missedQuestionIds).toContain('q-td');
    });

    test('responsible-ai: correct 0, percentage 0, level Needs improvement, q-rai missed', () => {
      const cat = result.categories.find(c => c.categoryId === 'responsible-ai');
      expect(cat.correct).toBe(0);
      expect(cat.percentage).toBe(0);
      expect(cat.level).toBe('Needs improvement');
      expect(cat.missedQuestionIds).toContain('q-rai');
    });
  });

  // -------------------------------------------------------------------------
  // Scenario D — unanswered question counted as incorrect
  // -------------------------------------------------------------------------

  describe('Scenario D: unanswered question', () => {
    // q-wf, q-rs, q-td answered correctly; q-rai not answered
    const partialAnswers = { 'q-wf': 'correct', 'q-rs': 'correct', 'q-td': 'correct' };
    let result;
    beforeEach(() => { result = calculateQuizResults(fourQuestions, partialAnswers); });

    test('totalCorrect is 3',                                      () => expect(result.totalCorrect).toBe(3));
    test('responsible-ai correct is 0',                            () => {
      const cat = result.categories.find(c => c.categoryId === 'responsible-ai');
      expect(cat.correct).toBe(0);
    });
    test('responsible-ai level is Needs improvement',              () => {
      const cat = result.categories.find(c => c.categoryId === 'responsible-ai');
      expect(cat.level).toBe('Needs improvement');
    });
    test('unanswered q-rai appears in responsible-ai missedQuestionIds', () => {
      const cat = result.categories.find(c => c.categoryId === 'responsible-ai');
      expect(cat.missedQuestionIds).toContain('q-rai');
    });
  });

  // -------------------------------------------------------------------------
  // Scenario E — registered category with no questions
  // -------------------------------------------------------------------------

  describe('Scenario E: registered category with no questions', () => {
    // Only one web-fundamentals question; other three categories have no questions
    let result;
    beforeEach(() => {
      result = calculateQuizResults([qWF], { 'q-wf': 'correct' });
    });

    test('result still has 4 category entries', () => {
      expect(result.categories).toHaveLength(4);
    });

    test('react-state: correct 0, total 0, percentage 0, level Not assessed, no missed IDs', () => {
      const cat = result.categories.find(c => c.categoryId === 'react-state');
      expect(cat.correct).toBe(0);
      expect(cat.total).toBe(0);
      expect(cat.percentage).toBe(0);
      expect(cat.level).toBe('Not assessed');
      expect(cat.missedQuestionIds).toHaveLength(0);
    });

    test('testing-debugging is also Not assessed', () => {
      const cat = result.categories.find(c => c.categoryId === 'testing-debugging');
      expect(cat.level).toBe('Not assessed');
    });

    test('responsible-ai is also Not assessed', () => {
      const cat = result.categories.find(c => c.categoryId === 'responsible-ai');
      expect(cat.level).toBe('Not assessed');
    });
  });

  // -------------------------------------------------------------------------
  // Scenario F — registry order preserved
  // -------------------------------------------------------------------------

  test('Scenario F: category order matches registry order', () => {
    const result = calculateQuizResults(fourQuestions, allCorrect);
    expect(result.categories.map(c => c.categoryId)).toEqual([
      'web-fundamentals',
      'react-state',
      'testing-debugging',
      'responsible-ai',
    ]);
  });

  // -------------------------------------------------------------------------
  // Scenario G — display names come from registry
  // -------------------------------------------------------------------------

  test('Scenario G: categoryName values come from the registry', () => {
    const result = calculateQuizResults(fourQuestions, allCorrect);
    expect(result.categories.map(c => c.categoryName)).toEqual([
      'Web Fundamentals',
      'React and State',
      'Testing and Debugging',
      'Responsible AI Coding',
    ]);
  });

  // -------------------------------------------------------------------------
  // Scenario H — inputs are not mutated
  // -------------------------------------------------------------------------

  test('Scenario H: does not mutate the questions array', () => {
    const frozenQuestions = Object.freeze([...fourQuestions]);
    expect(() => calculateQuizResults(frozenQuestions, allCorrect)).not.toThrow();
  });

  test('Scenario H: does not mutate the answers object', () => {
    const frozenAnswers = Object.freeze({ ...allCorrect });
    expect(() => calculateQuizResults(fourQuestions, frozenAnswers)).not.toThrow();
  });

  // -------------------------------------------------------------------------
  // Scenario I — empty questions array
  // -------------------------------------------------------------------------

  describe('Scenario I: empty questions array', () => {
    let result;
    beforeEach(() => { result = calculateQuizResults([], {}); });

    test('totalCorrect is 0',       () => expect(result.totalCorrect).toBe(0));
    test('totalQuestions is 0',     () => expect(result.totalQuestions).toBe(0));
    test('overallPercentage is 0',  () => expect(result.overallPercentage).toBe(0));

    test('all four categories present with Not assessed level', () => {
      expect(result.categories).toHaveLength(4);
      result.categories.forEach((cat) => {
        expect(cat.correct).toBe(0);
        expect(cat.total).toBe(0);
        expect(cat.percentage).toBe(0);
        expect(cat.level).toBe('Not assessed');
        expect(cat.missedQuestionIds).toHaveLength(0);
      });
    });
  });

});
