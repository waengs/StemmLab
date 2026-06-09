import { getActivityInstructions, getActivityQuizMcq } from '../activityContent';
import { applyQuizBonus } from '../activityScoring';

describe('Activity Content (Integration Test)', () => {
  it('integrates activity content fetcher with the scoring algorithm perfectly', () => {
    // 1. Fetch real content for a known activity
    const activityId = 'reaction-board';
    const content = getActivityInstructions(activityId);
    const quizQuestions = getActivityQuizMcq(activityId, false);

    expect(content).toBeDefined();
    expect(quizQuestions).toBeDefined();

    // 2. Integrate that content into the scoring logic (Simulate full score)
    const rawExperimentScore = 100;
    const finalScore = applyQuizBonus(rawExperimentScore, quizQuestions.length, activityId);

    // 3. Verify the integration correctly parses the real data into a 100% score
    expect(finalScore).toBe(100);
  });
});
