import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme';

export type McqOptionState = 'default' | 'selected' | 'correct' | 'incorrect';

type Props = {
  label: string;
  state: McqOptionState;
  onPress: () => void;
  disabled?: boolean;
};

export function McqOption({ label, state, onPress, disabled }: Props) {
  const { colors, typography, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          width: '100%',
          minHeight: 48,
          borderRadius: BorderRadius.md,
          borderWidth: 1.5,
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          marginBottom: Spacing.sm,
          justifyContent: 'center',
        },
        default: {
          backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
          borderColor: isDark ? colors.border : colors.border,
        },
        selected: {
          backgroundColor: colors.primary,
          borderColor: colors.primaryDark,
        },
        correct: {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
        },
        incorrect: {
          backgroundColor: colors.danger,
          borderColor: colors.danger,
        },
        label: {
          ...typography.body,
          fontWeight: '600',
          lineHeight: 22,
        },
        labelDefault: { color: colors.text },
        labelOnColor: { color: colors.white },
        disabled: { opacity: 0.85 },
      }),
    [colors, isDark, typography]
  );

  const stateStyle =
    state === 'selected'
      ? styles.selected
      : state === 'correct'
        ? styles.correct
        : state === 'incorrect'
          ? styles.incorrect
          : styles.default;

  const labelStyle =
    state === 'default' ? styles.labelDefault : styles.labelOnColor;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: state !== 'default', disabled: !!disabled }}
      android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
      style={[styles.base, stateStyle, disabled && styles.disabled]}
    >
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </Pressable>
  );
}
