import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { useActivityResultsStore } from '../../stores';
import type { ActivityResult } from '../../types';

interface HumanPerformancePostActivityProps {
  result: ActivityResult;
  onComplete: () => void;
}

const QUIZ_QUESTIONS = [
  {
    question: 'Why do faster movements often produce higher phone vibration readings?',
    options: [
      'The phone battery drains faster',
      'Rapid acceleration and deceleration create more unstable motion',
      'Gravity increases with speed',
      'The vibration sensor only works at high speeds',
    ],
    answer: 1,
  },
  {
    question: 'What do muscles and joints work together to create?',
    options: ['Electrical signals only', 'Controlled body movement', 'Phone vibrations', 'Sound waves'],
    answer: 1,
  },
  {
    question: 'Why might smoother movements show better coordination?',
    options: [
      'They require less muscle activation',
      'Steady, controlled motion reduces jerky accelerations detected by sensors',
      'Smooth movements are always slower',
      'Sensors cannot detect smooth movement',
    ],
    answer: 1,
  },
  {
    question: 'How can vibration feedback help during movement practice?',
    options: [
      'It makes the phone heavier',
      'It provides real-time cues so you can adjust movement to stay smoother',
      'It replaces the need for muscles',
      'It only works for figure-of-8 movements',
    ],
    answer: 1,
  },
  {
    question: 'What does biomechanics study in activities like this lab?',
    options: [
      'Only heart rate during exercise',
      'How the body moves, including forces, speed, and coordination',
      'Chemical reactions in food',
      'Weather patterns affecting movement',
    ],
    answer: 1,
  },
];

export function HumanPerformancePostActivity({ result, onComplete }: HumanPerformancePostActivityProps) {
  const updateResult = useActivityResultsStore((s) => s.updateResult);

  const existingAnswers = (result.data.quizAnswers as Record<string, number>) || {};
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(existingAnswers);
  const [openAnswer1, setOpenAnswer1] = useState((result.data.quizOpenAnswer1 as string) || '');
  const [openAnswer2, setOpenAnswer2] = useState((result.data.quizOpenAnswer2 as string) || '');
  const [openAnswer3, setOpenAnswer3] = useState((result.data.quizOpenAnswer3 as string) || '');
  const [quizSubmitted, setQuizSubmitted] = useState(!!result.data.quizCompleted);
  const [score, setScore] = useState((result.data.quizScore as number) || 0);

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionIndex.toString()]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (
      Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length ||
      !openAnswer1.trim() ||
      !openAnswer2.trim() ||
      !openAnswer3.trim()
    ) {
      alert('Please answer all multiple choice and reflection questions before submitting.');
      return;
    }

    let correct = 0;
    QUIZ_QUESTIONS.forEach((q, index) => {
      if (quizAnswers[index.toString()] === q.answer) correct++;
    });
    setScore(correct);
    setQuizSubmitted(true);

    await updateResult(result.id, {
      data: {
        ...result.data,
        quizAnswers,
        quizOpenAnswer1: openAnswer1,
        quizOpenAnswer2: openAnswer2,
        quizOpenAnswer3: openAnswer3,
        quizScore: correct,
        quizCompleted: true,
      },
    });
  };

  const handleRetake = async () => {
    setQuizSubmitted(false);
    setQuizAnswers({});
    setOpenAnswer1('');
    setOpenAnswer2('');
    setOpenAnswer3('');
    setScore(0);

    await updateResult(result.id, {
      data: {
        ...result.data,
        quizAnswers: {},
        quizOpenAnswer1: '',
        quizOpenAnswer2: '',
        quizOpenAnswer3: '',
        quizScore: 0,
        quizCompleted: false,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Post-Experiment Quiz</Text>
        <Text style={styles.subtitle}>Test your knowledge on biomechanics and human movement!</Text>

        {QUIZ_QUESTIONS.map((q, qIndex) => (
          <View key={qIndex} style={styles.questionBlock}>
            <Text style={styles.question}>
              {qIndex + 1}. {q.question}
            </Text>
            {q.options.map((opt, optIndex) => {
              const isSelected = quizAnswers[qIndex.toString()] === optIndex;
              const isCorrect = optIndex === q.answer;

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
                  key={optIndex}
                  title={opt}
                  variant="ghost"
                  onPress={() => handleOptionSelect(qIndex, optIndex)}
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

        <Text style={styles.reflectionHeading}>Reflection questions</Text>

        <View style={styles.questionBlock}>
          <Text style={styles.question}>Which movement was hardest to keep smooth?</Text>
          <Input
            value={openAnswer1}
            onChangeText={setOpenAnswer1}
            multiline
            numberOfLines={3}
            editable={!quizSubmitted}
            placeholder="Your answer..."
            onLightSurface
          />
        </View>

        <View style={styles.questionBlock}>
          <Text style={styles.question}>Did live feedback help you improve on the second attempt?</Text>
          <Input
            value={openAnswer2}
            onChangeText={setOpenAnswer2}
            multiline
            numberOfLines={3}
            editable={!quizSubmitted}
            placeholder="Your answer..."
            onLightSurface
          />
        </View>

        <View style={styles.questionBlock}>
          <Text style={styles.question}>How might athletes or physical therapists use similar sensors?</Text>
          <Input
            value={openAnswer3}
            onChangeText={setOpenAnswer3}
            multiline
            numberOfLines={3}
            editable={!quizSubmitted}
            placeholder="Your answer..."
            onLightSurface
          />
        </View>

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

export function HumanPerformanceDiscussion() {
  return (
    <View style={styles.container}>
      <Card style={styles.discussionCard}>
        <Text style={styles.sectionTitle}>Discussion</Text>
        <Text style={styles.paragraph}>
          Muscles and joints work together to create movement. Faster movements often reduce control, while smoother
          movements show better coordination. Sensors in the phone measure how quickly and smoothly the body moves,
          helping students understand biomechanics and fatigue.
        </Text>

        <Text style={styles.subHeading}>Muscles & Joints</Text>
        <Text style={styles.paragraph}>
          Skeletal muscles pull on bones via tendons, while joints act as pivot points. Coordinated muscle activation
          produces smooth, purposeful motion. When muscles fatigue, control decreases and vibration readings tend to
          increase.
        </Text>

        <Text style={styles.subHeading}>Speed vs. Control</Text>
        <Text style={styles.paragraph}>
          As movement speed increases, the body must manage greater accelerations and decelerations. Jerky or rushed
          motions create larger sensor spikes. Practicing slow, deliberate movements builds neuromuscular control.
        </Text>

        <Text style={styles.subHeading}>Sensor Feedback</Text>
        <Text style={styles.paragraph}>
          Phone vibration and movement sensors translate physical motion into measurable data — vibration (cm),
          speed (m/s), smoothness, and range of motion. Comparing predictions to actual results helps students
          develop scientific reasoning about their own bodies.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: '700' }}>Did You Know? </Text>
            Athletes and physical therapists use wearable motion sensors to track form, spot shaky movements, and
            design training that builds smoother, safer motion — the same idea as your phone accelerometer in this lab.
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
  reflectionHeading: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md, marginTop: Spacing.sm },
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
