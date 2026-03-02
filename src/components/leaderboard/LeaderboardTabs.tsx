import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

interface TabItem {
  key: string;
  label: string;
}

interface LeaderboardTabsProps {
  tabs: TabItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function LeaderboardTabs({ tabs, selectedIndex, onSelect }: LeaderboardTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bar}
      contentContainerStyle={styles.content}
    >
      {tabs.map((tab, idx) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, idx === selectedIndex && styles.tabActive]}
          onPress={() => onSelect(idx)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, idx === selectedIndex && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: {
    marginBottom: Spacing.xl,
    marginHorizontal: -Spacing.xl,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
});
