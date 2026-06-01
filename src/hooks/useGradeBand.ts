import { useTranslation } from 'react-i18next';
import { useRequireAuth } from '../stores';
import { getGradeBand, isHighSchoolGrade, isPrimaryGrade } from '../utils/gradeLevel';

export function useGradeBand() {
  const { t } = useTranslation();
  const { team } = useRequireAuth();
  const gradeLevel = team?.gradeLevel;
  const isHighSchool = isHighSchoolGrade(gradeLevel, t);
  const isPrimary = isPrimaryGrade(gradeLevel, t);

  return {
    gradeLevel,
    gradeBand: getGradeBand(gradeLevel, t),
    isHighSchool,
    isPrimary,
  };
}
