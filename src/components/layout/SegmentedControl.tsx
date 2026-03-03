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
  const { colors, typography } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          backgroundColor: colors.background,
          borderRadius: BorderRadius.md,
          padding: 4,
        },
        segment: {
          flex: 1,
          paddingVertical: Spacing.sm,
          alignItems: 'center',
          borderRadius: BorderRadius.sm,
        },
        segmentActive: {
          backgroundColor: colors.surface,
          ...Shadows.sm,
        },
        label: { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
        labelActive: { color: colors.primary },
      }),
    [colors, typography]
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
