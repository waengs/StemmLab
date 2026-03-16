import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { useActivityResultsStore } from '../../stores';
import type { ActivityResult } from '../../types';

interface HandFanPostActivityProps {
  result: ActivityResult;
  onComplete: () => void;
}

const QUIZ_QUESTIONS = [
  {
    question: 'How does material stiffness affect the bend angle?',
    options: [
      'Stiffer materials bend more easily',
      'Stiffer materials require more force to bend, resulting in a smaller angle',
      'Stiffness has no effect on the bend angle',
      'Stiffer materials only bend if the distance is greater'
    ],
    answer: 1,
  },
  {
    question: 'How does fan design influence air velocity and resulting paper movement?',
    options: [
      'A fan that captures and directs more air creates higher velocity and more movement',
      'Smaller fans always create more air velocity',
      'Fan design does not affect air velocity',
      'Air velocity is solely determined by the material of the fan'
    ],
    answer: 0,
  },
  {
    question: 'How does distance from the fan affect bending?',
    options: [
      'The bending increases as distance increases',
      'Distance does not affect the bending angle',
      'Air pressure dissipates over distance, so bending decreases as distance increases',
      'The fan only works at exactly 30cm'
    ],
    answer: 2,
  },
  {
    question: 'What force causes the upright paper to bend when fanning?',
    options: [
      'Magnetic force',
      'Gravity pulling it down',
      'Air pressure applying a force to the surface',
      'Thermal expansion'
    ],
    answer: 2,
  },
  {
    question: 'Why does repeated bending weaken the paper?',
    options: [
      'It loses mass over time',
      'Repeated stress alters its structure due to plasticity, making it more flexible',
      'It gains stiffness the more it bends',
      'It absorbs moisture from the moving air'
    ],
    answer: 1,
  }
];

export function HandFanPostActivity({ result, onComplete }: HandFanPostActivityProps) {
  const { t } = useTranslation();
  const updateResult = useActivityResultsStore((s) => s.updateResult);
  
  // Hand fan quiz answers are recorded as indices here, but we will store them as indices stringified or number.
  const existingAnswers = result.data.quizAnswers || {};
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(existingAnswers);
  const [quizSubmitted, setQuizSubmitted] = useState(!!result.data.quizCompleted);
  const [score, setScore] = useState(result.data.quizScore || 0);

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionIndex.toString()]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length) {
      alert("Please answer all multiple choice questions before submitting.");
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
        quizScore: correct,
        quizCompleted: true,
      }
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
      }
    });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Post-Experiment Quiz</Text>
        <Text style={styles.subtitle}>Test your knowledge on the science behind the hand fan!</Text>
        
        {QUIZ_QUESTIONS.map((q, qIndex) => (
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

        {!quizSubmitted ? (
          <Button title="Submit Quiz" onPress={handleSubmitQuiz} size="lg" />
        ) : (
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>You scored {score} out of {QUIZ_QUESTIONS.length}!</Text>
            <Button 
              title="Retake Quiz" 
              onPress={handleRetake} 
              variant="outlined" 
              style={{ marginTop: Spacing.md }} 
            />
          </View>
        )}
      </Card>
    </View>
  );
}

export function HandFanDiscussion() {
  return (
    <View style={styles.container}>
      <Card style={styles.discussionCard}>
        <Text style={styles.sectionTitle}>Discussion</Text>
        <Text style={styles.paragraph}>
          Moving air applies a physical force, known as aerodynamic pressure, to objects in its path. When you use a hand fan, the amount of air you displace and the speed at which it travels determines the force exerted on the target paper.
        </Text>
        
        <Text style={styles.subHeading}>Fan Design & Fluid Dynamics</Text>
        <Text style={styles.paragraph}>
          The design of the fan greatly impacts how effectively it moves air. A fan with wider folds generally has a larger surface area, allowing it to capture and push a larger volume of air. However, the shape of the folds also determines how directional the airflow is. More directional flow means less air "spills" off the sides.
        </Text>

        <Text style={styles.subHeading}>Material Stiffness & Plasticity</Text>
        <Text style={styles.paragraph}>
          The force required to bend an object depends on its stiffness (often related to its Young's Modulus). When the paper bends and returns to its original shape, it is behaving elastically. If it bends too far and stays bent or weakens, it has reached its plastic limit. Repeated bending causes structural fatigue.
        </Text>

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
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={{fontWeight: '700'}}>Did You Know? </Text>
            Engineers use principles of fluid dynamics to design highly efficient wind turbines, airplane wings, and even cooling fans for your computer!
          </Text>
        </View>
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
