import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

export function SettingsButton() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/settings')}
      style={styles.btn}
      accessibilityRole="button"
      accessibilityLabel={t('tabs.settings')}
      android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
    >
      <Ionicons name="settings-sharp" size={24} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 4,
    marginLeft: 8,
  },
});
