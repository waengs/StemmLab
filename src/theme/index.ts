import type { ThemeColors } from './colors';
import { lightColors } from './colors';

export { lightColors, darkColors } from './colors';
export type { ThemeColors } from './colors';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

export function createTypography(colors: ThemeColors) {
  return {
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      color: colors.text,
    },
    h2: {
      fontSize: 22,
      fontWeight: '700' as const,
      lineHeight: 30,
      color: colors.text,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 26,
      color: colors.text,
    },
    body: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
      color: colors.text,
    },
    bodySmall: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
      color: colors.textMuted,
    },
    label: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
      color: colors.text,
    },
    button: {
      fontSize: 15,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
  };
}

export type Typography = ReturnType<typeof createTypography>;

/** @deprecated Use useTheme().colors instead */
export { lightColors as Colors } from './colors';

/** Static light typography — prefer useTheme().typography for themed screens */
export const Typography = createTypography(lightColors);
