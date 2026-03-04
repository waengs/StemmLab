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
import { Card, Input, Button, Select, Avatar } from '../../src/components';
import { hasProfanity } from '../../src/utils/profanity';
import { useTheme, useAuthStore } from '../../src/stores';
import { useAuthRedirect } from '../../src/hooks/useAuthRedirect';
import { Spacing, BorderRadius } from '../../src/theme';

export default function Profile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { team } = useAuthRedirect();
  const updateTeam = useAuthStore((s) => s.updateTeam);
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [gradeLevel, setGradeLevel] = useState('');
  const [saved, setSaved] = useState(false);

  const gradeLevels = [t('setup.gradeUpperPrimary'), t('setup.gradeLowerHigh')];

  useEffect(() => {
    if (!team) return;
    setTeamName(team.name);
    setPassword(team.password);
    setMembers(team.members);
    setGradeLevel(team.gradeLevel);
  }, [team]);

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    content: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.xl,
    },
    backText: { ...typography.body, color: colors.primary, fontWeight: '600' },
    header: { alignItems: 'center', marginBottom: Spacing.xxl },
    teamName: { ...typography.h1, marginTop: Spacing.lg, textAlign: 'center' },
    teamMeta: { ...typography.bodySmall, marginTop: Spacing.xs },
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
    teamIdBox: {
      backgroundColor: colors.background,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginTop: Spacing.sm,
    },
    teamIdLabel: { ...typography.label, color: colors.textSecondary },
    teamIdHint: { ...typography.caption, marginTop: 2 },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.sm,
    },
  });

  const addMember = () => {
    if (members.length < 5) setMembers([...members, '']);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const handleSave = async () => {
    if (!team) return;

    const filteredMembers = members.filter((m) => m.trim() !== '');
    if (!teamName || !password || filteredMembers.length === 0 || !gradeLevel) {
      Alert.alert(t('setup.missingFields'), t('setup.missingFieldsMsg'));
      return;
    }

    if (hasProfanity(teamName) || hasProfanity(password) || filteredMembers.some(hasProfanity)) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

    const updatedTeam = {
      ...team,
      name: teamName,
      password,
      members: filteredMembers,
      gradeLevel,
    };

    await updateTeam(updatedTeam);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!team) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backText}>{t('profile.back')}</Text>
          </Pressable>

          <View style={styles.header}>
            <Avatar name={team.name} size={88} />
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamMeta}>
              {t('dashboard.teamId', { id: team.discriminator })} • {team.gradeLevel}
            </Text>
          </View>

          {saved && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color={colors.secondary} />
              <Text style={styles.successText}>{t('settings.success')}</Text>
            </View>
          )}

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('settings.teamInfo')}</Text>
            <Input label={t('setup.teamName')} value={teamName} onChangeText={setTeamName} placeholder={t('setup.teamNamePlaceholder')} />
            <Input label={t('setup.teamPassword')} value={password} onChangeText={setPassword} placeholder={t('setup.teamPasswordPlaceholder')} secureTextEntry />
            <Select label={t('setup.gradeLevel')} value={gradeLevel} options={gradeLevels} onValueChange={setGradeLevel} />
            <View style={styles.teamIdBox}>
              <Text style={styles.teamIdLabel}>{t('dashboard.teamId', { id: team.discriminator })}</Text>
              <Text style={styles.teamIdHint}>{t('settings.teamIdDesc')}</Text>
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('setup.teamMembers')}</Text>
            {members.map((member, index) => (
              <View key={index} style={styles.memberRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    value={member}
                    onChangeText={(v) => updateMember(index, v)}
                    placeholder={t('setup.memberPlaceholder', { count: index + 1 })}
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>
                {members.length > 1 && (
                  <Button
                    title=""
                    onPress={() => removeMember(index)}
                    variant="ghost"
                    icon={<Ionicons name="trash-outline" size={18} color={colors.danger} />}
                  />
                )}
              </View>
            ))}
            {members.length < 5 ? (
              <Button
                title={t('setup.addMember')}
                onPress={addMember}
                variant="outlined"
                fullWidth
                icon={<Ionicons name="add" size={18} color={colors.primary} />}
                style={{ marginTop: Spacing.sm }}
              />
            ) : (
              <Text style={{ ...typography.caption, textAlign: 'center', marginTop: Spacing.sm }}>
                {t('setup.maxMembers')}
              </Text>
            )}
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
