import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows, Typography } from '../../theme';

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
  return (
    <View style={styles.container}>
      {segments.map((segment) => {
        const active = segment.id === selectedId;
        return (
          <TouchableOpacity
            key={segment.id}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onSelect(segment.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{segment.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  label: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.primary,
  },
});
