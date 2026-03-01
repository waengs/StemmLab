import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Select } from '../../src/components/Select';
import { getTeam, saveTeam, clearTeam } from '../../src/utils/storage';
import { hasProfanity } from '../../src/utils/profanity';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../src/theme';
import type { Team } from '../../src/types';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [gradeLevel, setGradeLevel] = useState('');
  const [saved, setSaved] = useState(false);

  const gradeLevels = [
    t('setup.gradeUpperPrimary'),
    t('setup.gradeLowerHigh'),
  ];

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const teamData = await getTeam();
        if (teamData) {
          setTeam(teamData);
          setTeamName(teamData.name);
          setPassword(teamData.password);
          setMembers(teamData.members);
          setGradeLevel(teamData.gradeLevel);
        }
      })();
    }, [])
  );

  const addMember = () => {
    if (members.length < 5) {
      setMembers([...members, '']);
    }
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

    const filteredMembers = members.filter(m => m.trim() !== '');
    if (!teamName || !password || filteredMembers.length === 0 || !gradeLevel) {
      Alert.alert(t('setup.missingFields'), t('setup.missingFieldsMsg'));
      return;
    }

    if (hasProfanity(teamName) || hasProfanity(password) || filteredMembers.some(hasProfanity)) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

    const updatedTeam: Team = {
      ...team,
      name: teamName,
      password,
      members: filteredMembers,
      gradeLevel,
    };

    await saveTeam(updatedTeam);
    setTeam(updatedTeam);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('settings.logoutConfirm'))) {
        clearTeam().then(() => router.replace('/'));
      }
    } else {
      Alert.alert(
        t('settings.logout'),
        t('settings.logoutConfirm'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('settings.logout'),
            style: 'destructive',
            onPress: async () => {
              await clearTeam();
              router.replace('/');
            },
          },
        ]
      );
    }
  };

  if (!team) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.pageTitle}>{t('settings.pageTitle')}</Text>

          {/* Success message */}
          {saved && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
              <Text style={styles.successText}>{t('settings.success')}</Text>
            </View>
          )}

          {/* Language Switch */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
            <View style={styles.languageContainer}>
              <TouchableOpacity
                style={[styles.langTab, i18n.language === 'en' && styles.langTabActive]}
                onPress={() => i18n.changeLanguage('en')}
              >
                <Text style={[styles.langText, i18n.language === 'en' && styles.langTextActive]}>
                  {t('settings.english')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langTab, i18n.language === 'id' && styles.langTabActive]}
                onPress={() => i18n.changeLanguage('id')}
              >
                <Text style={[styles.langText, i18n.language === 'id' && styles.langTextActive]}>
                  {t('settings.indonesian')}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Team Information */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('settings.teamInfo')}</Text>

            <Input
              label={t('setup.teamName')}
              value={teamName}
              onChangeText={setTeamName}
              placeholder={t('setup.teamNamePlaceholder')}
            />

            <Input
              label={t('setup.teamPassword')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('setup.teamPasswordPlaceholder')}
              secureTextEntry
            />

            <Select
              label={t('setup.gradeLevel')}
              value={gradeLevel}
              options={gradeLevels}
              onValueChange={setGradeLevel}
            />

            <View style={styles.teamIdBox}>
              <Text style={styles.teamIdLabel}>{t('dashboard.teamId', { id: team.discriminator })}</Text>
              <Text style={styles.teamIdHint}>
                {t('settings.teamIdDesc')}
              </Text>
            </View>
          </Card>

          {/* Team Members */}
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
                    icon={<Ionicons name="trash-outline" size={18} color={Colors.danger} />}
                  />
                )}
              </View>
            ))}

            {members.length < 5 && (
              <Button
                title={t('setup.addMember')}
                onPress={addMember}
                variant="outlined"
                fullWidth
                icon={<Ionicons name="add" size={18} color={Colors.primary} />}
                style={{ marginTop: Spacing.sm }}
              />
            )}
            {members.length >= 5 && (
              <View style={{ marginTop: Spacing.sm, alignItems: 'center' }}>
                <Text style={{ ...Typography.caption, color: Colors.textMuted }}>{t('setup.maxMembers')}</Text>
              </View>
            )}
          </Card>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Button
              title={t('settings.saveChanges')}
              onPress={handleSave}
              fullWidth
              size="lg"
              icon={<Ionicons name="save" size={18} color={Colors.white} />}
            />

            <Button
              title={t('settings.logout')}
              onPress={handleLogout}
              variant="danger"
              fullWidth
              size="lg"
              icon={<Ionicons name="log-out-outline" size={18} color={Colors.white} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  pageTitle: {
    ...Typography.h1,
    marginBottom: Spacing.xxl,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.secondary + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  successText: {
    ...Typography.body,
    color: Colors.secondary,
    fontWeight: '600',
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.lg,
  },
  teamIdBox: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  teamIdLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  teamIdHint: {
    ...Typography.caption,
    marginTop: 2,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  actions: {
    gap: Spacing.md,
  },
  languageContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  langTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  langTabActive: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  langText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  langTextActive: {
    color: Colors.primary,
  },
});
