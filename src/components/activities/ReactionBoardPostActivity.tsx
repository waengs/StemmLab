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

interface ReactionBoardPostActivityProps {
  result: ActivityResult;
  onComplete: () => void;
}

type IndexQuiz = { question: string; options: string[]; answer: number };

const PRIMARY_QUIZ: IndexQuiz[] = [
  {
    question: 'Reaction time is how long it takes to…',
    options: ['Respond after you see something', 'Run a race', 'Sleep', 'Eat lunch'],
    answer: 0,
  },
  {
    question: 'Your main hand is often faster because you…',
    options: ['Use it more every day', 'Have bigger shoes', 'Hold your breath', 'Skip practice'],
    answer: 0,
  },
  {
    question: 'Your brain helps you move by sending messages through your…',
    options: ['Nerves', 'Hair', 'Shoes', 'Lunch box'],
    answer: 0,
  },
  {
    question: 'Practicing many times usually makes you…',
    options: ['Faster and more accurate', 'Slower every time', 'Unable to tap', 'Forget colors'],
    answer: 0,
  },
  {
    question: 'The tracing game checks how well your hand and eyes…',
    options: ['Work together', 'Make sound', 'Change colour', 'Measure temperature'],
    answer: 0,
  },
];

const HIGH_SCHOOL_QUIZ: IndexQuiz[] = [
  {
    question: 'What is reaction time?',
    options: [
      'How fast you can run',
      'The time it takes to respond to a stimulus',
      'The time it takes to think of an answer',
      'How long your memory lasts',
    ],
    answer: 1,
  },
  {
    question: 'Why might your dominant hand have a faster reaction time?',
    options: [
      'It has stronger muscles',
      'It has larger bones',
      'It has stronger neural pathways from frequent use',
      'It is closer to your brain',
    ],
    answer: 2,
  },
  {
    question: 'Which part of the body processes the visual signal and sends a command to your hand?',
    options: ['The heart', 'The muscles', 'The brain and nervous system', 'The eyes only'],
    answer: 2,
  },
  {
    question: 'How does practice affect reaction time and coordination?',
    options: [
      'It makes you slower because you get tired',
      'It improves speed by strengthening neural pathways',
      'It does not affect reaction time',
      'It makes your fingers bigger',
    ],
    answer: 1,
  },
  {
    question: 'What does the tracing challenge measure?',
    options: [
      'How hard you press the screen',
      "Your phone's processing speed",
      'Your hand-eye coordination and fine motor skills',
      'Your memory of shapes',
    ],
    answer: 2,
  },
];

export function ReactionBoardPostActivity({ result, onComplete }: ReactionBoardPostActivityProps) {
  const { isHighSchool, isPrimary } = useGradeBand();
  const updateResult = useActivityResultsStore((s) => s.updateResult);
  const quizQuestions = isHighSchool ? HIGH_SCHOOL_QUIZ : PRIMARY_QUIZ;
  const openQuestions = getQuizOpenQuestions('reaction-board', isPrimary);

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
            ? 'Quick check — what did you learn about reaction time?'
            : 'Test your knowledge on neuroscience and motor skills!'}
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

export function ReactionBoardDiscussion() {
  const { isHighSchool, isPrimary } = useGradeBand();

  return (
    <View style={styles.container}>
      <Card style={styles.discussionCard}>
        <Text style={styles.sectionTitle}>Discussion</Text>
        {isPrimary ? (
          <>
            <Text style={styles.paragraph}>
              Reaction time is how fast you respond after you see something. Your eyes send a message to your brain, and
              your brain tells your hand to tap. Your main hand is often faster because you use it more.
            </Text>
            <Text style={styles.paragraph}>
              The tracing game checks how well your hand and eyes work together. Practice can make you faster and more
              accurate.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Talk about: </Text>
                Which hand was faster? Did you get better on the tracing challenge?
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.paragraph}>
              Reaction time measures how quickly your brain processes visual information from your eyes and sends a signal
              through your nervous system to your hand muscles.
            </Text>
            <Text style={styles.subHeading}>Dominant vs. Non-Dominant Hand</Text>
            <Text style={styles.paragraph}>
              You likely noticed a difference between your hands. The dominant hand usually has faster reaction times
              because its neural pathways are more developed from everyday use.
            </Text>
            {isHighSchool && (
              <>
                <Text style={styles.subHeading}>Coordination and Accuracy</Text>
                <Text style={styles.paragraph}>
                  The Tracing Challenge tested fine motor skills and hand-eye coordination. It requires the brain to
                  continuously adjust muscle movements based on changing visual feedback.
                </Text>
              </>
            )}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Did You Know? </Text>
                Athletes and gamers practice for many hours to shave milliseconds off their reaction time.
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
