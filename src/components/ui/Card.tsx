import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadows, Spacing } from '../../theme';
import { PressableScale } from './PressableScale';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  fill?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function Card({
  children,
  style,
  variant = 'default',
  fill = false,
  onPress,
  disabled,
}: CardProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          backgroundColor: colors.surface,
          borderRadius: BorderRadius.lg,
          padding: Spacing.lg,
        },
        fill: { flex: 1 },
        pressableFill: { flex: 1 },
        default: { ...Shadows.md },
        elevated: { ...Shadows.lg },
        outlined: { borderWidth: 1, borderColor: colors.border },
      }),
    [colors]
  );

  const cardStyle = [styles.base, styles[variant], fill && styles.fill, style];
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
