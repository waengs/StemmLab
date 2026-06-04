export const OPEN_QUESTIONS_REQUIRED = 3;

export type ActivityQuizId =
  | 'parachute-drop'
  | 'hand-fan'
  | 'sound-pollution'
  | 'earthquake'
  | 'human-performance'
  | 'reaction-board'
  | 'breathing-pace';

import { getQuizOpenQuestions as getQuizOpenFromI18n } from './activityContent';

export function getQuizOpenQuestions(activityId: ActivityQuizId, isPrimary: boolean): string[] {
  return getQuizOpenFromI18n(activityId, isPrimary);
}

export function loadQuizOpenAnswers(data: Record<string, unknown>): string[] {
  const fromArray = data.quizOpenAnswers;
  if (Array.isArray(fromArray) && fromArray.length >= OPEN_QUESTIONS_REQUIRED) {
    return fromArray.slice(0, OPEN_QUESTIONS_REQUIRED).map((a) => String(a ?? ''));
  }
  return [
    String(data.quizOpenAnswer1 ?? ''),
    String(data.quizOpenAnswer2 ?? ''),
    String(data.quizOpenAnswer3 ?? ''),
  ];
}

export function saveQuizOpenAnswers(answers: string[]): Record<string, string | string[]> {
  return {
    quizOpenAnswers: answers,
    quizOpenAnswer1: answers[0] ?? '',
    quizOpenAnswer2: answers[1] ?? '',
    quizOpenAnswer3: answers[2] ?? '',
  };
}

export function allQuizOpenAnswersFilled(answers: string[]): boolean {
  return (
    answers.length >= OPEN_QUESTIONS_REQUIRED &&
    answers.slice(0, OPEN_QUESTIONS_REQUIRED).every((a) => a.trim().length > 0)
  );
}

export function emptyQuizOpenAnswers(): string[] {
  return ['', '', ''];
}
