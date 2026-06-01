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
        q: 'At what sound level does hearing damage become likely after short exposure?',
        options: ['30-60 dB', '60-85 dB', '90-100 dB', '140+ dB'],
        correct: 2,
        explanation: '90-100 dB (like a motorbike or power tools) can cause hearing damage likely after short exposure.',
      },
      {
        q: 'Which of the following is considered safe for long periods?',
        options: ['Busy traffic (80 dB)', 'Normal conversation (50 dB)', 'Lawn mower (90 dB)', 'Rock concert (110 dB)'],
        correct: 1,
        explanation: '30-60 dB, such as normal conversation, is safe for long periods.',
      },
      {
        q: 'What is the immediate risk at 140+ dB?',
        options: ['No risk', 'Fatigue', 'Instant, permanent hearing damage', 'Temporary ringing'],
        correct: 2,
        explanation: '140+ dB (like an explosion or gunshot) causes instant and permanent hearing damage.',
      },
    ];
  }
  return [
    {
      q: 'Which sound is usually the quietest?',
      options: ['Whispering to a friend', 'Busy road traffic', 'A rock concert', 'A power drill'],
      correct: 0,
      explanation: 'Talking quietly is much softer than traffic, concerts, or drills.',
    },
    {
      q: 'Very loud sounds for a long time can…',
      options: ['Hurt your hearing', 'Make you taller', 'Change the weather', 'Stop gravity'],
      correct: 0,
      explanation: 'Loud noise can damage your ears if you hear it too long.',
    },
    {
      q: 'A good way to protect your ears near very loud noise is to…',
      options: ['Move away or use ear protection', 'Stand closer', 'Shout louder', 'Cover your eyes only'],
      correct: 0,
      explanation: 'Distance and ear protection help keep your hearing safe.',
    },
  ];
}

interface Props {
  result: ActivityResult;
  onComplete: () => void;
}

export function SoundPollutionPostActivity({ result, onComplete }: Props) {
  const { isHighSchool, isPrimary } = useGradeBand();
  const updateResult = useActivityResultsStore((s) => s.updateResult);
  const questions = getQuizQuestions(isHighSchool);
  const openQuestions = getQuizOpenQuestions('sound-pollution', isPrimary);

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
              Sound intensity varies depending on energy and surfaces. Prolonged loud noise can impact health and concentration.
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

export function SoundPollutionDiscussion() {
  const { isPrimary } = useGradeBand();

  return (
    <View style={styles.discussionContainer}>
      <Text style={styles.discussionTitle}>Activity Discussion</Text>
      <Text style={styles.discussionDesc}>
        {isPrimary
          ? 'Share what you found! Which place was the loudest? Which place was the quietest? Why do you think that happened?'
          : 'Share your loudest findings! Which area of the school was the noisiest? Did you find any surprising sources of sound pollution?'}
      </Text>
      <ForumComposer categoryId="sound-pollution" />
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
