import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors, Typography } from '../theme';

type ThemeSlice = { colors: ThemeColors; typography: Typography };

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: ThemeSlice) => T
): T {
  const { colors, typography } = useTheme();
  return useMemo(() => StyleSheet.create(factory({ colors, typography })), [colors, typography, factory]);
}
