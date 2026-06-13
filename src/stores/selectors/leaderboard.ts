import type { ActivityResult } from '../../types';
import type { LeaderboardEntry } from '../../components/leaderboard/LeaderboardEntryCard';
import { calculateActivityScore } from '../../utils/activityScoring';

export type TeamActivityCompletion = {
  activityId: string;
  activityName: string;
  bestScore: number;
  attempts: number;
  lastTimestamp: number;
};

export function getTeamActivityCompletions(
  results: ActivityResult[],
  teamDiscriminator: string
): TeamActivityCompletion[] {
  const code = teamDiscriminator.toUpperCase();
  const byActivity = new Map<string, TeamActivityCompletion>();

  results
    .filter((r) => r.teamDiscriminator.toUpperCase() === code)
    .forEach((result) => {
      const score = calculateScore(result);
      const existing = byActivity.get(result.activityId);
      if (existing) {
        existing.bestScore = Math.max(existing.bestScore, score);
        existing.attempts += 1;
        existing.lastTimestamp = Math.max(existing.lastTimestamp, result.timestamp);
      } else {
        byActivity.set(result.activityId, {
          activityId: result.activityId,
          activityName: result.activityName,
          bestScore: score,
          attempts: 1,
          lastTimestamp: result.timestamp,
        });
      }
    });

  return Array.from(byActivity.values()).sort((a, b) => b.lastTimestamp - a.lastTimestamp);
}

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
    let bestScoresSum = 0;
    BOARD_KEYS.forEach((key) => {
      if (key !== 'overall') {
        const entry = boards[key].find((e) => e.teamDiscriminator === discriminator);
        if (entry) {
          bestScoresSum += entry.score;
        }
      }
    });

    boards.overall.push({
      teamDiscriminator: discriminator,
      teamName: resolveTeamName(discriminator, teamNames),
      score: bestScoresSum,
      count: stats.count,
    });
  });

  Object.keys(boards).forEach((key) => {
    boards[key].sort((a, b) => b.score - a.score);
  });

  return boards;
}
