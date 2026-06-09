/**
 * QuizSubmissionFlow.test.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * End-to-End Tests — Phase 2: Quiz Submission Flow
 *
 * Renders the full `ActivityMcqPostQuiz` component and simulates a complete
 * student journey:
 *   1. Screen loads with question + options visible
 *   2. Student taps an option → it becomes "selected"
 *   3. Student fills open-ended reflection answers
 *   4. Student taps "Submit" → score box + Continue/Retake appear
 *   5. Student taps "Continue" → onComplete callback fires
 *   6. Student can also "Retake" → quiz resets to initial state
 *
 * All external services (ads, storage, i18n, Zustand stores) are mocked so
 * the test exercises only the component's own logic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { ActivityMcqPostQuiz } from '../components/activities/ActivityMcqPostQuiz';
import { useActivityResultsStore } from '../stores/activityResultsStore';
import { useThemeStore } from '../stores/themeStore';
import type { ActivityResult } from '../types';

// ─── Mock heavy dependencies ──────────────────────────────────────────────────

// ads: resolve immediately so the flow doesn't hang
jest.mock('../services/ads/showInterstitialAd', () => ({
  showInterstitialAd: jest.fn(() => Promise.resolve()),
}));

// activityContent: return deterministic quiz data so tests are locale-independent
jest.mock('../utils/activityContent', () => ({
  actT: (key: string, opts?: Record<string, unknown>) => {
    // Return readable stubs for UI labels used in assertions
    if (key === 'shared.postQuizTitle') return 'Quiz Title';
    if (key === 'shared.submitQuiz') return 'Submit Quiz';
    if (key === 'shared.continueDiscussion') return 'Continue';
    if (key === 'shared.retakeQuiz') return 'Retake';
    if (key === 'shared.reflectionHeading') return 'Reflection';
    if (key === 'shared.quizScore') return `Score: ${opts?.score}/${opts?.total}`;
    if (key === 'shared.quizIncomplete') return 'Incomplete';
    if (key === 'shared.quizIncompleteReflection') return 'Please fill all answers';
    return key;
  },
  getActivityQuizMcq: jest.fn(() => [
    {
      question: 'What is the correct answer?',
      options: ['Wrong A', 'Correct B', 'Wrong C'],
      answerIndex: 1,
    },
  ]),
  getQuizOpenQuestions: jest.fn(() => [
    'Reflection question 1',
    'Reflection question 2',
    'Reflection question 3',
  ]),
}));

// quizOpenQuestions: delegate to activityContent mock + provide pure helpers
jest.mock('../utils/quizOpenQuestions', () => ({
  OPEN_QUESTIONS_REQUIRED: 3,
  getQuizOpenQuestions: jest.fn(() => [
    'Reflection question 1',
    'Reflection question 2',
    'Reflection question 3',
  ]),
  // Respect data.quizOpenAnswers so pre-filled answers are loaded correctly
  loadQuizOpenAnswers: jest.fn((data: Record<string, unknown>) => {
    const fromArray = data.quizOpenAnswers;
    if (Array.isArray(fromArray) && fromArray.length >= 3) {
      return fromArray.slice(0, 3).map((a) => String(a ?? ''));
    }
    return ['', '', ''];
  }),
  saveQuizOpenAnswers: jest.fn((answers: string[]) => ({
    quizOpenAnswers: answers,
    quizOpenAnswer1: answers[0] ?? '',
    quizOpenAnswer2: answers[1] ?? '',
    quizOpenAnswer3: answers[2] ?? '',
  })),
  allQuizOpenAnswersFilled: jest.fn((answers: string[]) =>
    answers.length >= 3 && answers.slice(0, 3).every((a) => a.trim().length > 0)
  ),
  emptyQuizOpenAnswers: jest.fn(() => ['', '', '']),
}));

// useGradeBand: always return "primary" band for deterministic quiz content
jest.mock('../hooks/useGradeBand', () => ({
  useGradeBand: () => ({
    gradeLevel: '4',
    gradeBand: 'primary',
    isPrimary: true,
    isHighSchool: false,
  }),
}));

// Alert: prevent native dialog from firing. jest-expo already mocks react-native;
// we simply spy on Alert.alert so tests can assert it was called.
// No jest.mock('react-native') needed — would break TurboModuleRegistry.

// ─── Test fixtures ────────────────────────────────────────────────────────────

/** A minimal ActivityResult for the 'parachute-drop' activity. */
const makeResult = (overrides?: Partial<ActivityResult['data']>): ActivityResult => ({
  id: 'test-result-1',
  activityId: 'parachute-drop',
  activityName: 'Parachute Drop Challenge',
  teamDiscriminator: 'TEAM01',
  timestamp: Date.now(),
  data: {
    quizAnswers: {},
    quizCompleted: false,
    quizScore: 0,
    quizOpenAnswers: ['', '', ''],
    ...overrides,
  },
});

/** Minimal style prop to satisfy the component's `styles` prop requirement. */
const STYLES = {
  container: {},
  card: {},
  title: {},
  subtitle: {},
  questionBlock: {},
  question: {},
  scoreBox: {},
  scoreText: {},
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Reset theme to light
  useThemeStore.setState({ mode: 'light', isDark: false });

  // Reset the activity results store with a clean stub for updateResult
  useActivityResultsStore.setState({
    results: [],
    isHydrated: true,
    updateResult: jest.fn(() => Promise.resolve()),
  } as any);
});

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('QuizSubmissionFlow — E2E', () => {
  // ── 1. Initial render ──────────────────────────────────────────────────────
  it('renders the quiz title and MCQ question on first load', () => {
    const { getByText } = render(
      <ActivityMcqPostQuiz
        activityId="parachute-drop"
        result={makeResult()}
        onComplete={jest.fn()}
        styles={STYLES}
      />
    );

    expect(getByText('Quiz Title')).toBeTruthy();
    expect(getByText('1. What is the correct answer?')).toBeTruthy();
    expect(getByText('Wrong A')).toBeTruthy();
    expect(getByText('Correct B')).toBeTruthy();
    expect(getByText('Wrong C')).toBeTruthy();
    expect(getByText('Submit Quiz')).toBeTruthy();
  });

  // ── 2. Option selection ────────────────────────────────────────────────────
  it('allows selecting an MCQ option before submission', () => {
    const { getByText } = render(
      <ActivityMcqPostQuiz
        activityId="parachute-drop"
        result={makeResult()}
        onComplete={jest.fn()}
        styles={STYLES}
      />
    );

    // Tap the correct answer option
    fireEvent.press(getByText('Correct B'));

    // Submit Quiz button should still be present (not submitted yet)
    expect(getByText('Submit Quiz')).toBeTruthy();
  });

  // ── 3. Incomplete submission guard ─────────────────────────────────────────
  it('shows an alert when Submit is tapped without selecting an option', async () => {
    // Alert.alert is spied on globally in jest.setup.js
    const { Alert } = require('react-native');

    const { getByText } = render(
      <ActivityMcqPostQuiz
        activityId="parachute-drop"
        result={makeResult()}
        onComplete={jest.fn()}
        styles={STYLES}
      />
    );

    await act(async () => {
      fireEvent.press(getByText('Submit Quiz'));
    });

    expect(Alert.alert).toHaveBeenCalledWith('Incomplete', 'Please fill all answers');
  });

  // ── 4. Full happy-path submission ──────────────────────────────────────────
  it('transitions to the score/completion screen after a full valid submission', async () => {
    // Pre-fill open answers in the result data so allQuizOpenAnswersFilled passes,
    // and we only need to simulate the MCQ selection + press Submit.
    const { getByText, queryByText } = render(
      <ActivityMcqPostQuiz
        activityId="parachute-drop"
        result={makeResult({
          quizOpenAnswers: ['My reflection 1', 'My reflection 2', 'My reflection 3'],
        })}
        onComplete={jest.fn()}
        styles={STYLES}
      />
    );

    // Step 1: select the correct MCQ option (index 1 → 'Correct B')
    fireEvent.press(getByText('Correct B'));

    // Step 2: submit (all open answers are pre-filled, MCQ is selected)
    await act(async () => {
      fireEvent.press(getByText('Submit Quiz'));
    });

    // Step 3: verify score screen is shown and submit button is gone
    await waitFor(() => {
      expect(queryByText('Submit Quiz')).toBeNull();
      expect(getByText('Continue')).toBeTruthy();
      expect(getByText('Retake')).toBeTruthy();
    });
  });

  // ── 5. Continue fires onComplete ───────────────────────────────────────────
  it('calls onComplete when the student taps Continue after submitting', async () => {
    const onComplete = jest.fn();

    // Start with a pre-completed quiz so we skip the submission step
    const { getByText } = render(
      <ActivityMcqPostQuiz
        activityId="parachute-drop"
        result={makeResult({
          quizCompleted: true,
          quizScore: 1,
          quizAnswers: { '0': 1 },
          quizOpenAnswers: ['Answer 1', 'Answer 2', 'Answer 3'],
        })}
        onComplete={onComplete}
        styles={STYLES}
      />
    );

    // Continue button should already be visible
    await waitFor(() => expect(getByText('Continue')).toBeTruthy());

    await act(async () => {
      fireEvent.press(getByText('Continue'));
    });

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  // ── 6. Retake resets state ─────────────────────────────────────────────────
  it('resets the quiz to the initial state when the student taps Retake', async () => {
    const { getByText, queryByText } = render(
      <ActivityMcqPostQuiz
        activityId="parachute-drop"
        result={makeResult({
          quizCompleted: true,
          quizScore: 1,
          quizAnswers: { '0': 1 },
          quizOpenAnswers: ['Answer 1', 'Answer 2', 'Answer 3'],
        })}
        onComplete={jest.fn()}
        styles={STYLES}
      />
    );

    // Retake button should be visible (quiz was already completed)
    await waitFor(() => expect(getByText('Retake')).toBeTruthy());

    await act(async () => {
      fireEvent.press(getByText('Retake'));
    });

    // After retake: Submit Quiz returns, Continue/Retake disappear
    await waitFor(() => {
      expect(getByText('Submit Quiz')).toBeTruthy();
      expect(queryByText('Continue')).toBeNull();
      expect(queryByText('Retake')).toBeNull();
    });
  });

  // ── 7. Already-completed quiz renders score directly ──────────────────────
  it('shows the score box immediately when the quiz was already completed', () => {
    const { getByText, queryByText } = render(
      <ActivityMcqPostQuiz
        activityId="parachute-drop"
        result={makeResult({
          quizCompleted: true,
          quizScore: 1,
          quizAnswers: { '0': 1 },
          quizOpenAnswers: ['Answer 1', 'Answer 2', 'Answer 3'],
        })}
        onComplete={jest.fn()}
        styles={STYLES}
      />
    );

    expect(getByText('Score: 1/1')).toBeTruthy();
    expect(queryByText('Submit Quiz')).toBeNull();
  });
});
