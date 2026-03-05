import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from '../ui/Avatar';
import { Spacing, BorderRadius, lightColors } from '../../theme';
import type { TeamMemberSummary } from '../../types';

interface TeamMembersListProps {
  title: string;
  members: TeamMemberSummary[];
  loading?: boolean;
  emptyText: string;
  loadingText: string;
}

export function TeamMembersList({
  title,
  members,
  loading,
  emptyText,
  loadingText,
}: TeamMembersListProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {loading ? (
        <Text style={styles.meta}>{loadingText}</Text>
      ) : members.length === 0 ? (
        <Text style={styles.meta}>{emptyText}</Text>
      ) : (
        <View style={styles.list}>
          {members.map((m) => (
            <View key={m.uid} style={styles.row}>
              <Avatar name={m.displayName} size={32} />
              <Text style={styles.name}>{m.displayName}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: lightColors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: lightColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  meta: { fontSize: 14, color: lightColors.textMuted },
  list: { gap: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: { fontSize: 15, color: lightColors.text, flex: 1 },
});
