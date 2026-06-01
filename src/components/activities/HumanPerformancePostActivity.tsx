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

interface HumanPerformancePostActivityProps {
  result: ActivityResult;
  onComplete: () => void;
}

type IndexQuiz = { question: string; options: string[]; answer: number };

const PRIMARY_QUIZ: IndexQuiz[] = [
  {
    question: 'When you move quickly, the phone often feels…',
    options: ['Shakier', 'Completely still', 'Heavier', 'Colder'],
    answer: 0,
  },
  {
    question: 'Your muscles and joints help you…',
    options: ['Move your body', 'Charge the phone', 'Change the weather', 'Grow taller instantly'],
    answer: 0,
  },
  {
    question: 'Smooth, slow movements are usually…',
    options: ['Easier to control', 'Impossible to do', 'Always the shakiest', 'Invisible to the sensor'],
    answer: 0,
  },
  {
    question: 'Beeps and warnings during practice can help you…',
    options: ['Move more smoothly', 'Stop breathing', 'Break the phone', 'Skip the experiment'],
    answer: 0,
  },
  {
    question: 'This lab measures how…',
    options: ['Your body moves', 'Clouds form', 'Plants grow', 'Rocks melt'],
    answer: 0,
  },
];

const HIGH_SCHOOL_QUIZ: IndexQuiz[] = [
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
  const { isHighSchool, isPrimary } = useGradeBand();
  const updateResult = useActivityResultsStore((s) => s.updateResult);
  const quizQuestions = isHighSchool ? HIGH_SCHOOL_QUIZ : PRIMARY_QUIZ;
  const openQuestions = getQuizOpenQuestions('human-performance', isPrimary);

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
    quizQuestions.forEach((q, index) => {
      if (quizAnswers[index.toString()] === q.answer) correct++;
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
            ? 'Quick check — what did you notice about your movements?'
            : 'Test your knowledge on biomechanics and human movement!'}
        </Text>

        {quizQuestions.map((q, qIndex) => (
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

export function HumanPerformanceDiscussion() {
  const { isHighSchool, isPrimary } = useGradeBand();

  return (
    <View style={styles.container}>
      <Card style={styles.discussionCard}>
        <Text style={styles.sectionTitle}>Discussion</Text>
        {isPrimary ? (
          <>
            <Text style={styles.paragraph}>
              Your muscles and joints help you move. When you rush, the phone often feels shakier. Slow, smooth moves
              are easier to control. The sensor shows how steady your movement is.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Talk about: </Text>
                Which movement was the shakiest? Did the beeps help you slow down on the second try?
              </Text>
            </View>
          </>
        ) : (
          <>
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
            {isHighSchool && (
              <>
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
              </>
            )}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Did You Know? </Text>
                Athletes and coaches use motion sensors to check form and train smoother, safer movement — like your phone
                in this lab.
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
