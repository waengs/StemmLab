import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SectionHeaderProps {
  title: string;
  icon?: IoniconsName;
  iconColor?: string;
}

export function SectionHeader({ title, icon, iconColor = Colors.primary }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      {icon && <Ionicons name={icon} size={22} color={iconColor} />}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
  },
});
