import i18n from '../i18n';
import type { ActivityQuizId } from './quizOpenQuestions';

export type QuizMcqItem = {
  question: string;
  options: string[];
  answerIndex: number;
};

export type QuizWizardItem = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export function actT(key: string, options?: Record<string, unknown>): string {
  return i18n.t(`activityContent.${key}`, options as object);
}

export function getActivityInstructions(activityId: string): string[] {
  const value = i18n.t(`activityContent.instructions.${activityId}`, { returnObjects: true });
  if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
    return value as string[];
  }
  return [];
}

export function getActivityQuizMcq(activityId: string, isPrimary: boolean): QuizMcqItem[] {
  const band = isPrimary ? 'primary' : 'highSchool';
  const value = i18n.t(`activityContent.quiz.${activityId}.${band}`, { returnObjects: true });
  if (!Array.isArray(value)) return [];
  return value as QuizMcqItem[];
}

export function getActivityQuizWizard(activityId: string, isPrimary: boolean): QuizWizardItem[] {
  const band = isPrimary ? 'primary' : 'highSchool';
  const value = i18n.t(`activityContent.quizWizard.${activityId}.${band}`, { returnObjects: true });
  if (!Array.isArray(value)) return [];
  return value as QuizWizardItem[];
}

export function getQuizOpenQuestions(activityId: ActivityQuizId, isPrimary: boolean): string[] {
  const band = isPrimary ? 'primary' : 'highSchool';
  const value = i18n.t(`activityContent.quizOpen.${activityId}.${band}`, { returnObjects: true });
  if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
    return [...(value as string[])];
  }
  return [];
}

export function getDiscussionParagraphs(
  activityId: string,
  band: 'primary' | 'highSchool'
): string[] {
  const value = i18n.t(`activityContent.discussion.${activityId}.${band}.paragraphs`, {
    returnObjects: true,
  });
  if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
    return value as string[];
  }
  return [];
}

export function getDiscussionSections(
  activityId: string,
  band: 'primary' | 'highSchool'
): { heading?: string; body: string }[] {
  const value = i18n.t(`activityContent.discussion.${activityId}.${band}.sections`, {
    returnObjects: true,
  });
  if (!Array.isArray(value)) return [];
  return value as { heading?: string; body: string }[];
}

export type DiscussionTable = {
  title: string;
  headers: string[];
  rows: string[][];
};

export function getDiscussionTables(activityId: string, band: 'primary' | 'highSchool'): DiscussionTable[] {
  const value = i18n.t(`activityContent.discussion.${activityId}.${band}.tables`, {
    returnObjects: true,
  });
  if (!Array.isArray(value)) return [];
  return value as DiscussionTable[];
}
