import React, { useEffect, useState } from 'react';
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
import { TeamMembersList } from '../../src/components/team/TeamMembersList';
import { useTheme, useAuthStore, type ThemeMode } from '../../src/stores';
import { useRequireAuth } from '../../src/stores';
import { fetchTeamMembers } from '../../src/utils/storage';
import { Spacing } from '../../src/theme';
import type { TeamMemberSummary } from '../../src/types';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, typography, mode, setMode } = useTheme();
  const { user, team } = useRequireAuth();
  const signOut = useAuthStore((s) => s.signOut);
  const leaveTeam = useAuthStore((s) => s.leaveTeam);
  const [members, setMembers] = useState<TeamMemberSummary[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    content: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
    sectionCard: { marginBottom: Spacing.lg },
    sectionTitle: { ...typography.h3, marginBottom: Spacing.lg },
    teamName: { ...typography.body, fontWeight: '600', marginBottom: Spacing.xs },
    teamMeta: { ...typography.bodySmall, color: colors.textMuted, marginBottom: Spacing.md },
    actions: { gap: Spacing.md, marginTop: Spacing.sm },
  });

  useEffect(() => {
    if (!team) return;
    let cancelled = false;
    setLoadingMembers(true);
    void fetchTeamMembers(team.discriminator).then((list) => {
      if (!cancelled) {
        setMembers(list);
        setLoadingMembers(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [team?.discriminator]);

  const handleLeaveTeam = () => {
    const run = () => void leaveTeam();

    if (Platform.OS === 'web') {
      if (window.confirm(t('settings.leaveTeamConfirm'))) {
        run();
      }
    } else {
      Alert.alert(t('settings.leaveTeam'), t('settings.leaveTeamConfirm'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.leaveTeam'), style: 'destructive', onPress: run },
      ]);
    }
  };

  const handleLogout = () => {
    const runSignOut = () => void signOut();

    if (Platform.OS === 'web') {
      if (window.confirm(t('settings.logoutConfirm'))) {
        runSignOut();
      }
    } else {
      Alert.alert(t('settings.logout'), t('settings.logoutConfirm'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.logout'), style: 'destructive', onPress: runSignOut },
      ]);
    }
  };

  if (!user || !team) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
          <PageTitle>{t('settings.pageTitle')}</PageTitle>

          <SettingsLinkRow
            avatarName={user.displayName}
            title={t('profile.title')}
            subtitle={user.displayName}
            onPress={() => router.push('/(tabs)/profile')}
          />

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('settings.teamSection')}</Text>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamMeta}>
              {t('dashboard.teamId', { id: team.discriminator })} • {team.gradeLevel}
            </Text>
            <TeamMembersList
              title={t('setup.teamMembers')}
              members={members}
              loading={loadingMembers}
              emptyText={t('setup.noMembersYet')}
              loadingText={t('setup.loadingMembers')}
            />
            <Button
              title={t('settings.changeTeam')}
              onPress={handleLeaveTeam}
              variant="outlined"
              fullWidth
              icon={<Ionicons name="swap-horizontal-outline" size={18} color={colors.primary} />}
            />
          </Card>

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
