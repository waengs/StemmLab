import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme';

interface ChipProps {
  label: string;
  variant?: 'filled' | 'outlined';
  color?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  onPress?: () => void;
}

export function Chip({
  label,
  variant = 'outlined',
  color,
  size = 'sm',
  style,
  onPress,
}: ChipProps) {
  const { colors, isDark } = useTheme();
  const chipColor = color ?? colors.primary;
  const isFilled = variant === 'filled';

  const content = (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        {
          backgroundColor: isFilled ? chipColor : isDark ? chipColor + '18' : chipColor + '14',
          borderColor: chipColor,
          borderWidth: isFilled ? 0 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: isFilled ? colors.white : chipColor },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
      hitSlop={6}
    >
      {content}
    </Pressable>
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
