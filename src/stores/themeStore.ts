import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, createTypography, type ThemeColors, type Typography } from '../theme';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'stem_app_theme';

interface ThemeState {
  mode: ThemeMode;
  isReady: boolean;
  colors: ThemeColors;
  typography: Typography;
  isDark: boolean;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
}

function buildThemeSlice(mode: ThemeMode) {
  const colors = mode === 'dark' ? darkColors : lightColors;
  return {
    mode,
    colors,
    typography: createTypography(colors),
    isDark: mode === 'dark',
  };
}

export const useThemeStore = create<ThemeState>((set) => ({
  ...buildThemeSlice('light'),
  isReady: false,

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        set({ ...buildThemeSlice(stored), isReady: true });
        return;
      }
    } catch {
      // fall through to default
    }
    set({ isReady: true });
  },

  setMode: async (next) => {
    set(buildThemeSlice(next));
    await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  },
}));

/** Stable hook API used across components (same shape as the old ThemeContext). */
export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const colors = useThemeStore((s) => s.colors);
  const typography = useThemeStore((s) => s.typography);
  const isDark = useThemeStore((s) => s.isDark);
  const isReady = useThemeStore((s) => s.isReady);
  const setMode = useThemeStore((s) => s.setMode);
  return { mode, colors, typography, isDark, isReady, setMode };
}
