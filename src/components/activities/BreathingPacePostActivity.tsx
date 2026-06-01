import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { useActivityResultsStore } from '../../stores';
import { useGradeBand } from '../../hooks/useGradeBand';
import {
  allQuizOpenAnswersFilled,
  emptyQuizOpenAnswers,
  getQuizOpenQuestions,
  loadQuizOpenAnswers,
  saveQuizOpenAnswers,
} from '../../utils/quizOpenQuestions';
import { QuizOpenSection } from './QuizOpenSection';
import type { ActivityResult } from '../../types';

interface BreathingPacePostActivityProps {
  result: ActivityResult;
  onComplete: () => void;
}

type IndexQuiz = { question: string; options: string[]; answer: number };

const PRIMARY_QUIZ: IndexQuiz[] = [
  {
    question: 'After exercise, you usually breathe…',
    options: ['Faster', 'Slower forever', 'Not at all', 'Only through your feet'],
    answer: 0,
  },
  {
    question: 'Where should the phone go to feel your breathing?',
    options: ['Gently on your chest', 'On the floor', 'In your bag', 'Under a chair'],
    answer: 0,
  },
  {
    question: 'The phone sensor feels your chest…',
    options: ['Moving up and down', 'Getting heavier', 'Turning blue', 'Making noise only'],
    answer: 0,
  },
  {
    question: 'After star jumps, breathing is faster because your body needs…',
    options: ['More air and rest', 'Less air', 'No oxygen', 'To stop moving'],
    answer: 0,
  },
  {
    question: 'Breaths per minute tells you…',
    options: ['How many breaths in one minute', 'How loud you are', 'Your shoe size', 'The room colour'],
    answer: 0,
  },
];

const HIGH_SCHOOL_QUIZ: IndexQuiz[] = [
  {
    question: 'Why does breathing rate increase during exercise?',
    options: [
      'To cool the lungs down',
      'To supply more oxygen to working muscles',
      'Because the phone sensor speeds up',
      'To reduce heart rate',
    ],
    answer: 1,
  },
  {
    question: 'Where should the phone be placed to detect chest movement?',
    options: ['On the floor', 'Gently on the chest', 'In your pocket', "Held at arm's length"],
    answer: 1,
  },
  {
    question: 'What does the accelerometer measure during this activity?',
    options: [
      'Blood pressure directly',
      'Chest rise and fall from breathing',
      'Room temperature',
      'Sound levels',
    ],
    answer: 1,
  },
  {
    question: 'Why might breathing rate be higher after star jumps than at rest?',
    options: [
      'The body needs less oxygen after exercise',
      'Muscles need more oxygen to recover from activity',
      'Breathing slows down after exercise',
      'The sensor only works after jumping',
    ],
    answer: 1,
  },
  {
    question: 'What is breaths per minute (BPM)?',
    options: [
      'How loud you breathe',
      'The number of breath cycles in one minute',
      'The weight of air inhaled',
      'The speed of your heartbeat',
    ],
    answer: 1,
  },
];

export function BreathingPacePostActivity({ result, onComplete }: BreathingPacePostActivityProps) {
  const { isHighSchool, isPrimary } = useGradeBand();
  const updateResult = useActivityResultsStore((s) => s.updateResult);
  const quizQuestions = isHighSchool ? HIGH_SCHOOL_QUIZ : PRIMARY_QUIZ;
  const openQuestions = getQuizOpenQuestions('breathing-pace', isPrimary);

  const existingAnswers = (result.data.quizAnswers as Record<string, number>) || {};
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(existingAnswers);
  const [openAnswers, setOpenAnswers] = useState(() => loadQuizOpenAnswers(result.data));
  const [quizSubmitted, setQuizSubmitted] = useState(!!result.data.quizCompleted);
  const [score, setScore] = useState((result.data.quizScore as number) || 0);

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionIndex.toString()]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(quizAnswers).length < quizQuestions.length || !allQuizOpenAnswersFilled(openAnswers)) {
      alert('Please answer all multiple choice and reflection questions before submitting.');
      return;
    }

    let correct = 0;
    quizQuestions.forEach((question, index) => {
      if (quizAnswers[index.toString()] === question.answer) correct += 1;
    });
    setScore(correct);
    setQuizSubmitted(true);

    await updateResult(result.id, {
      data: {
        ...result.data,
        quizAnswers,
        ...saveQuizOpenAnswers(openAnswers),
        quizScore: correct,
        quizCompleted: true,
      },
    });
  };

  const handleRetake = async () => {
    setQuizSubmitted(false);
    setQuizAnswers({});
    setOpenAnswers(emptyQuizOpenAnswers());
    setScore(0);

    await updateResult(result.id, {
      data: {
        ...result.data,
        quizAnswers: {},
        ...saveQuizOpenAnswers(emptyQuizOpenAnswers()),
        quizScore: 0,
        quizCompleted: false,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Post-Experiment Quiz</Text>
        <Text style={styles.subtitle}>
          {isPrimary
            ? 'Quick check — what did you learn about breathing?'
            : 'Test your knowledge on breathing and exercise physiology!'}
        </Text>

        {quizQuestions.map((question, questionIndex) => (
          <View key={questionIndex} style={styles.questionBlock}>
            <Text style={styles.question}>
              {questionIndex + 1}. {question.question}
            </Text>
            {question.options.map((option, optionIndex) => {
              const isSelected = quizAnswers[questionIndex.toString()] === optionIndex;
              const isCorrect = optionIndex === question.answer;

              let bgColor = Colors.background;
              let borderColor = Colors.border;

              if (quizSubmitted) {
                if (isCorrect) {
                  bgColor = Colors.secondary + '20';
                  borderColor = Colors.secondary;
                } else if (isSelected && !isCorrect) {
                  bgColor = Colors.danger + '20';
                  borderColor = Colors.danger;
                }
              } else if (isSelected) {
                bgColor = Colors.primary + '20';
                borderColor = Colors.primary;
              }

              return (
                <Button
                  key={optionIndex}
                  title={option}
                  variant="ghost"
                  onPress={() => handleOptionSelect(questionIndex, optionIndex)}
                  style={[styles.optionBtn, { backgroundColor: bgColor, borderColor, borderWidth: 1 }]}
                  textStyle={{
                    color: quizSubmitted && (isCorrect || isSelected) ? Colors.text : isSelected ? Colors.primary : Colors.text,
                    textAlign: 'left',
                  }}
                />
              );
            })}
          </View>
        ))}

        <QuizOpenSection
          questions={openQuestions}
          answers={openAnswers}
          onChange={(index, value) => {
            setOpenAnswers((prev) => {
              const next = [...prev];
              next[index] = value;
              return next;
            });
          }}
          disabled={quizSubmitted}
          startNumber={quizQuestions.length + 1}
        />

        {!quizSubmitted ? (
          <Button title="Submit Quiz" onPress={handleSubmitQuiz} size="lg" />
        ) : (
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>
              You scored {score} out of {quizQuestions.length}!
            </Text>
            <Button title="Retake Quiz" onPress={handleRetake} variant="outlined" style={{ marginTop: Spacing.md }} />
            <Button title="Continue to Discussion" onPress={onComplete} size="lg" style={{ marginTop: Spacing.sm }} />
          </View>
        )}
      </Card>
    </View>
  );
}

export function BreathingPaceDiscussion() {
  const { isHighSchool, isPrimary } = useGradeBand();

  return (
    <View style={styles.container}>
      <Card style={styles.discussionCard}>
        <Text style={styles.sectionTitle}>Discussion</Text>
        {isPrimary ? (
          <>
            <Text style={styles.paragraph}>
              When you rest, you breathe steadily. After jogging or star jumps, you breathe faster because your body
              needs more air. The phone on your chest feels it move up and down.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Talk about: </Text>
                When did you breathe the fastest — at rest, after jogging, or after star jumps? Why do you think so?
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.paragraph}>
              Breathing rate increases during exercise to supply more oxygen to muscles. Sensors detect chest movement,
              helping students visualise breathing patterns.
            </Text>
            <Text style={styles.subHeading}>Breathing at Rest vs After Exercise</Text>
            <Text style={styles.paragraph}>
              At rest, your body needs a steady supply of oxygen. After exercise, muscles work harder. Your breathing rate
              rises so your lungs can bring in more oxygen and remove waste gases faster.
            </Text>
            {isHighSchool && (
              <>
                <Text style={styles.subHeading}>How the Sensor Works</Text>
                <Text style={styles.paragraph}>
                  When the phone rests on your chest, the accelerometer picks up tiny movements with each inhale and
                  exhale. Larger breaths after exercise create bigger sensor readings. Comparing breaths per minute helps
                  you see how exercise affects your body.
                </Text>
              </>
            )}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Did You Know? </Text>
                Doctors and athletes sometimes use sensors to watch breathing during training — like your phone in this lab.
              </Text>
            </View>
          </>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.xl },
  card: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: { ...Typography.h2, color: Colors.primary, marginBottom: Spacing.xs },
  subtitle: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xl },
  questionBlock: { marginBottom: Spacing.xl },
  question: { ...Typography.body, fontWeight: '600', marginBottom: Spacing.md, color: Colors.text },
  optionBtn: {
    marginBottom: Spacing.sm,
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  scoreBox: {
    backgroundColor: Colors.secondary + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  scoreText: { ...Typography.h3, color: Colors.secondary },
  discussionCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '50',
  },
  sectionTitle: { ...Typography.h2, color: Colors.primary, marginBottom: Spacing.xs },
  paragraph: { ...Typography.body, color: Colors.text, lineHeight: 24, marginBottom: Spacing.xl },
  subHeading: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.sm },
  infoBox: {
    backgroundColor: Colors.accentLight + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  infoText: { ...Typography.bodySmall, color: '#854d0e' },
});
