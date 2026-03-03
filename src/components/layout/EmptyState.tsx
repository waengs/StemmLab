import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon?: IoniconsName;
  title?: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const { colors, typography } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          alignItems: 'center',
          paddingVertical: Spacing.xxxl,
          gap: Spacing.sm,
        },
        title: { ...typography.h3, color: colors.textMuted },
        message: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
        messageOnly: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
      }),
    [colors, typography]
  );

  return (
    <Card style={styles.card}>
      {icon && <Ionicons name={icon} size={48} color={colors.textMuted} />}
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={[styles.message, !title && styles.messageOnly]}>{message}</Text>
    </Card>
  );
}
