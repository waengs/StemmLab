import type { TFunction } from 'i18next';

/** Forum visibility cohort derived from team grade level. */
export type GradeBand = 'primary' | 'high_school';

/** Lower high school (grades 7–9) — richer quizzes and discussions. */
export function isHighSchoolGrade(gradeLevel: string | undefined, t: TFunction): boolean {
  if (!gradeLevel) return false;
  return (
    gradeLevel === t('setup.gradeLowerHigh') ||
    gradeLevel === 'Lower High School (Grades 7–9)' ||
    gradeLevel.includes('High')
  );
}

/** Upper primary (grades 4–6) — simpler quizzes and discussions. */
export function isPrimaryGrade(gradeLevel: string | undefined, t: TFunction): boolean {
  return !isHighSchoolGrade(gradeLevel, t);
}

export function getGradeBand(gradeLevel: string | undefined, t: TFunction): GradeBand {
  return isHighSchoolGrade(gradeLevel, t) ? 'high_school' : 'primary';
}

/** Infer grade band from a stored grade level string (e.g. team row) without i18n. */
export function getGradeBandFromStoredLevel(gradeLevel: string | undefined): GradeBand | undefined {
  if (!gradeLevel?.trim()) return undefined;
  if (
    gradeLevel.includes('High') ||
    gradeLevel.includes('SMP') ||
    gradeLevel === 'Lower High School (Grades 7–9)'
  ) {
    return 'high_school';
  }
  return 'primary';
}

export function isForumPostVisibleToBand(
  post: { gradeBand?: GradeBand; teamDiscriminator?: string },
  viewerBand: GradeBand
): boolean {
  if (post.gradeBand) return post.gradeBand === viewerBand;
  return false;
}
