import React from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import { ActivityMcqPostQuiz } from './ActivityMcqPostQuiz';
import { ActivityDiscussionCard } from './ActivityDiscussionCard';
import type { ActivityResult } from '../../types';

interface Props {
  result: ActivityResult;
  onComplete: () => void;
}

function useEarthquakePostStyles() {
  return useThemedStyles(({ colors, typography }) => ({
    container: { marginTop: Spacing.xl },
    card: {
      padding: Spacing.lg,
      marginTop: Spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: { ...typography.h2, color: colors.primary, marginBottom: Spacing.xs },
    subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: Spacing.xl },
    questionBlock: { marginBottom: Spacing.xl },
    question: { ...typography.body, fontWeight: '600', marginBottom: Spacing.md, color: colors.text },
    optionBtn: {
      marginBottom: Spacing.sm,
      justifyContent: 'flex-start',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    scoreBox: {
      backgroundColor: colors.secondary + '20',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.secondary,
    },
    scoreText: { ...typography.h3, color: colors.secondary },
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
    tableBlock: { marginTop: Spacing.xl, marginBottom: Spacing.md },
    tableHeading: { ...typography.h3, color: colors.text, marginBottom: Spacing.sm },
    tableRowHeader: {
      flexDirection: 'row',
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
      paddingBottom: Spacing.xs,
      marginBottom: Spacing.xs,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      paddingVertical: Spacing.sm,
    },
    tableCell: { ...typography.bodySmall, color: colors.textSecondary },
  }));
}

export function EarthquakePostActivity({ result, onComplete }: Props) {
  const styles = useEarthquakePostStyles();
  return (
    <ActivityMcqPostQuiz
      activityId="earthquake"
      result={result}
      onComplete={onComplete}
      styles={{
        container: styles.container,
        card: styles.card,
        title: styles.title,
        subtitle: styles.subtitle,
        questionBlock: styles.questionBlock,
        question: styles.question,
        optionBtn: styles.optionBtn,
        scoreBox: styles.scoreBox,
        scoreText: styles.scoreText,
      }}
    />
  );
}

export function EarthquakeDiscussion() {
  const styles = useEarthquakePostStyles();
  return (
    <View style={styles.container}>
      <ActivityDiscussionCard activityId="earthquake" styles={styles} showHighSchoolTables={false} />
    </View>
  );
}
