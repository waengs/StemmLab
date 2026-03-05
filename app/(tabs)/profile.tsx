import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Input, Button, Avatar } from '../../src/components';
import { hasProfanity } from '../../src/utils/profanity';
import { useTheme, useAuthStore } from '../../src/stores';
import { useRequireAuth } from '../../src/stores';
import { Spacing, BorderRadius } from '../../src/theme';

export default function Profile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { user, team } = useRequireAuth();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setDisplayName(user.displayName);
  }, [user]);

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    content: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xl },
    backText: { ...typography.body, color: colors.primary, fontWeight: '600' },
    header: { alignItems: 'center', marginBottom: Spacing.xxl },
    name: { ...typography.h1, marginTop: Spacing.lg, textAlign: 'center' },
    email: { ...typography.bodySmall, marginTop: Spacing.xs },
    successBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: colors.secondary + '15',
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
    },
    successText: { ...typography.body, color: colors.secondary, fontWeight: '600' },
    sectionCard: { marginBottom: Spacing.lg },
    sectionTitle: { ...typography.h3, marginBottom: Spacing.lg },
    teamMeta: { ...typography.body, marginBottom: Spacing.xs },
    teamId: { ...typography.caption, color: colors.textMuted },
  });

  const handleSave = async () => {
    if (!user || !displayName.trim()) {
      Alert.alert(t('setup.missingFields'), t('setup.missingDisplayName'));
      return;
    }
    if (hasProfanity(displayName) || (newPassword && hasProfanity(newPassword))) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }
    await updateUser({
      displayName: displayName.trim(),
      newPassword: newPassword || undefined,
    });
    setNewPassword('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user || !team) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backText}>{t('profile.back')}</Text>
          </Pressable>

          <View style={styles.header}>
            <Avatar name={user.displayName} size={88} />
            <Text style={styles.name}>{user.displayName}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>

          {saved && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color={colors.secondary} />
              <Text style={styles.successText}>{t('settings.success')}</Text>
            </View>
          )}

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('profile.myAccount')}</Text>
            <Input
              label={t('setup.displayName')}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('setup.displayNamePlaceholder')}
            />
            <Input
              label={t('profile.newPassword')}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('profile.newPasswordPlaceholder')}
              secureTextEntry
            />
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('profile.myTeam')}</Text>
            <Text style={styles.teamMeta}>{team.name}</Text>
            <Text style={styles.teamId}>
              {t('dashboard.teamId', { id: team.discriminator })} • {team.gradeLevel}
            </Text>
          </Card>

          <Button
            title={t('settings.saveChanges')}
            onPress={handleSave}
            fullWidth
            size="lg"
            icon={<Ionicons name="save" size={18} color={colors.white} />}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
