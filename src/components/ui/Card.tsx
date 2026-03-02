import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '../../theme';
import { PressableScale } from './PressableScale';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  /** Stretch to fill parent (e.g. grid cells). */
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
  const cardStyle = [styles.base, variants[variant], fill && styles.fill, style];

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

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  fill: {
    flex: 1,
  },
  pressableFill: {
    flex: 1,
  },
});

const variants: Record<string, ViewStyle> = {
  default: { ...Shadows.md },
  elevated: { ...Shadows.lg },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
};
