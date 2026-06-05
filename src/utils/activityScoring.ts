import type { ActivityResult } from '../types';
import { getActivityQuizMcq } from './activityContent';

/** Shared leaderboard scoring rules (activities 1, 3, 5, 7 and others). */
export const SCORE_BASE = 100;
export const SCORE_INSTANT_CALC_PENALTY = 20;
export const SCORE_WRONG_PREDICTION_PENALTY = 10;
export const SCORE_QUIZ_PER_CORRECT = 2;

export function finalizeScore(score: number): number {
  return Math.max(0, Math.round(score));
}

export function applyInstantCalcPenalty(score: number, usedInstantCalc?: boolean): number {
  return usedInstantCalc ? score - SCORE_INSTANT_CALC_PENALTY : score;
}

export function applyQuizBonus(score: number, quizScore?: unknown, activityId?: string): number {
  const quiz = typeof quizScore === 'number' ? quizScore : parseFloat(String(quizScore ?? ''));
  
  if (!activityId) {
    return score;
  }
  
  const totalQuestions = Math.max(
    getActivityQuizMcq(activityId, true).length,
    getActivityQuizMcq(activityId, false).length
  );
  
  if (totalQuestions === 0) {
    return score;
  }

  const experimentComponent = score * 0.75;
  
  if (isNaN(quiz)) {
    return experimentComponent;
  }
  
  const quizComponent = (quiz / totalQuestions) * 100 * 0.25;
  return experimentComponent + quizComponent;
}

export function normalizeLabel(value: string): string {
  return value.trim().toLowerCase();
}

/** Lenient match for design labels and action names. */
export function labelsMatch(a?: string, b?: string): boolean {
  if (!a?.trim() || !b?.trim()) return true;
  const left = normalizeLabel(a);
  const right = normalizeLabel(b);
  return left === right || left.includes(right) || right.includes(left);
}

export function applyWrongPredictionPenalty(
  score: number,
  predicted?: string,
  actual?: string
): number {
  if (!predicted?.trim() || !actual?.trim()) return score;
  return labelsMatch(predicted, actual) ? score : score - SCORE_WRONG_PREDICTION_PENALTY;
}

export function scoreParachuteDrop(data: Record<string, unknown>): number {
  let score = SCORE_BASE;
  score = applyInstantCalcPenalty(score, Boolean(data.usedInstantCalc));

  const trials = Array.isArray(data.trials) ? data.trials : [];
  const experimentTrials = trials.slice(1);

  if (experimentTrials.length > 0) {
    let bestTrial: { label?: string; actualTime?: string } | null = null;
    let bestTime = -Infinity;
    let totalTimeDiff = 0;
    let validTimeTrials = 0;

    experimentTrials.forEach((trial: { label?: string; predictedTime?: string; actualTime?: string }) => {
      const actual = parseFloat(String(trial.actualTime ?? ''));
      const predicted = parseFloat(String(trial.predictedTime ?? ''));

      if (!isNaN(actual) && actual > bestTime) {
        bestTime = actual;
        bestTrial = trial;
      }
      if (!isNaN(predicted) && !isNaN(actual)) {
        totalTimeDiff += Math.abs(predicted - actual);
        validTimeTrials += 1;
      }
    });

    if (bestTrial?.label) {
      score = applyWrongPredictionPenalty(score, String(data.predictedDesign ?? ''), bestTrial.label);
    }

    if (validTimeTrials > 0) {
      score -= (totalTimeDiff / validTimeTrials) * 10;
    }
  }

  return score;
}

export function scoreHandFan(data: Record<string, unknown>): number {
  let score = SCORE_BASE;
  score = applyInstantCalcPenalty(score, Boolean(data.usedInstantCalc));

  const trials = Array.isArray(data.trials) ? data.trials : [];
  if (trials.length === 0) return score;

  let maxBend = -1;
  let bestMaterial = '';
  let bestDesign = '';
  let bestDistance = '';

  trials.forEach((trial: { maxBendAngle?: string; fanMaterial?: string; design?: string; distance?: string }) => {
    const bend = parseFloat(String(trial.maxBendAngle ?? '')) || 0;
    if (bend >= maxBend) {
      maxBend = bend;
      bestMaterial = String(trial.fanMaterial ?? '');
      bestDesign = String(trial.design ?? '');
      bestDistance = String(trial.distance ?? '');
    }
  });

  score = applyWrongPredictionPenalty(score, String(data.predictedMaterial ?? ''), bestMaterial);
  score = applyWrongPredictionPenalty(score, String(data.predictedDesign ?? ''), bestDesign);
  score = applyWrongPredictionPenalty(score, String(data.predictedDistance ?? ''), bestDistance);

  return score;
}

export function scoreHumanPerformance(data: Record<string, unknown>): number {
  let score = SCORE_BASE;
  score = applyInstantCalcPenalty(score, Boolean(data.usedInstantCalc));

  const trials = Array.isArray(data.trials) ? data.trials : [];
  if (trials.length > 0) {
    let totalDiff = 0;
    let validTrials = 0;

    trials.forEach((trial: { predictedVibration?: string; vibrationAvg?: string; vibrationAvgWithFeedback?: string; label?: string }) => {
      const pred = parseFloat(String(trial.predictedVibration ?? ''));
      const act = parseFloat(String(trial.vibrationAvg ?? ''));
      if (!isNaN(pred) && !isNaN(act)) {
        totalDiff += Math.abs(pred - act);
        validTrials += 1;
      }

      const feedback = parseFloat(String(trial.vibrationAvgWithFeedback ?? ''));
      const baseline = parseFloat(String(trial.vibrationAvg ?? ''));
      if (feedback > 0 && baseline > 0 && feedback < baseline) {
        score += 3;
      }
    });

    if (validTrials > 0) {
      score -= (totalDiff / validTrials) * 2;
    }

    const hardest = trials.reduce<{ id: string; vibrationAvg?: string } | null>(
      (best, trial: { id?: string; label?: string; vibrationAvg?: string }) => {
        const v = parseFloat(String(trial.vibrationAvg ?? '')) || 0;
        if (!best) return { id: String(trial.id ?? trial.label ?? ''), vibrationAvg: trial.vibrationAvg };
        const bestV = parseFloat(String(best.vibrationAvg ?? '')) || 0;
        return v > bestV ? { id: String(trial.id ?? trial.label ?? ''), vibrationAvg: trial.vibrationAvg } : best;
      },
      null
    );

    if (hardest?.id) {
      score = applyWrongPredictionPenalty(
        score,
        String(data.predictedHardestMovement ?? ''),
        hardest.id
      );
    }
  }

  return score;
}

export function scoreBreathingPace(data: Record<string, unknown>): number {
  let score = SCORE_BASE;

  const trials = Array.isArray(data.trials) ? data.trials : [];
  if (trials.length > 0) {
    let totalDiff = 0;
    let validTrials = 0;

    trials.forEach((trial: { predictedBpm?: string; breathsPerMinute?: string }) => {
      const pred = parseFloat(String(trial.predictedBpm ?? ''));
      const act = parseFloat(String(trial.breathsPerMinute ?? ''));
      if (!isNaN(pred) && !isNaN(act)) {
        totalDiff += Math.abs(pred - act);
        validTrials += 1;
      }
    });

    if (validTrials > 0) {
      score -= (totalDiff / validTrials) * 3;
    }

    const BREATHING_CONDITION_LABELS: Record<string, string> = {
      atRest: 'At Rest',
      afterJog: 'After Jog',
      afterStarJump: 'After Star Jumps',
    };

    let movementWinner: { id: string; avg: number } | null = null;
    trials.forEach((trial: { id?: string; movementAvg?: string }) => {
      const avg = parseFloat(String(trial.movementAvg ?? '')) || 0;
      if (!movementWinner || avg > movementWinner.avg) {
        movementWinner = { id: String(trial.id ?? ''), avg };
      }
    });

    const actualMostLabel = movementWinner
      ? BREATHING_CONDITION_LABELS[movementWinner.id] ?? ''
      : '';

    score = applyWrongPredictionPenalty(
      score,
      String(data.predictedMostMovement ?? ''),
      actualMostLabel
    );
  }

  return score;
}

export function calculateActivityScore(result: ActivityResult): number {
  const data = result.data as Record<string, unknown>;
  let score: number;

  switch (result.activityId) {
    case 'parachute-drop':
      score = scoreParachuteDrop(data);
      break;
    case 'hand-fan':
      score = scoreHandFan(data);
      break;
    case 'sound-pollution': {
      score = SCORE_BASE;
      if (Array.isArray(data.trials) && data.trials.length > 0) {
        let maxDb = -1;
        let actualLoudestAction = '';

        (data.trials as { action?: string; outcomeDb?: string }[]).forEach((trial) => {
          const db = parseFloat(String(trial.outcomeDb ?? '')) || 0;
          if (db > maxDb) {
            maxDb = db;
            actualLoudestAction = String(trial.action ?? '');
          }
        });

        score = applyWrongPredictionPenalty(
          score,
          String(data.predictedLoudestAction ?? ''),
          actualLoudestAction
        );
        // Double the penalty since this activity is very easy
        if (score < SCORE_BASE) {
          score = SCORE_BASE - (SCORE_WRONG_PREDICTION_PENALTY * 2);
        }
      }
      break;
    }
    case 'earthquake':
      score = 50 + (data.survived === 'Yes' ? 50 : 0);
      break;
    case 'human-performance':
      score = scoreHumanPerformance(data);
      break;
    case 'reaction-board': {
      score = SCORE_BASE;
      const predReact = parseFloat(String(data.predictedReactionTime ?? ''));
      const actualReact = parseFloat(String(data.reactionTime ?? ''));
      if (!isNaN(predReact) && !isNaN(actualReact)) {
        const diff = Math.abs(predReact - actualReact);
        score -= Math.min(30, diff / 20); // 1 pt penalty per 20ms diff, max 30
      }
      const predAcc = parseFloat(String(data.predictedAccuracy ?? ''));
      const actualAcc = parseFloat(String(data.accuracy ?? ''));
      if (!isNaN(predAcc) && !isNaN(actualAcc)) {
        const diff = Math.abs(predAcc - actualAcc);
        score -= Math.min(20, diff / 2); // 1 pt penalty per 2% diff, max 20
      }
      // Performance bonuses
      if (!isNaN(actualAcc) && actualAcc >= 95) score += 5;
      if (!isNaN(actualReact) && actualReact <= 250) score += 5;
      break;
    }
    case 'breathing-pace':
      score = scoreBreathingPace(data);
      break;
    default:
      score = 0;
  }

  return finalizeScore(applyQuizBonus(score, data.quizScore, result.activityId));
}
