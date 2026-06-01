import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { useActivityResultsStore } from '../../stores';
import { useGradeBand } from '../../hooks/useGradeBand';
import {
  allQuizOpenAnswersFilled,
  getQuizOpenQuestions,
  loadQuizOpenAnswers,
  saveQuizOpenAnswers,
} from '../../utils/quizOpenQuestions';
import { QuizOpenSection } from './QuizOpenSection';
import { ForumComposer } from '../forum/ForumComposer';
import type { ActivityResult } from '../../types';

function getQuizQuestions(isHighSchool: boolean) {
  if (isHighSchool) {
    return [
      {
        q: 'Why do engineers design structures to absorb and distribute energy during an earthquake?',
        options: [
          'To make the building heavier',
          'To prevent ground vibrations from collapsing the structure',
          'To increase the speed of the vibrations',
          'To save construction materials',
        ],
        correct: 1,
        explanation:
          'Engineers design buildings to absorb and distribute energy safely to prevent vibrations from collapsing poorly designed structures.',
      },
      {
        q: 'What is the main cause of damage to buildings during an earthquake?',
        options: ['High winds', 'Heavy rain', 'Ground vibrations', 'Loud noises'],
        correct: 2,
        explanation: 'Earthquakes cause severe ground vibrations that shake and can ultimately collapse buildings.',
      },
      {
        q: 'Which structural modification generally makes a building MORE resistant to earthquake vibrations?',
        options: [
          'Making the base narrower',
          'Adding shock-absorbing layers and cross-bracing',
          'Building taller without support',
          'Using weaker materials',
        ],
        correct: 1,
        explanation: 'Adding anti-vibration layers, cross-bracing, and strong pillars helps a building distribute the energy.',
      },
    ];
  }
  return [
    {
      q: 'During an earthquake, the ground…',
      options: ['Shakes', 'Turns to ice', 'Stops moving forever', 'Becomes invisible'],
      correct: 0,
      explanation: 'Earthquakes shake the ground back and forth.',
    },
    {
      q: 'A wide, steady base usually helps a tower…',
      options: ['Stay upright longer', 'Fall over faster', 'Float away', 'Melt'],
      correct: 0,
      explanation: 'A wider base can make a structure more stable when it shakes.',
    },
    {
      q: 'Soft padding or folded layers can help because they…',
      options: ['Absorb some shaking', 'Make the phone heavier', 'Stop gravity', 'Remove all sound'],
      correct: 0,
      explanation: 'Cushioning can soak up some of the shaking energy.',
    },
  ];
}

interface Props {
  result: ActivityResult;
  onComplete: () => void;
}

export function EarthquakePostActivity({ result, onComplete }: Props) {
  const { isHighSchool, isPrimary } = useGradeBand();
  const updateResult = useActivityResultsStore((s) => s.updateResult);
  const questions = getQuizQuestions(isHighSchool);
  const openQuestions = getQuizOpenQuestions('earthquake', isPrimary);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [openAnswers, setOpenAnswers] = useState(() => loadQuizOpenAnswers(result.data));

  const handleAnswer = (index: number) => {
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleFinish = async () => {
    if (!allQuizOpenAnswersFilled(openAnswers)) {
      alert('Please answer all reflection questions before continuing.');
      return;
    }

    await updateResult(result.id, {
      data: {
        ...result.data,
        quizCompleted: true,
        quizScore: score,
        ...saveQuizOpenAnswers(openAnswers),
      },
    });
    onComplete();
  };

  if (result.data.quizCompleted && !showResults) {
    return (
      <Card style={styles.container}>
        <View style={styles.successBadge}>
          <Text style={styles.successText}>✓</Text>
        </View>
        <Text style={styles.title}>Quiz Completed!</Text>
        <Text style={styles.desc}>
          You previously scored {result.data.quizScore} / {questions.length}
        </Text>
        <Button title="Continue to Discussion" onPress={onComplete} size="lg" />
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card style={[styles.container, styles.resultsCard]}>
        <ScrollView contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Quiz Results</Text>
          <Text style={styles.scoreText}>
            You scored {score} out of {questions.length}
          </Text>
          <View style={styles.explanationBox}>
            <Text style={styles.explanationTitle}>Did you know?</Text>
            <Text style={styles.explanationText}>
              Earthquakes cause ground vibrations that can collapse poorly designed structures. Engineers design buildings to absorb and distribute energy safely.
            </Text>
          </View>
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
          />
          <Button
            title="Continue to Discussion"
            onPress={handleFinish}
            size="lg"
            disabled={!allQuizOpenAnswersFilled(openAnswers)}
            style={{ marginTop: Spacing.md }}
          />
        </ScrollView>
      </Card>
    );
  }

  const q = questions[currentQuestion];

  return (
    <Card style={styles.container}>
      <Text style={styles.progress}>Question {currentQuestion + 1} of {questions.length}</Text>
      <Text style={styles.question}>{q.q}</Text>
      <View style={styles.options}>
        {q.options.map((opt, i) => (
          <Button
            key={i}
            title={opt}
            onPress={() => handleAnswer(i)}
            variant="outlined"
            style={styles.optionBtn}
          />
        ))}
      </View>
    </Card>
  );
}

export function EarthquakeDiscussion() {
  const { isPrimary } = useGradeBand();

  return (
    <View style={styles.discussionContainer}>
      <Text style={styles.discussionTitle}>Activity Discussion</Text>
      <Text style={styles.discussionDesc}>
        {isPrimary
          ? 'Show your strongest tower! What helped it stay up when the phone shook — wide base, pillars, or soft layers?'
          : 'Share your most stable building designs! What combination of folds and pillars worked best for you?'}
      </Text>
      <ForumComposer categoryId="earthquake" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  resultsCard: {
    alignItems: 'stretch',
    maxHeight: '85%',
  },
  resultsContent: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  progress: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  question: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  options: {
    width: '100%',
    gap: Spacing.md,
  },
  optionBtn: {
    width: '100%',
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  desc: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  scoreText: {
    ...Typography.h1,
    color: Colors.primary,
    marginBottom: Spacing.xl,
  },
  explanationBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    width: '100%',
  },
  explanationTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  explanationText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: '700',
  },
  discussionContainer: {
    marginTop: Spacing.md,
  },
  discussionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  discussionDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  }
});
