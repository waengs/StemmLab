import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, createTypography, type ThemeColors, type Typography } from '../theme';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'stem_app_theme';

type ThemeContextValue = {
  colors: ThemeColors;
  typography: Typography;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isReady: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          setModeState(stored);
        }
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const colors = mode === 'dark' ? darkColors : lightColors;
  const typography = useMemo(() => createTypography(colors), [colors]);

  const value = useMemo(
    () => ({
      colors,
      typography,
      isDark: mode === 'dark',
      mode,
      setMode,
      isReady,
    }),
    [colors, typography, mode, setMode, isReady]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
