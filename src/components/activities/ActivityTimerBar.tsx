import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme';

type Props = {
  durationMinutes: number;
  timeLeft: number;
  isTimerRunning: boolean;
  isLocked: boolean;
  timerTitle: string;
  showControls: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
};

export function ActivityTimerBar({
  durationMinutes,
  timeLeft,
  isTimerRunning,
  isLocked,
  timerTitle,
  showControls,
  onPause,
  onResume,
  onReset,
}: Props) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: { marginBottom: Spacing.lg },
        hint: {
          ...typography.bodySmall,
          color: colors.textSecondary,
          marginBottom: Spacing.sm,
          lineHeight: 20,
        },
        stickyTimer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          padding: Spacing.md,
          borderRadius: BorderRadius.md,
          borderWidth: 1,
          borderColor: colors.border,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        timerTitle: {
          ...typography.caption,
          fontWeight: '700',
          color: colors.textSecondary,
          marginBottom: 2,
        },
        timerDisplay: {
          fontSize: 24,
          fontWeight: '700',
          color: colors.primary,
          fontVariant: ['tabular-nums'],
        },
        timerButtons: { flexDirection: 'row', gap: Spacing.sm },
      }),
    [colors, typography]
  );

  const handlePausePress = () => {
    Alert.alert(t('activities.pauseTimerTitle'), t('activities.pauseTimerMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('activities.timerPause'), onPress: onPause },
    ]);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.hint}>
        {t('activities.timerBudgetHint', {
          minutes: durationMinutes,
          defaultValue:
            'You have {{minutes}} minutes to finish this activity. The timer starts when you tap Next on the Setup tab.',
        })}
      </Text>
      <View style={styles.stickyTimer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.timerTitle}>{timerTitle}</Text>
          <Text 
            style={[styles.timerDisplay, timeLeft <= 300 && { color: colors.danger }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatTime(timeLeft)}
          </Text>
        </View>
        {showControls && (
          <View style={styles.timerButtons}>
            {isTimerRunning ? (
              <Button
                title={t('activities.timerPause', { defaultValue: 'Pause' })}
                onPress={handlePausePress}
                variant="outlined"
                size="sm"
                disabled={isLocked && timeLeft === 0}
              />
            ) : (
              timeLeft > 0 &&
              !isLocked && (
                <Button
                  title={t('activities.timerResume', { defaultValue: 'Resume' })}
                  onPress={onResume}
                  variant="primary"
                  size="sm"
                />
              )
            )}
            <Button
              title={t('common.reset', { defaultValue: 'Reset' })}
              onPress={onReset}
              variant="outlined"
              size="sm"
            />
          </View>
        )}
      </View>
    </View>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
