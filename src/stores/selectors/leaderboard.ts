import type { ActivityResult } from '../../types';
import type { LeaderboardEntry } from '../../components/leaderboard/LeaderboardEntryCard';

export function calculateScore(result: ActivityResult): number {
  switch (result.activityId) {
    case 'parachute-drop': {
      let score = 100;
      if (result.data.usedInstantCalc) {
        score -= 20; // Penalty
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
          score -= (avgDiff * 20); // Deduct points based on inaccuracy
        }
      }
      return Math.max(0, Math.round(score));
    }
    case 'sound-pollution':
      return parseFloat(result.data.maxDecibels) || 0;
    case 'hand-fan': {
      let score = 100;
      if (result.data.usedInstantCalc) {
        score -= 20;
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
          score -= 10;
        }
        
        if (bestDesign && result.data.predictedDesign && 
            !bestDesign.toLowerCase().includes(result.data.predictedDesign.toLowerCase()) && 
            !result.data.predictedDesign.toLowerCase().includes(bestDesign.toLowerCase())) {
          score -= 10;
        }

        if (bestDistance && result.data.predictedDistance && result.data.predictedDistance !== bestDistance) {
          score -= 10;
        }
      }
      return Math.max(0, score);
    }
    case 'earthquake':
      return result.data.survived === 'Yes' ? 100 : 0;
    case 'human-performance':
      return (
        (parseFloat(result.data.bendAngle) || 0) +
        (parseFloat(result.data.speed) || 0) * 2 +
        (parseFloat(result.data.gracefulness) || 0) * 3
      );
    case 'reaction-board':
      return (parseFloat(result.data.accuracy) || 0) - (parseFloat(result.data.reactionTime) || 1000) / 100;
    case 'breathing-pace':
      return (parseFloat(result.data.consistency) || 0) * 10;
    default:
      return 0;
  }
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
