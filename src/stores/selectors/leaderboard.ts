import type { ActivityResult } from '../../types';
import type { LeaderboardEntry } from '../../components/leaderboard/LeaderboardEntryCard';

function calculateScore(result: ActivityResult): number {
  switch (result.activityId) {
    case 'parachute-drop':
      return Math.max(0, 100 - (parseFloat(result.data.gForce) || 0) * 10);
    case 'sound-pollution':
      return parseFloat(result.data.maxDecibels) || 0;
    case 'hand-fan':
      return parseFloat(result.data.windSpeed) || 0;
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
