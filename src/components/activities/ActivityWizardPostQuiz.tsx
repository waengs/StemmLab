import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spacing } from '../../theme';
import { useActivityResultsStore } from '../../stores';
import { useGradeBand } from '../../hooks/useGradeBand';
import {
  allQuizOpenAnswersFilled,
  getQuizOpenQuestions,
  loadQuizOpenAnswers,
  saveQuizOpenAnswers,
} from '../../utils/quizOpenQuestions';
import { actT, getActivityQuizWizard } from '../../utils/activityContent';
import { showInterstitialAd } from '../../services/ads/showInterstitialAd';
import { QuizOpenSection } from './QuizOpenSection';
import type { ActivityResult } from '../../types';
import type { ActivityQuizId } from '../../utils/quizOpenQuestions';

type WizardQuizStyles = {
  container: object;
  resultsCard?: object;
  resultsContent: object;
  progress: object;
  question: object;
  options: object;
  optionBtn: object;
  title: object;
  desc: object;
  scoreText: object;
  explanationBox: object;
  explanationTitle: object;
  explanationText: object;
  successBadge: object;
  successText: object;
};

interface ActivityWizardPostQuizProps {
  activityId: ActivityQuizId;
  result: ActivityResult;
  onComplete: () => void;
  styles: WizardQuizStyles;
}

export function ActivityWizardPostQuiz({
  activityId,
  result,
  onComplete,
  styles,
}: ActivityWizardPostQuizProps) {
  const { isPrimary, isHighSchool } = useGradeBand();
  const updateResult = useActivityResultsStore((s) => s.updateResult);
  const questions = getActivityQuizWizard(activityId, !isHighSchool);
  const openQuestions = getQuizOpenQuestions(activityId, isPrimary);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [openAnswers, setOpenAnswers] = useState(() => loadQuizOpenAnswers(result.data));

  const didYouKnowBody =
    activityId === 'sound-pollution'
      ? actT('shared.wizardDidYouKnowSound')
      : actT('shared.wizardDidYouKnowEarthquake');

  const handleAnswer = (index: number) => {
    if (index === questions[currentQuestion].correctIndex) {
      setScore((s) => s + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleFinish = async () => {
    if (!allQuizOpenAnswersFilled(openAnswers)) {
      Alert.alert(actT('shared.quizIncomplete'), actT('shared.quizIncompleteReflection'));
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
    await showInterstitialAd();
    onComplete();
  };

  const handleContinue = async () => {
    await showInterstitialAd();
    onComplete();
  };

  if (result.data.quizCompleted && !showResults) {
    return (
      <Card style={styles.container}>
        <View style={styles.successBadge}>
          <Text style={styles.successText}>✓</Text>
        </View>
        <Text style={styles.title}>{actT('shared.quizCompletedTitle')}</Text>
        <Text style={styles.desc}>
          {actT('shared.quizCompletedDesc', {
            score: result.data.quizScore,
            total: questions.length,
          })}
        </Text>
        <Button title={actT('shared.continueDiscussion')} onPress={handleContinue} size="lg" />
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card style={[styles.container, styles.resultsCard]}>
        <ScrollView contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{actT('shared.quizResultsTitle')}</Text>
          <Text style={styles.scoreText}>
            {actT('shared.quizScore', { score, total: questions.length })}
          </Text>
          <View style={styles.explanationBox}>
            <Text style={styles.explanationTitle}>{actT('shared.wizardDidYouKnowTitle')}</Text>
            <Text style={styles.explanationText}>{didYouKnowBody}</Text>
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
            title={actT('shared.continueDiscussion')}
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
      <Text style={styles.progress}>
        {actT('shared.questionProgress', {
          current: currentQuestion + 1,
          total: questions.length,
        })}
      </Text>
      <Text style={styles.question}>{q.question}</Text>
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
