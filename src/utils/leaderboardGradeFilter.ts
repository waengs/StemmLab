import type { ActivityResult } from '../types';
import type { GradeBand } from './gradeLevel';
import { getGradeBandFromStoredLevel } from './gradeLevel';

export type TeamDirectoryEntry = {
  name: string;
  gradeLevel: string;
  gradeBand: GradeBand | undefined;
};

export function buildTeamDirectory(
  teams: { discriminator: string; name: string; gradeLevel: string }[]
): Record<string, TeamDirectoryEntry> {
  const map: Record<string, TeamDirectoryEntry> = {};
  teams.forEach((team) => {
    const key = team.discriminator.toUpperCase();
    map[key] = {
      name: team.name,
      gradeLevel: team.gradeLevel,
      gradeBand: getGradeBandFromStoredLevel(team.gradeLevel),
    };
  });
  return map;
}

/** Only teams in the viewer's grade cohort (upper primary vs lower high school). */
export function filterResultsForLeaderboardBand(
  results: ActivityResult[],
  teamsByDisc: Record<string, TeamDirectoryEntry>,
  viewerBand: GradeBand
): ActivityResult[] {
  return results.filter((result) => {
    const team = teamsByDisc[result.teamDiscriminator.toUpperCase()];
    if (!team?.gradeBand) return false;
    return team.gradeBand === viewerBand;
  });
}
