import type { ActivityResult } from '../../types';
import type { LeaderboardEntry } from '../../components/leaderboard/LeaderboardEntryCard';
import { calculateActivityScore } from '../../utils/activityScoring';

export function calculateScore(result: ActivityResult): number {
  return calculateActivityScore(result);
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

const TEAM_NAME_META_KEY = '__teamName';

/** Merge directory names with names stored on activity submissions. */
export function buildTeamNameLookup(
  teamNamesByDiscriminator: Record<string, string>,
  results: ActivityResult[]
): Record<string, string> {
  const lookup: Record<string, string> = {};
  Object.entries(teamNamesByDiscriminator).forEach(([discriminator, name]) => {
    if (name.trim()) lookup[discriminator.toUpperCase()] = name.trim();
  });
  results.forEach((result) => {
    const fromData = result.data?.[TEAM_NAME_META_KEY];
    if (typeof fromData === 'string' && fromData.trim()) {
      lookup[result.teamDiscriminator.toUpperCase()] = fromData.trim();
    }
  });
  return lookup;
}

function resolveTeamName(discriminator: string, lookup: Record<string, string>): string {
  return lookup[discriminator.toUpperCase()] ?? lookup[discriminator] ?? discriminator;
}

export function buildLeaderboards(
  results: ActivityResult[],
  teamNamesByDiscriminator: Record<string, string> = {}
): Record<string, LeaderboardEntry[]> {
  const teamNames = buildTeamNameLookup(teamNamesByDiscriminator, results);
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
      existingEntry.teamName = resolveTeamName(result.teamDiscriminator, teamNames);
    } else {
      board.push({
        teamDiscriminator: result.teamDiscriminator,
        teamName: resolveTeamName(result.teamDiscriminator, teamNames),
        score,
        count: 1,
      });
    }
  });

  Object.entries(teamStats).forEach(([discriminator, stats]) => {
    boards.overall.push({
      teamDiscriminator: discriminator,
      teamName: resolveTeamName(discriminator, teamNames),
      score: stats.totalScore,
      count: stats.count,
    });
  });

  Object.keys(boards).forEach((key) => {
    boards[key].sort((a, b) => b.score - a.score);
  });

  return boards;
}
