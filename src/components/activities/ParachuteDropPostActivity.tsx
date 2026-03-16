import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { useRequireAuth, useActivityResultsStore } from '../../stores';
import type { ActivityResult } from '../../types';

interface Props {
  result: ActivityResult;
  onComplete: () => void;
}

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What force pulls the parachute downward?',
    options: ['Gravity', 'Air Resistance', 'Magnetism', 'Friction'],
    answer: 'Gravity',
  },
  {
    id: 'q2',
    question: 'What force acts upward to slow the parachute down?',
    options: ['Gravity', 'Air Resistance (Drag)', 'Tension', 'Normal Force'],
    answer: 'Air Resistance (Drag)',
  },
  {
    id: 'q3',
    question: 'How does increasing the parachute size affect the fall time?',
    options: ['It decreases fall time', 'It increases fall time', 'It has no effect', 'It makes the toy heavier'],
    answer: 'It increases fall time',
  },
  {
    id: 'q4',
    question: 'What happens to the G-Force if the stopping time is very short (e.g. a hard landing)?',
    options: ['It decreases', 'It increases', 'It stays the same', 'It becomes negative'],
    answer: 'It increases',
  },
  {
    id: 'q5',
    question: 'Why do engineers build multiple prototypes?',
    options: ['To waste materials', 'To test and improve performance', 'Because one is never enough', 'To make the toy look better'],
    answer: 'To test and improve performance',
  }
];

export function ParachuteDropPostActivity({ result, onComplete }: Props) {
  const { t } = useTranslation();
  const { team } = useRequireAuth();
  const updateResult = useActivityResultsStore((s) => s.updateResult);

  // Initialize state from existing result data if present
  const existingAnswers = result.data.quizAnswers || {};
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>(existingAnswers);
  const [openAnswer1, setOpenAnswer1] = useState(result.data.quizOpenAnswer1 || '');
  const [openAnswer2, setOpenAnswer2] = useState(result.data.quizOpenAnswer2 || '');
  const [quizSubmitted, setQuizSubmitted] = useState(!!result.data.quizCompleted);
  const [score, setScore] = useState(result.data.quizScore || 0);

  const handleOptionSelect = (questionId: string, option: string) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length || !openAnswer1.trim() || !openAnswer2.trim()) {
      alert("Please answer all multiple choice and open questions before submitting.");
      return;
    }
    
    let correct = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (quizAnswers[q.id] === q.answer) correct++;
    });
    setScore(correct);
    setQuizSubmitted(true);

    // Save to result data
    await updateResult(result.id, {
      data: {
        ...result.data,
        quizAnswers,
        quizOpenAnswer1: openAnswer1,
        quizOpenAnswer2: openAnswer2,
        quizScore: correct,
        quizCompleted: true,
      }
    });
    // Don't call onComplete here, let them review the answers. They can exit via Back button.
  };

  const handleRetake = async () => {
    setQuizSubmitted(false);
    setQuizAnswers({});
    setOpenAnswer1('');
    setOpenAnswer2('');
    setScore(0);
    
    await updateResult(result.id, {
      data: {
        ...result.data,
        quizAnswers: {},
        quizOpenAnswer1: '',
        quizOpenAnswer2: '',
        quizScore: 0,
        quizCompleted: false,
      }
    });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.quizCard}>
        <Text style={styles.sectionTitle}>Post-Experiment Quiz</Text>
        <Text style={styles.sectionSubtitle}>Test your knowledge on the science behind parachute drops!</Text>

        {QUIZ_QUESTIONS.map((q, index) => (
          <View key={q.id} style={styles.questionBlock}>
            <Text style={styles.questionText}>{index + 1}. {q.question}</Text>
            {q.options.map(opt => {
              const isSelected = quizAnswers[q.id] === opt;
              const isCorrect = opt === q.answer;
              
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
                  key={opt}
                  title={opt}
                  variant="ghost"
                  onPress={() => handleOptionSelect(q.id, opt)}
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

        <View style={styles.questionBlock}>
          <Text style={styles.questionText}>Were you correctly predicting the timings and performance?</Text>
          <Input
            value={openAnswer1}
            onChangeText={setOpenAnswer1}
            multiline
            numberOfLines={3}
            editable={!quizSubmitted}
            placeholder="Type your reflection here..."
          />
        </View>

        <View style={styles.questionBlock}>
          <Text style={styles.questionText}>What design was the easiest to make and why?</Text>
          <Input
            value={openAnswer2}
            onChangeText={setOpenAnswer2}
            multiline
            numberOfLines={3}
            editable={!quizSubmitted}
            placeholder="Type your reflection here..."
          />
        </View>

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

export function ParachuteDropDiscussion() {
  const { t } = useTranslation();
  const { team } = useRequireAuth();
  
  const isHighSchool = team?.gradeLevel === t('setup.gradeLowerHigh') || 
                       team?.gradeLevel === 'Lower High School (Grades 7–9)' || 
                       team?.gradeLevel?.includes('High');

  return (
    <View style={styles.container}>
      <Card style={styles.discussionCard}>
        <Text style={styles.sectionTitle}>Discussion</Text>
        <Text style={styles.paragraph}>
          Gravity pulls objects downward, causing them to speed up as they fall. A parachute increases air resistance (also called drag). Drag acts upward, opposing the motion and slowing the fall. A slower fall reduces the force when the toy hits the ground, making the landing safer. Engineers improve parachute designs through repeated testing and redesign.
        </Text>

        {isHighSchool && (
          <View style={styles.tableBlock}>
            <Text style={styles.tableHeading}>Forces Acting on the Toy</Text>
            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableCell, {flex: 1, fontWeight: '700'}]}>Force</Text>
              <Text style={[styles.tableCell, {flex: 1, fontWeight: '700'}]}>Formula</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, {flex: 1}]}>Downward (weight)</Text>
              <Text style={[styles.tableCell, {flex: 1, fontFamily: 'monospace'}]}>W = m × g</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, {flex: 1}]}>Upward (drag)</Text>
              <Text style={[styles.tableCell, {flex: 1, fontFamily: 'monospace'}]}>D = W - F_net</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, {flex: 1}]}>Net (total) force</Text>
              <Text style={[styles.tableCell, {flex: 1, fontFamily: 'monospace'}]}>F_net = m × a</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, {flex: 1, fontWeight: '600'}]}>Newton's 2nd Law</Text>
              <Text style={[styles.tableCell, {flex: 1, fontFamily: 'monospace'}]}>F = m × a</Text>
            </View>
          </View>
        )}

        <View style={styles.tableBlock}>
          <Text style={styles.tableHeading}>Typical G-Force Ranges and Injury Risk</Text>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.tableCell, {flex: 1, fontWeight: '700'}]}>G-Force</Text>
            <Text style={[styles.tableCell, {flex: 2, fontWeight: '700'}]}>Examples</Text>
            <Text style={[styles.tableCell, {flex: 2, fontWeight: '700'}]}>Likely Effects</Text>
          </View>
          
          {[
            { g: '1–5 g', ex: 'Standing up quickly, elevators, amusement rides', eff: 'No injury' },
            { g: '5–10 g', ex: 'Hard falls while running, minor car braking', eff: 'Possible bruising or strains' },
            { g: '10–30 g', ex: 'Sports collisions, bicycle crashes, car crashes (seatbelts)', eff: 'Serious injuries possible (broken bones)' },
            { g: '30–50 g', ex: 'Severe car crashes, falls onto hard surfaces', eff: 'High risk of severe injury' },
            { g: '50+ g', ex: 'Very sudden stops with no cushioning', eff: 'Life-threatening injuries likely' }
          ].map((row, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, {flex: 1, fontWeight: '600'}]}>{row.g}</Text>
              <Text style={[styles.tableCell, {flex: 2}]}>{row.ex}</Text>
              <Text style={[styles.tableCell, {flex: 2, color: i >= 3 ? Colors.danger : Colors.textSecondary}]}>{row.eff}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={{fontWeight: '700'}}>Important: </Text>
            Duration matters. A brief spike can be survivable, while sustained g-forces are more dangerous.
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
  quizCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  questionBlock: {
    marginBottom: Spacing.xl,
  },
  questionText: {
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
  paragraph: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.xl,
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
