import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface IconBadgeProps {
  name: IoniconsName;
  color: string;
  size?: number;
}

export function IconBadge({ name, color, size = 24 }: IconBadgeProps) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color + (isDark ? '22' : '20'),
          borderWidth: isDark ? 0 : 1,
          borderColor: color + '44',
        },
      ]}
    >
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
