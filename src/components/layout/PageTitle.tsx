import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';
import { SettingsButton } from './SettingsButton';

interface PageTitleProps {
  children: string;
  showSettings?: boolean;
}

export function PageTitle({ children, showSettings = false }: PageTitleProps) {
  const { typography } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[typography.h1, styles.title]}>{children}</Text>
      {showSettings && <SettingsButton />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
  },
});
