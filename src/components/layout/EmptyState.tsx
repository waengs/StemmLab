import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Colors, Spacing, Typography } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon?: IoniconsName;
  title?: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <Card style={styles.card}>
      {icon && <Ionicons name={icon} size={48} color={Colors.textMuted} />}
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={[styles.message, !title && styles.messageOnly]}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    color: Colors.textMuted,
  },
  message: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  messageOnly: {
    ...Typography.body,
  },
});
