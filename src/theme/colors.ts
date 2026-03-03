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
  engineering: string;
  health: string;
  gold: string;
  silver: string;
  bronze: string;
  gradientPrimary: readonly [string, string];
  gradientSuccess: readonly [string, string];
  gradientAccent: readonly [string, string];
  gradientCool: readonly [string, string];
  gradientSetup: readonly [string, string, string];
  tabBar: string;
  tabBarBorder: string;
};

export const lightColors: ThemeColors = {
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  secondary: '#10B981',
  secondaryLight: '#34D399',
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  danger: '#EF4444',
  dangerLight: '#FCA5A5',
  white: '#FFFFFF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#F1F5F9',
  engineering: '#3B82F6',
  health: '#10B981',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  gradientPrimary: ['#4F46E5', '#7C3AED'],
  gradientSuccess: ['#10B981', '#059669'],
  gradientAccent: ['#F59E0B', '#EF4444'],
  gradientCool: ['#667EEA', '#764BA2'],
  gradientSetup: ['#4F46E5', '#818CF8', '#C084FC'],
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
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
  engineering: '#60A5FA',
  health: '#34D399',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  gradientPrimary: ['#6366F1', '#8B5CF6'],
  gradientSuccess: ['#10B981', '#059669'],
  gradientAccent: ['#F59E0B', '#EF4444'],
  gradientCool: ['#667EEA', '#764BA2'],
  gradientSetup: ['#4F46E5', '#6366F1', '#8B5CF6'],
  tabBar: '#1E293B',
  tabBarBorder: '#334155',
};
