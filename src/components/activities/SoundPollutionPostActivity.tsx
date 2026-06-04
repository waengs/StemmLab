import React from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import { ActivityWizardPostQuiz } from './ActivityWizardPostQuiz';
import { ActivityDiscussionCard } from './ActivityDiscussionCard';
import type { ActivityResult } from '../../types';

interface Props {
  result: ActivityResult;
  onComplete: () => void;
}

function usePostQuizStyles() {
  return useThemedStyles(({ colors, typography }) => ({
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
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: Spacing.sm,
    },
    question: {
      ...typography.h3,
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
      ...typography.h2,
      marginBottom: Spacing.md,
    },
    desc: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: Spacing.xl,
    },
    scoreText: {
      ...typography.h1,
      color: colors.primary,
      marginBottom: Spacing.xl,
    },
    explanationBox: {
      backgroundColor: colors.surface,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.xl,
      width: '100%',
    },
    explanationTitle: {
      ...typography.bodySmall,
      fontWeight: '700',
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    explanationText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    successBadge: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    successText: {
      fontSize: 32,
      color: colors.white,
      fontWeight: '700',
    },
    discussionCard: {
      padding: Spacing.lg,
      marginTop: Spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primaryLight + '50',
    },
    sectionTitle: { ...typography.h2, color: colors.primary, marginBottom: Spacing.xs },
    paragraph: { ...typography.body, color: colors.text, lineHeight: 24, marginBottom: Spacing.xl },
    subHeading: { ...typography.h3, color: colors.text, marginBottom: Spacing.sm },
    infoBox: {
      backgroundColor: colors.accentLight + '20',
      padding: Spacing.md,
      borderRadius: BorderRadius.sm,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
      marginTop: Spacing.md,
    },
    infoText: { ...typography.bodySmall, color: colors.text },
  }));
}

export function SoundPollutionPostActivity({ result, onComplete }: Props) {
  const styles = usePostQuizStyles();
  return (
    <ActivityWizardPostQuiz
      activityId="sound-pollution"
      result={result}
      onComplete={onComplete}
      styles={styles}
    />
  );
}

export function SoundPollutionDiscussion() {
  const styles = usePostQuizStyles();
  return (
    <View style={{ marginTop: Spacing.md }}>
      <ActivityDiscussionCard activityId="sound-pollution" styles={styles} showHighSchoolTables={false} />
    </View>
  );
}
