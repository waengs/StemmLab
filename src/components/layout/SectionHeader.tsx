import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconBadge } from '../ui/IconBadge';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';

type IoniconsName = React.ComponentProps<typeof import('@expo/vector-icons').Ionicons>['name'];

interface SectionHeaderProps {
  title: string;
  icon?: IoniconsName;
  iconColor?: string;
  compact?: boolean;
}

export function SectionHeader({ title, icon, iconColor, compact }: SectionHeaderProps) {
  const { colors, typography } = useTheme();
  const accent = iconColor ?? colors.primary;

  return (
    <View style={[styles.row, compact && styles.compact]}>
      {icon ? <IconBadge name={icon} color={accent} size={compact ? 20 : 22} /> : null}
      <Text style={[compact ? typography.h3 : typography.h2, styles.title]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  compact: {
    marginBottom: 0,
  },
  title: {
    flex: 1,
  },
});
