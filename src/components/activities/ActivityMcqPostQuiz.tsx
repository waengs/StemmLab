import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGradeBand } from '../../hooks/useGradeBand';
import { useActivityResultsStore } from '../../stores';
import {
  allQuizOpenAnswersFilled,
  emptyQuizOpenAnswers,
  getQuizOpenQuestions,
  loadQuizOpenAnswers,
  saveQuizOpenAnswers,
} from '../../utils/quizOpenQuestions';
import { actT, getActivityQuizMcq } from '../../utils/activityContent';
import { showInterstitialAd } from '../../services/ads/showInterstitialAd';
import { QuizOpenSection } from './QuizOpenSection';
import { McqOption, type McqOptionState } from './McqOption';
import type { ActivityResult } from '../../types';
import type { ActivityQuizId } from '../../utils/quizOpenQuestions';
import { Spacing } from '../../theme';

type McqQuizStyles = {
  container: object;
  card: object;
  title: object;
  subtitle: object;
  questionBlock: object;
  question: object;
  scoreBox: object;
  scoreText: object;
};

interface ActivityMcqPostQuizProps {
  activityId: ActivityQuizId;
  result: ActivityResult;
  onComplete: () => void;
  styles: McqQuizStyles;
}

function getOptionState(
  quizSubmitted: boolean,
  isSelected: boolean,
  isCorrect: boolean
): McqOptionState {
  if (quizSubmitted) {
    if (isCorrect) return 'correct';
    if (isSelected && !isCorrect) return 'incorrect';
    return 'default';
  }
  if (isSelected) return 'selected';
  return 'default';
}

export function ActivityMcqPostQuiz({
  activityId,
  result,
  onComplete,
  styles,
}: ActivityMcqPostQuizProps) {
  const { isPrimary } = useGradeBand();
  const updateResult = useActivityResultsStore((s) => s.updateResult);

  const quizQuestions = getActivityQuizMcq(activityId, isPrimary);
  const openQuestions = getQuizOpenQuestions(activityId, isPrimary);

  const existingAnswers = (result.data.quizAnswers as Record<string, number>) || {};
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(existingAnswers);
  const [openAnswers, setOpenAnswers] = useState(() => loadQuizOpenAnswers(result.data));
  const [quizSubmitted, setQuizSubmitted] = useState(!!result.data.quizCompleted);
  const [score, setScore] = useState((result.data.quizScore as number) || 0);

  const subtitle = isPrimary
    ? actT(`shared.postQuizSubtitlePrimary.${activityId}`)
    : actT(`shared.postQuizSubtitleHighSchool.${activityId}`);

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionIndex.toString()]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (
      Object.keys(quizAnswers).length < quizQuestions.length ||
      !allQuizOpenAnswersFilled(openAnswers)
    ) {
      Alert.alert(actT('shared.quizIncomplete'), actT('shared.quizIncompleteReflection'));
      return;
    }

    let correct = 0;
    quizQuestions.forEach((q, index) => {
      if (quizAnswers[index.toString()] === q.answerIndex) correct += 1;
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

  const handleContinue = async () => {
    await showInterstitialAd();
    onComplete();
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
    <View style={[styles.container, localStyles.container]}>
      <Card style={styles.card}>
        <Text style={styles.title}>{actT('shared.postQuizTitle')}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {quizQuestions.map((q, questionIndex) => (
          <View key={questionIndex} style={[styles.questionBlock, localStyles.questionBlock]}>
            <Text style={styles.question}>
              {questionIndex + 1}. {q.question}
            </Text>
            {q.options.map((opt, optionIndex) => {
              const isSelected = quizAnswers[questionIndex.toString()] === optionIndex;
              const isCorrect = optionIndex === q.answerIndex;
              const state = getOptionState(quizSubmitted, isSelected, isCorrect);

              return (
                <McqOption
                  key={optionIndex}
                  label={opt}
                  state={state}
                  onPress={() => handleOptionSelect(questionIndex, optionIndex)}
                  disabled={quizSubmitted}
                />
              );
            })}
          </View>
        ))}

        <QuizOpenSection
          questions={Array.isArray(openQuestions) ? openQuestions : []}
          answers={openAnswers}
          onChange={(index, value) => {
            const next = [...openAnswers];
            next[index] = value;
            setOpenAnswers(next);
          }}
          disabled={quizSubmitted}
          heading={actT('shared.reflectionHeading')}
          startNumber={quizQuestions.length + 1}
        />

        {!quizSubmitted ? (
          <Button title={actT('shared.submitQuiz')} onPress={handleSubmitQuiz} size="lg" fullWidth />
        ) : (
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>
              {actT('shared.quizScore', { score, total: quizQuestions.length })}
            </Text>
            <Button
              title={actT('shared.continueDiscussion')}
              onPress={handleContinue}
              size="lg"
              fullWidth
              style={{ marginTop: Spacing.md }}
            />
            <Button
              title={actT('shared.retakeQuiz')}
              onPress={handleRetake}
              variant="outlined"
              fullWidth
              style={{ marginTop: Spacing.sm }}
            />
          </View>
        )}
      </Card>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xxxl,
  },
  questionBlock: {
    marginBottom: Spacing.lg,
  },
});
