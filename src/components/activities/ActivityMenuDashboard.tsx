import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing } from '../../theme';

interface ActivityMenuDashboardProps {
  quizCompleted?: boolean;
  pastResultsVariant?: 'singular' | 'plural';
  onPastResults: () => void;
  onQuiz: () => void;
  onDiscussions: () => void;
  onNewExperiment: () => void;
  hasDraft?: boolean;
  onContinueDraft?: () => void;
}

export function ActivityMenuDashboard({
  quizCompleted,
  pastResultsVariant = 'plural',
  onPastResults,
  onQuiz,
  onDiscussions,
  onNewExperiment,
  hasDraft,
  onContinueDraft,
}: ActivityMenuDashboardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors: c, typography }) => ({
    menuContainer: {
      padding: Spacing.md,
      backgroundColor: c.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    menuTitle: { ...typography.h3, marginBottom: Spacing.lg, color: c.text, textAlign: 'center' as const },
    menuBtn: { marginBottom: Spacing.md },
  }));

  const pastTitle =
    pastResultsVariant === 'singular'
      ? t('activities.menu.viewPastResult')
      : t('activities.menu.viewPastResults');

  return (
    <View style={styles.menuContainer}>
      <Text style={styles.menuTitle}>{t('activities.menu.title')}</Text>
      <Button
        title={pastTitle}
        onPress={onPastResults}
        style={styles.menuBtn}
        icon={<Ionicons name="time" size={18} color={colors.white} />}
      />
      <Button
        title={quizCompleted ? t('activities.menu.viewQuiz') : t('activities.menu.doQuiz')}
        onPress={onQuiz}
        style={styles.menuBtn}
        icon={<Ionicons name="school" size={18} color={colors.white} />}
      />
      <Button
        title={t('activities.menu.discussions')}
        onPress={onDiscussions}
        style={styles.menuBtn}
        icon={<Ionicons name="chatbubbles" size={18} color={colors.white} />}
      />
      <Button
        title={t('activities.menu.doAnotherExperiment')}
        onPress={onNewExperiment}
        style={styles.menuBtn}
        icon={<Ionicons name="flask" size={18} color={hasDraft ? colors.primary : colors.white} />}
        variant={hasDraft ? "outlined" : "primary"}
      />
      {hasDraft && onContinueDraft && (
        <Button
          title={t('activities.menu.continueExperiment', { defaultValue: 'Continue Experiment' })}
          onPress={onContinueDraft}
          style={styles.menuBtn}
          icon={<Ionicons name="play" size={18} color={colors.white} />}
          variant="primary"
        />
      )}
    </View>
  );
}
