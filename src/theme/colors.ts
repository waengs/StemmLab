export type ThemeColors = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  accentLight: string;
  danger: string;
  dangerLight: string;
  white: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  textOnDark: string;
  /** Activity category + STEMM palette */
  science: string;
  technology: string;
  engineering: string;
  health: string;
  maths: string;
  medicine: string;
  gold: string;
  silver: string;
  bronze: string;
  gradientPrimary: readonly string[];
  gradientSuccess: readonly string[];
  gradientAccent: readonly string[];
  gradientCool: readonly string[];
  gradientSetup: readonly string[];
  gradientBackground: readonly string[];
  tabBar: string;
  tabBarBorder: string;
};

export const lightColors: ThemeColors = {
  primary: '#6366F1',
  primaryLight: '#A5B4FC',
  primaryDark: '#4338CA',
  secondary: '#10B981',
  secondaryLight: '#34D399',
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  danger: '#EF4444',
  dangerLight: '#FCA5A5',
  white: '#FFFFFF',
  background: '#EEF2FF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#C7D2FE',
  borderLight: '#E0E7FF',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#F1F5F9',
  science: '#3B82F6',
  technology: '#10B981',
  engineering: '#3B82F6',
  health: '#10B981',
  maths: '#8B5CF6',
  medicine: '#EC4899',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  gradientPrimary: ['#6366F1', '#8B5CF6'],
  gradientSuccess: ['#10B981', '#059669'],
  gradientAccent: ['#F59E0B', '#F97316'],
  gradientCool: ['#6366F1', '#A855F7', '#EC4899'],
  gradientSetup: ['#6366F1', '#818CF8', '#C084FC'],
  gradientBackground: ['#EEF2FF', '#F5F3FF', '#FFF7ED'],
  tabBar: '#FAFBFF',
  tabBarBorder: '#C7D2FE',
};

export const darkColors: ThemeColors = {
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  secondary: '#34D399',
  secondaryLight: '#6EE7B7',
  accent: '#FBBF24',
  accentLight: '#FCD34D',
  danger: '#F87171',
  dangerLight: '#FCA5A5',
  white: '#FFFFFF',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  border: '#334155',
  borderLight: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#F1F5F9',
  science: '#60A5FA',
  technology: '#34D399',
  engineering: '#60A5FA',
  health: '#34D399',
  maths: '#A78BFA',
  medicine: '#F472B6',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  gradientPrimary: ['#6366F1', '#8B5CF6'],
  gradientSuccess: ['#10B981', '#059669'],
  gradientAccent: ['#F59E0B', '#EF4444'],
  gradientCool: ['#4338CA', '#6366F1', '#7C3AED'],
  gradientSetup: ['#312E81', '#4338CA', '#6366F1'],
  gradientBackground: ['#0F172A', '#1E1B4B', '#0F172A'],
  tabBar: '#1E293B',
  tabBarBorder: '#475569',
};
