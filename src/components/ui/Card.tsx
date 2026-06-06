import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadows, Spacing } from '../../theme';
import { PressableScale } from './PressableScale';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  /** Adds a colored left stripe and soft tint in light mode. */
  accentColor?: string;
  fill?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function Card({
  children,
  style,
  variant = 'default',
  accentColor,
  fill = false,
  onPress,
  disabled,
}: CardProps) {
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          backgroundColor: colors.surface,
          borderRadius: BorderRadius.lg,
          padding: Spacing.lg,
          overflow: 'hidden',
        },
        fill: { flex: 1 },
        pressableFill: { flex: 1 },
        default: { ...Shadows.md },
        elevated: { ...Shadows.lg },
        accent: accentColor
          ? {
              borderLeftWidth: 4,
              borderLeftColor: accentColor,
              backgroundColor: isDark ? accentColor + '14' : accentColor + '10',
            }
          : undefined,
        outlined: {
          borderWidth: 1,
          borderColor: accentColor
            ? isDark
              ? accentColor + '55'
              : accentColor + '44'
            : colors.border,
        },
      }),
    [accentColor, colors, isDark]
  );

  const cardStyle = [
    styles.base,
    styles[variant],
    accentColor ? styles.accent : undefined,
    fill && styles.fill,
    style,
  ];
  const content = <View style={cardStyle}>{children}</View>;

  if (onPress) {
    return (
      <PressableScale onPress={onPress} disabled={disabled} style={fill ? styles.pressableFill : undefined}>
        {content}
      </PressableScale>
    );
  }

  return content;
}
