import React, { useMemo } from 'react';
import { View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Shadows } from '../../theme';

interface Segment {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function SegmentedControl({ segments, selectedId, onSelect }: SegmentedControlProps) {
  const { colors, typography, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          backgroundColor: isDark ? colors.surfaceElevated : colors.primary + '12',
          borderRadius: BorderRadius.md,
          padding: 4,
          borderWidth: 1,
          borderColor: isDark ? colors.primary + '35' : colors.primaryLight + '55',
        },
        segment: {
          flex: 1,
          paddingVertical: Spacing.sm,
          alignItems: 'center',
          borderRadius: BorderRadius.sm,
        },
        segmentActive: {
          backgroundColor: isDark ? colors.primary + '25' : colors.white,
          ...Shadows.sm,
        },
        label: { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
        labelActive: { color: isDark ? colors.primaryLight : colors.primary },
      }),
    [colors, isDark, typography]
  );

  return (
    <View style={styles.container}>
      {segments.map((segment) => {
        const active = segment.id === selectedId;
        return (
          <Pressable
            key={segment.id}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onSelect(segment.id)}
            android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{segment.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
