import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../theme';

interface ChipProps {
  label: string;
  variant?: 'filled' | 'outlined';
  color?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Chip({
  label,
  variant = 'outlined',
  color = Colors.primary,
  size = 'sm',
  style,
}: ChipProps) {
  const isFilled = variant === 'filled';

  return (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        {
          backgroundColor: isFilled ? color : 'transparent',
          borderColor: color,
          borderWidth: isFilled ? 0 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: isFilled ? Colors.white : color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  sm: { paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  md: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  text: { fontWeight: '600' },
  textSm: { fontSize: 11 },
  textMd: { fontSize: 13 },
});
