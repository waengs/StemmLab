import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { useActivityResultsStore } from '../../stores';
import type { ActivityResult } from '../../types';

interface BreathingPacePostActivityProps {
  result: ActivityResult;
  onComplete: () => void;
}

const QUIZ_QUESTIONS = [
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
    options: ['On the floor', 'Gently on the chest', 'In your pocket', 'Held at arm\'s length'],
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
  const updateResult = useActivityResultsStore((s) => s.updateResult);

  const existingAnswers = (result.data.quizAnswers as Record<string, number>) || {};
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(existingAnswers);
  const [quizSubmitted, setQuizSubmitted] = useState(!!result.data.quizCompleted);
  const [score, setScore] = useState((result.data.quizScore as number) || 0);

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionIndex.toString()]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length) {
      alert('Please answer all multiple choice questions before submitting.');
      return;
    }

    let correct = 0;
    QUIZ_QUESTIONS.forEach((question, index) => {
      if (quizAnswers[index.toString()] === question.answer) correct += 1;
    });
    setScore(correct);
    setQuizSubmitted(true);

    await updateResult(result.id, {
      data: {
        ...result.data,
        quizAnswers,
        quizScore: correct,
        quizCompleted: true,
      },
    });
  };

  const handleRetake = async () => {
    setQuizSubmitted(false);
    setQuizAnswers({});
    setScore(0);

    await updateResult(result.id, {
      data: {
        ...result.data,
        quizAnswers: {},
        quizScore: 0,
        quizCompleted: false,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Post-Experiment Quiz</Text>
        <Text style={styles.subtitle}>Test your knowledge on breathing and exercise physiology!</Text>

        {QUIZ_QUESTIONS.map((question, questionIndex) => (
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

        {!quizSubmitted ? (
          <Button title="Submit Quiz" onPress={handleSubmitQuiz} size="lg" />
        ) : (
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>
              You scored {score} out of {QUIZ_QUESTIONS.length}!
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
  return (
    <View style={styles.container}>
      <Card style={styles.discussionCard}>
        <Text style={styles.sectionTitle}>Discussion</Text>
        <Text style={styles.paragraph}>
          Breathing rate increases during exercise to supply more oxygen to muscles. Sensors detect chest movement,
          helping students visualise breathing patterns.
        </Text>

        <Text style={styles.subHeading}>Breathing at Rest vs After Exercise</Text>
        <Text style={styles.paragraph}>
          At rest, your body needs a steady supply of oxygen for basic functions. After jogging or star jumps, muscles
          work harder and produce more carbon dioxide. Your breathing rate rises so the lungs can bring in more oxygen
          and remove waste gases faster.
        </Text>

        <Text style={styles.subHeading}>How the Sensor Works</Text>
        <Text style={styles.paragraph}>
          When the phone rests on your chest, the accelerometer picks up tiny movements with each inhale and exhale.
          Larger, faster breaths after exercise create bigger sensor readings. Comparing breaths per minute and movement
          data helps you see how exercise affects your body.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: '700' }}>Did You Know? </Text>
            Athletes and medical professionals use wearable sensors to monitor breathing during training and recovery —
            the same principle as your phone on your chest in this lab.
          </Text>
        </View>
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
