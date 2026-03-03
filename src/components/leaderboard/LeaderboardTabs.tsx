import React, { useMemo } from 'react';
import { ScrollView, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius } from '../../theme';

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
  const { colors, typography } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bar: { marginBottom: Spacing.xl, marginHorizontal: -Spacing.xl },
        content: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
        tab: {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          borderRadius: BorderRadius.full,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
        tabText: { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
        tabTextActive: { color: colors.white },
      }),
    [colors, typography]
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bar} contentContainerStyle={styles.content}>
      {tabs.map((tab, idx) => (
        <Pressable
          key={tab.key}
          style={[styles.tab, idx === selectedIndex && styles.tabActive]}
          onPress={() => onSelect(idx)}
          android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
        >
          <Text style={[styles.tabText, idx === selectedIndex && styles.tabTextActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
