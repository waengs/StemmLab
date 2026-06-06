import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { GradientBox } from '../ui/GradientBox';
import { Spacing, BorderRadius } from '../../theme';
import { SettingsButton } from './SettingsButton';

interface PageTitleProps {
  children: string;
  showSettings?: boolean;
}

export function PageTitle({ children, showSettings = false }: PageTitleProps) {
  const { typography, colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: Spacing.xxl,
          gap: Spacing.sm,
        },
        titleBlock: { flex: 1 },
        title: { marginBottom: Spacing.sm },
        accentBar: {
          height: 4,
          width: 56,
          borderRadius: BorderRadius.full,
          overflow: 'hidden',
        },
      }),
    []
  );

  return (
    <View style={styles.row}>
      <View style={styles.titleBlock}>
        <Text style={[typography.h1, styles.title]}>{children}</Text>
        {!isDark ? (
          <GradientBox colors={colors.gradientPrimary} style={styles.accentBar} />
        ) : (
          <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
        )}
      </View>
      {showSettings && <SettingsButton />}
    </View>
  );
}
