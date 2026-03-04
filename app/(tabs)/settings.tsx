import React from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, PageTitle, SegmentedControl } from '../../src/components';
import { SettingsLinkRow } from '../../src/components/settings/SettingsLinkRow';
import { useTheme, useAuthStore, type ThemeMode } from '../../src/stores';
import { Spacing } from '../../src/theme';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, typography, mode, setMode } = useTheme();
  const team = useAuthStore((s) => s.team);
  const signOut = useAuthStore((s) => s.signOut);

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    content: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
    sectionCard: { marginBottom: Spacing.lg },
    sectionTitle: { ...typography.h3, marginBottom: Spacing.lg },
    actions: { gap: Spacing.md, marginTop: Spacing.sm },
  });

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('settings.logoutConfirm'))) {
        signOut().then(() => router.replace('/'));
      }
    } else {
      Alert.alert(t('settings.logout'), t('settings.logoutConfirm'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]);
    }
  };

  if (!team) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
          <PageTitle>{t('settings.pageTitle')}</PageTitle>

          <SettingsLinkRow
            avatarName={team.name}
            title={t('profile.title')}
            subtitle={team.name}
            onPress={() => router.push('/(tabs)/profile')}
          />

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
            <SegmentedControl
              segments={[
                { id: 'light', label: t('settings.lightMode') },
                { id: 'dark', label: t('settings.darkMode') },
              ]}
              selectedId={mode}
              onSelect={(id) => setMode(id as ThemeMode)}
            />
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
            <SegmentedControl
              segments={[
                { id: 'en', label: t('settings.english') },
                { id: 'id', label: t('settings.indonesian') },
              ]}
              selectedId={i18n.language}
              onSelect={(id) => i18n.changeLanguage(id)}
            />
          </Card>

          <View style={styles.actions}>
            <Button
              title={t('settings.logout')}
              onPress={handleLogout}
              variant="danger"
              fullWidth
              size="lg"
              icon={<Ionicons name="log-out-outline" size={18} color={colors.white} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
