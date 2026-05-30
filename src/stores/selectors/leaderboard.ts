import type { ActivityResult } from '../../types';
import type { LeaderboardEntry } from '../../components/leaderboard/LeaderboardEntryCard';

export function calculateScore(result: ActivityResult): number {
  let baseScore = 0;

  switch (result.activityId) {
    case 'parachute-drop': {
      baseScore = 100;
      if (result.data.usedInstantCalc) {
        baseScore -= 20; // Penalty
      }
      if (result.data.trials && Array.isArray(result.data.trials)) {
        let totalDiff = 0;
        let validTrials = 0;
        result.data.trials.forEach((t: any) => {
          const pred = parseFloat(t.predictedTime);
          const act = parseFloat(t.actualTime);
          if (!isNaN(pred) && !isNaN(act)) {
            totalDiff += Math.abs(pred - act);
            validTrials++;
          }
        });
        if (validTrials > 0) {
          const avgDiff = totalDiff / validTrials;
          baseScore -= (avgDiff * 20); // Deduct points based on inaccuracy
        }
      }
      baseScore = Math.max(0, Math.round(baseScore));
      break;
    }
    case 'sound-pollution': {
      baseScore = 100;
      if (result.data.trials && Array.isArray(result.data.trials) && result.data.trials.length > 0) {
        let maxDb = -1;
        let actualLoudestAction = '';
        
        result.data.trials.forEach((t: any) => {
          const db = parseFloat(t.outcomeDb) || 0;
          if (db > maxDb) {
            maxDb = db;
            actualLoudestAction = t.action;
          }
          if (t.wereYouRight === 'Yes') {
            baseScore += 5;
          }
        });

        if (actualLoudestAction && result.data.predictedLoudestAction && result.data.predictedLoudestAction !== actualLoudestAction) {
          baseScore -= 10;
        }
      }
      baseScore = Math.max(0, Math.round(baseScore));
      break;
    }
    case 'hand-fan': {
      baseScore = 100;
      if (result.data.usedInstantCalc) {
        baseScore -= 20;
      }
      
      if (result.data.trials && Array.isArray(result.data.trials) && result.data.trials.length > 0) {
        let maxBend = -1;
        let bestMaterial = '';
        let bestDesign = '';
        let bestDistance = '';
        
        result.data.trials.forEach((t: any) => {
          const bend = parseFloat(t.maxBendAngle) || 0;
          if (bend > maxBend) {
            maxBend = bend;
            bestMaterial = t.targetMaterial; // or fanMaterial? prompt: "which material produces more bend", usually target material
            bestDesign = t.design;
            bestDistance = t.distance;
          }
        });

        if (bestMaterial && result.data.predictedMaterial && result.data.predictedMaterial !== bestMaterial) {
          baseScore -= 10;
        }
        
        if (bestDesign && result.data.predictedDesign && 
            !bestDesign.toLowerCase().includes(result.data.predictedDesign.toLowerCase()) && 
            !result.data.predictedDesign.toLowerCase().includes(bestDesign.toLowerCase())) {
          baseScore -= 10;
        }

        if (bestDistance && result.data.predictedDistance && result.data.predictedDistance !== bestDistance) {
          baseScore -= 10;
        }
      }
      baseScore = Math.max(0, Math.round(baseScore));
      break;
    }
    case 'earthquake': {
      baseScore = result.data.survived === 'Yes' ? 100 : 0;
      break;
    }
    case 'human-performance': {
      baseScore = 100;
      if (result.data.usedInstantCalc) {
        baseScore -= 20;
      }

      if (result.data.trials && Array.isArray(result.data.trials)) {
        let totalDiff = 0;
        let validTrials = 0;
        result.data.trials.forEach((t: any) => {
          const pred = parseFloat(t.predictedVibration);
          const act = parseFloat(t.vibrationAvg);
          if (!isNaN(pred) && !isNaN(act)) {
            totalDiff += Math.abs(pred - act);
            validTrials++;
          }
        });
        if (validTrials > 0) {
          baseScore -= (totalDiff / validTrials) * 2;
        }

        const hardest = result.data.trials.reduce((best: any, t: any) => {
          const v = parseFloat(t.vibrationAvg) || 0;
          return !best || v > (parseFloat(best.vibrationAvg) || 0) ? t : best;
        }, null);
        if (hardest && result.data.predictedHardestMovement && result.data.predictedHardestMovement !== hardest.label) {
          baseScore -= 10;
        }

        result.data.trials.forEach((t: any) => {
          const feedback = parseFloat(t.vibrationAvgWithFeedback) || 0;
          const baseline = parseFloat(t.vibrationAvg) || 0;
          if (feedback > 0 && baseline > 0 && feedback < baseline) {
            baseScore += 3;
          }
        });
      }

      baseScore = Math.max(0, Math.round(baseScore));
      break;
    }
    case 'reaction-board': {
      baseScore = (parseFloat(result.data.accuracy) || 0) - (parseFloat(result.data.reactionTime) || 1000) / 100;
      baseScore = Math.max(0, Math.round(baseScore));
      break;
    }
    case 'breathing-pace': {
      baseScore = 100;

      if (result.data.trials && Array.isArray(result.data.trials)) {
        let totalDiff = 0;
        let validTrials = 0;
        result.data.trials.forEach((trial: any) => {
          const pred = parseFloat(trial.predictedBpm);
          const act = parseFloat(trial.breathsPerMinute);
          if (!isNaN(pred) && !isNaN(act)) {
            totalDiff += Math.abs(pred - act);
            validTrials += 1;
          }
        });
        if (validTrials > 0) {
          baseScore -= (totalDiff / validTrials) * 3;
        }

        const jogTrial = result.data.trials.find((trial: any) => trial.id === 'afterJog');
        const starTrial = result.data.trials.find((trial: any) => trial.id === 'afterStarJump');
        const jogMove = parseFloat(jogTrial?.movementAvg) || 0;
        const starMove = parseFloat(starTrial?.movementAvg) || 0;
        const actualMostLabel = jogMove >= starMove ? 'After Jog' : 'After Star Jumps';
        if (result.data.predictedMostMovement && result.data.predictedMostMovement !== actualMostLabel) {
          baseScore -= 10;
        }
      }

      baseScore = Math.max(0, Math.round(baseScore));
      break;
    }
    default:
      baseScore = 0;
      break;
  }

  // Uniformly add quiz score (2 points per correct question) to ALL activities
  if (result.data.quizScore) {
    baseScore += (result.data.quizScore as number) * 2;
  }

  return baseScore;
}

const BOARD_KEYS = [
  'overall',
  'parachute-drop',
  'sound-pollution',
  'hand-fan',
  'earthquake',
  'human-performance',
  'reaction-board',
  'breathing-pace',
] as const;

export function buildLeaderboards(results: ActivityResult[]): Record<string, LeaderboardEntry[]> {
  const boards: Record<string, LeaderboardEntry[]> = Object.fromEntries(
    BOARD_KEYS.map((key) => [key, []])
  );

  const teamStats: Record<string, { count: number; totalScore: number }> = {};

  results.forEach((result) => {
    if (!teamStats[result.teamDiscriminator]) {
      teamStats[result.teamDiscriminator] = { count: 0, totalScore: 0 };
    }
    teamStats[result.teamDiscriminator].count += 1;

    const score = calculateScore(result);
    teamStats[result.teamDiscriminator].totalScore += score;

    const board = boards[result.activityId];
    if (!board) return;

    const existingEntry = board.find((e) => e.teamDiscriminator === result.teamDiscriminator);

    if (existingEntry) {
      existingEntry.score = Math.max(existingEntry.score, score);
      existingEntry.count += 1;
    } else {
      board.push({
        teamDiscriminator: result.teamDiscriminator,
        teamName: `Team ${result.teamDiscriminator}`,
        score,
        count: 1,
      });
    }
  });

  Object.entries(teamStats).forEach(([discriminator, stats]) => {
    boards.overall.push({
      teamDiscriminator: discriminator,
      teamName: `Team ${discriminator}`,
      score: stats.totalScore,
      count: stats.count,
    });
  });

  Object.keys(boards).forEach((key) => {
    boards[key].sort((a, b) => b.score - a.score);
  });

  return boards;
}
