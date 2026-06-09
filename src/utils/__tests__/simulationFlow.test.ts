import { applyQuizBonus, finalizeScore } from '../activityScoring';
import * as activityContent from '../activityContent';

// Mock the content fetcher to return fake E2E data
jest.mock('../activityContent', () => ({
  getActivityQuizMcq: jest.fn().mockReturnValue([1, 2, 3, 4])
}));

describe('Student Experiment Flow (E2E Simulation)', () => {
  it('simulates a student completing a full physics experiment journey end-to-end', () => {
    // Stage 1: Student opens the "Parachute" activity
    const activityId = 'parachute';
    
    // Stage 2: Student completes the physics experiment and gets a raw score
    const timeTakenSeconds = 12; // Good time
    const optimalTime = 10;
    const rawExperimentScore = 100 - (Math.abs(timeTakenSeconds - optimalTime) * 2); // 96 points
    
    expect(rawExperimentScore).toBe(96);
    
    // Stage 3: Student takes the post-experiment quiz
    const quizQuestions = activityContent.getActivityQuizMcq(activityId, false);
    expect(quizQuestions.length).toBeGreaterThan(0);
    
    // Student gets 3 out of 4 correct (75% on the quiz)
    const totalQuizQuestions = quizQuestions.length;
    const correctAnswers = totalQuizQuestions - 1; 
    
    // Stage 4: System integrates both phases for final leaderboard calculation
    const calculatedScore = applyQuizBonus(rawExperimentScore, correctAnswers, activityId);
    
    // Stage 5: Final score gets posted to the database (Simulated)
    const finalLeaderboardScore = finalizeScore(calculatedScore);
    
    // Verification of the entire journey
    // 96 * 0.75 = 72
    // (3/4) * 100 * 0.25 = 18.75
    // 72 + 18.75 = 90.75 -> rounded to 91
    expect(finalLeaderboardScore).toBe(91);
  });
});
