import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

interface HandFanPostActivityProps {
  result: ActivityResult;
  onComplete: () => void;
}

type IndexQuiz = { question: string; options: string[]; answer: number };

const PRIMARY_QUIZ: IndexQuiz[] = [
  {
    question: 'What does moving air do to the paper?',
    options: ['Pushes it', 'Melts it', 'Makes it invisible', 'Stops all sound'],
    answer: 0,
  },
  {
    question: 'A bigger fan usually moves…',
    options: ['More air', 'Less air', 'No air', 'Only water'],
    answer: 0,
  },
  {
    question: 'When the paper is farther from the fan, it usually bends…',
    options: ['Less', 'More', 'The same every time', 'Not at all'],
    answer: 0,
  },
  {
    question: 'Fanning faster usually makes the paper move…',
    options: ['More', 'Less', 'Not at all', 'Backward only'],
    answer: 0,
  },
  {
    question: 'Why try different fan shapes?',
    options: ['To see which works best', 'To break the paper', 'Because tape is heavy', 'No reason'],
    answer: 0,
  },
];

const HIGH_SCHOOL_QUIZ: IndexQuiz[] = [
  {
    question: 'How does material stiffness affect the bend angle?',
    options: [
      'Stiffer materials bend more easily',
      'Stiffer materials require more force to bend, resulting in a smaller angle',
      'Stiffness has no effect on the bend angle',
      'Stiffer materials only bend if the distance is greater',
    ],
    answer: 1,
  },
  {
    question: 'How does fan design influence air velocity and resulting paper movement?',
    options: [
      'A fan that captures and directs more air creates higher velocity and more movement',
      'Smaller fans always create more air velocity',
      'Fan design does not affect air velocity',
      'Air velocity is solely determined by the material of the fan',
    ],
    answer: 0,
  },
  {
    question: 'How does distance from the fan affect bending?',
    options: [
      'The bending increases as distance increases',
      'Distance does not affect the bending angle',
      'Air pressure dissipates over distance, so bending decreases as distance increases',
      'The fan only works at exactly 30cm',
    ],
    answer: 2,
  },
  {
    question: 'What force causes the upright paper to bend when fanning?',
    options: [
      'Magnetic force',
      'Gravity pulling it down',
      'Air pressure applying a force to the surface',
      'Thermal expansion',
    ],
    answer: 2,
  },
  {
    question: 'Why does repeated bending weaken the paper?',
    options: [
      'It loses mass over time',
      'Repeated stress alters its structure due to plasticity, making it more flexible',
      'It gains stiffness the more it bends',
      'It absorbs moisture from the moving air',
    ],
    answer: 1,
  },
];

export function HandFanPostActivity({ result, onComplete }: HandFanPostActivityProps) {
  const { isHighSchool, isPrimary } = useGradeBand();
  const updateResult = useActivityResultsStore((s) => s.updateResult);
  const quizQuestions = isHighSchool ? HIGH_SCHOOL_QUIZ : PRIMARY_QUIZ;
  const openQuestions = getQuizOpenQuestions('hand-fan', isPrimary);

  const existingAnswers = result.data.quizAnswers || {};
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(existingAnswers);
  const [openAnswers, setOpenAnswers] = useState(() => loadQuizOpenAnswers(result.data));
  const [quizSubmitted, setQuizSubmitted] = useState(!!result.data.quizCompleted);
  const [score, setScore] = useState(result.data.quizScore || 0);

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionIndex.toString()]: optionIndex }));
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
      }
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
      }
    });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Post-Experiment Quiz</Text>
        <Text style={styles.subtitle}>
          {isPrimary ? 'Quick check — what did you learn about your fan?' : 'Test your knowledge on the science behind the hand fan!'}
        </Text>

        {quizQuestions.map((q, qIndex) => (
          <View key={qIndex} style={styles.questionBlock}>
            <Text style={styles.question}>{qIndex + 1}. {q.question}</Text>
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
                  style={[
                    styles.optionBtn, 
                    { backgroundColor: bgColor, borderColor, borderWidth: 1 }
                  ]}
                  textStyle={{ 
                    color: (quizSubmitted && (isCorrect || isSelected)) ? Colors.text : (isSelected ? Colors.primary : Colors.text),
                    textAlign: 'left'
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
            <Text style={styles.scoreText}>You scored {score} out of {quizQuestions.length}!</Text>
            <Button title="Continue to Discussion" onPress={onComplete} size="lg" style={{ marginTop: Spacing.md }} />
            <Button
              title="Retake Quiz"
              onPress={handleRetake}
              variant="outlined"
              style={{ marginTop: Spacing.sm }}
            />
          </View>
        )}
      </Card>
    </View>
  );
}

export function HandFanDiscussion() {
  const { isHighSchool, isPrimary } = useGradeBand();

  return (
    <View style={styles.container}>
      <Card style={styles.discussionCard}>
        <Text style={styles.sectionTitle}>Discussion</Text>
        {isPrimary ? (
          <>
            <Text style={styles.paragraph}>
              When you fan, you push air toward the paper. The air pushes back on the paper and makes it bend. A bigger fan and faster fanning usually move the paper more. If the paper is farther away, the air feels weaker.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Talk about: </Text>
                Which fan design moved the paper the most? What would you try next?
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.paragraph}>
              Moving air applies a physical force, known as aerodynamic pressure, to objects in its path. When you use a hand fan, the amount of air you displace and the speed at which it travels determines the force exerted on the target paper.
            </Text>
            <Text style={styles.subHeading}>Fan Design & Fluid Dynamics</Text>
            <Text style={styles.paragraph}>
              The design of the fan greatly impacts how effectively it moves air. A fan with wider folds generally has a larger surface area, allowing it to capture and push a larger volume of air. However, the shape of the folds also determines how directional the airflow is. More directional flow means less air &quot;spills&quot; off the sides.
            </Text>
            <Text style={styles.subHeading}>Material Stiffness & Plasticity</Text>
            <Text style={styles.paragraph}>
              The force required to bend an object depends on its stiffness. When the paper bends and returns to its original shape, it is behaving elastically. If it bends too far and stays bent, it has been stressed too much. Repeated bending can weaken the paper.
            </Text>
          </>
        )}

        {isHighSchool && (
        <View style={styles.tableBlock}>
          <Text style={styles.tableHeading}>Key Factors Influencing Airflow Force</Text>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.tableCell, {flex: 1, fontWeight: '700'}]}>Factor</Text>
            <Text style={[styles.tableCell, {flex: 2, fontWeight: '700'}]}>Scientific Effect</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, {flex: 1, fontWeight: '600'}]}>Fan Surface Area</Text>
            <Text style={[styles.tableCell, {flex: 2}]}>A larger area displaces a greater volume of air with each swing.</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, {flex: 1, fontWeight: '600'}]}>Fanning Speed</Text>
            <Text style={[styles.tableCell, {flex: 2}]}>Dynamic pressure increases with the square of the air's velocity.</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, {flex: 1, fontWeight: '600'}]}>Target Distance</Text>
            <Text style={[styles.tableCell, {flex: 2}]}>Airflow spreads outwards over distance, causing the pressure to drop significantly as the distance increases.</Text>
          </View>
        </View>
        )}

        {isHighSchool ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: '700' }}>Did You Know? </Text>
              Engineers use fluid dynamics to design wind turbines, airplane wings, and cooling fans.
            </Text>
          </View>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
  },
  card: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  questionBlock: {
    marginBottom: Spacing.xl,
  },
  question: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.md,
    color: Colors.text,
  },
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
  scoreText: {
    ...Typography.h3,
    color: Colors.secondary,
  },
  discussionCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '50',
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  discussionText: {
    ...Typography.body,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  subHeading: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  tableBlock: {
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  tableHeading: {
    ...Typography.body,
    fontWeight: '700',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  tableCell: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    paddingRight: Spacing.sm,
  },
  infoBox: {
    backgroundColor: Colors.accentLight + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  infoText: {
    ...Typography.bodySmall,
    color: '#854d0e',
  }
});
