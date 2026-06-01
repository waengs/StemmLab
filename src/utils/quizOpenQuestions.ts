export const OPEN_QUESTIONS_REQUIRED = 3;

export type ActivityQuizId =
  | 'parachute-drop'
  | 'hand-fan'
  | 'sound-pollution'
  | 'earthquake'
  | 'human-performance'
  | 'reaction-board'
  | 'breathing-pace';

const QUIZ_OPEN_BY_ACTIVITY: Record<
  ActivityQuizId,
  { primary: [string, string, string]; highSchool: [string, string, string] }
> = {
  'parachute-drop': {
    primary: [
      'Did your parachute work the way you expected?',
      'Which design did you like best? Why?',
      'What would you change if you tested again?',
    ],
    highSchool: [
      'Were your predicted fall times close to your measured times?',
      'Which design performed best, and why do you think so?',
      'What would you improve in your next prototype?',
    ],
  },
  'hand-fan': {
    primary: [
      'Which fan moved the paper the most?',
      'What surprised you during the experiment?',
      'If you could try one more design, what would it be?',
    ],
    highSchool: [
      'How did material stiffness affect your results?',
      'Which variable (design, distance, or fanning speed) had the biggest effect on bend angle?',
      'What would you improve in your next prototype?',
    ],
  },
  'sound-pollution': {
    primary: [
      'Which sound was loudest in your data?',
      'Why should we protect our ears from very loud noise?',
      'Where in daily life do you hear similar loud sounds?',
    ],
    highSchool: [
      'How did your predicted loudest action compare to your measurements?',
      'At what dB levels might hearing damage occur, based on what you learned?',
      'What habits or policies could reduce harmful noise exposure?',
    ],
  },
  earthquake: {
    primary: [
      'What helped your tower stay up the longest?',
      'What made it fall faster?',
      'If you built again, what one change would you try first?',
    ],
    highSchool: [
      'Which design features absorbed vibration best?',
      'How did base width or bracing affect survival time?',
      'What real-world building features do engineers use for earthquakes?',
    ],
  },
  'human-performance': {
    primary: [
      'Which movement was hardest to keep smooth?',
      'Did live feedback help you improve on the second attempt?',
      'What did you learn about moving slowly and smoothly?',
    ],
    highSchool: [
      'Which movement produced the highest vibration readings?',
      'Did sensory feedback reduce vibration magnitude? Explain.',
      'How might athletes or physical therapists use similar sensors?',
    ],
  },
  'reaction-board': {
    primary: [
      'What helped you react faster?',
      'When was it hardest to tap the right color?',
      'What would you do differently on a second try?',
    ],
    highSchool: [
      'How did accuracy and reaction time trade off in your results?',
      'What factors might change your reaction time between trials?',
      'How is reaction time useful in real life?',
    ],
  },
  'breathing-pace': {
    primary: [
      'When did you breathe fastest, and why do you think so?',
      'When did the phone move the most on your chest?',
      'What was hardest about keeping the phone steady?',
    ],
    highSchool: [
      'How did exercise affect breaths per minute compared to your predictions?',
      'How did chest movement relate to breathing rate?',
      'What could affect sensor readings besides breathing?',
    ],
  },
};

export function getQuizOpenQuestions(activityId: ActivityQuizId, isPrimary: boolean): string[] {
  const entry = QUIZ_OPEN_BY_ACTIVITY[activityId];
  return [...(isPrimary ? entry.primary : entry.highSchool)];
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
