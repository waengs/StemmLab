import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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

interface Props {
  result: ActivityResult;
  onComplete: () => void;
}

type McqQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

const PRIMARY_QUIZ: McqQuestion[] = [
  {
    id: 'q1',
    question: 'What pulls the parachute and toy downward?',
    options: ['Gravity', 'Wind only', 'Glue', 'Magnets'],
    answer: 'Gravity',
  },
  {
    id: 'q2',
    question: 'What helps the parachute fall more slowly?',
    options: ['Air pushing upward', 'Extra weight', 'Making it smaller', 'Turning off gravity'],
    answer: 'Air pushing upward',
  },
  {
    id: 'q3',
    question: 'A bigger parachute usually makes the toy fall…',
    options: ['More slowly', 'More quickly', 'Not at all', 'Sideways only'],
    answer: 'More slowly',
  },
  {
    id: 'q4',
    question: 'A very hard landing is usually…',
    options: ['Rougher and more jarring', 'Softer and safer', 'The same as a soft landing', 'Impossible'],
    answer: 'Rougher and more jarring',
  },
  {
    id: 'q5',
    question: 'Why do teams try more than one parachute design?',
    options: ['To learn which works best', 'To use up all the tape', 'Because one is never fun', 'To make it heavier'],
    answer: 'To learn which works best',
  },
];

const HIGH_SCHOOL_QUIZ: McqQuestion[] = [
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
  },
];

export function ParachuteDropPostActivity({ result, onComplete }: Props) {
  const { isHighSchool, isPrimary } = useGradeBand();
  const updateResult = useActivityResultsStore((s) => s.updateResult);
  const quizQuestions = isHighSchool ? HIGH_SCHOOL_QUIZ : PRIMARY_QUIZ;
  const openQuestions = getQuizOpenQuestions('parachute-drop', isPrimary);

  const existingAnswers = result.data.quizAnswers || {};
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>(existingAnswers);
  const [openAnswers, setOpenAnswers] = useState(() => loadQuizOpenAnswers(result.data));
  const [quizSubmitted, setQuizSubmitted] = useState(!!result.data.quizCompleted);
  const [score, setScore] = useState(result.data.quizScore || 0);

  const handleOptionSelect = (questionId: string, option: string) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(quizAnswers).length < quizQuestions.length || !allQuizOpenAnswersFilled(openAnswers)) {
      alert('Please answer all multiple choice and reflection questions before submitting.');
      return;
    }
    
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.answer) correct++;
    });
    setScore(correct);
    setQuizSubmitted(true);

    // Save to result data
    await updateResult(result.id, {
      data: {
        ...result.data,
        quizAnswers,
        ...saveQuizOpenAnswers(openAnswers),
        quizScore: correct,
        quizCompleted: true,
      }
    });
    // Don't call onComplete here, let them review the answers. They can exit via Back button.
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
      <Card style={styles.quizCard}>
        <Text style={styles.sectionTitle}>Post-Experiment Quiz</Text>
        <Text style={styles.sectionSubtitle}>
          {isPrimary
            ? 'Quick check — what did you learn about parachutes?'
            : 'Test your knowledge on the science behind parachute drops!'}
        </Text>

        {quizQuestions.map((q, index) => (
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

export function ParachuteDropDiscussion() {
  const { isHighSchool, isPrimary } = useGradeBand();

  return (
    <View style={styles.container}>
      <Card style={styles.discussionCard}>
        <Text style={styles.sectionTitle}>Discussion</Text>
        {isPrimary ? (
          <>
            <Text style={styles.paragraph}>
              Gravity pulls the toy down. The parachute catches air and slows the fall so the landing is gentler. Bigger parachutes usually slow the fall more. Testing different designs helps you see what works best.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Talk about: </Text>
                Which parachute gave the softest landing? What would you change next time?
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.paragraph}>
            Gravity pulls objects downward, causing them to speed up as they fall. A parachute increases air resistance (also called drag). Drag acts upward, opposing the motion and slowing the fall. A slower fall reduces the force when the toy hits the ground, making the landing safer. Engineers improve parachute designs through repeated testing and redesign.
          </Text>
        )}

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

        {isHighSchool && (
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
        )}

        {isHighSchool ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: '700' }}>Important: </Text>
              Duration matters. A brief spike can be survivable, while sustained g-forces are more dangerous.
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
