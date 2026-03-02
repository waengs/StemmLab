import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface IconBadgeProps {
  name: IoniconsName;
  color: string;
  size?: number;
}

export function IconBadge({ name, color, size = 24 }: IconBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
