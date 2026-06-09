import { applyQuizBonus, finalizeScore } from '../activityScoring';
import * as activityContent from '../activityContent';

// Mock the activityContent module so we can control the number of quiz questions
jest.mock('../activityContent', () => ({
  getActivityQuizMcq: jest.fn(),
}));

describe('activityScoring (Unit Test)', () => {
  describe('applyQuizBonus', () => {
    it('returns 100% of the experiment score if the activity has no quiz questions', () => {
      // Mock that there are NO quiz questions for this activity
      (activityContent.getActivityQuizMcq as jest.Mock).mockReturnValue([]);
      
      const experimentScore = 80;
      const result = applyQuizBonus(experimentScore, undefined, 'some-activity');
      
      // Since totalQuestions is 0, the experiment score should not be split
      expect(result).toBe(80);
    });

    it('splits score 75/25 when a quiz exists and student got 100%', () => {
      // Mock that there are 4 quiz questions
      (activityContent.getActivityQuizMcq as jest.Mock).mockReturnValue([1, 2, 3, 4]);
      
      const experimentScore = 100;
      const correctQuizAnswers = 4;
      
      const result = applyQuizBonus(experimentScore, correctQuizAnswers, 'some-activity');
      
      // Math: (100 * 0.75) + ((4 / 4) * 100 * 0.25) = 75 + 25 = 100
      expect(result).toBe(100);
    });
  });
});
