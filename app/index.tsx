import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, Button, Select } from '../src/components';
import { useAuthStore } from '../src/stores';
import { hasProfanity } from '../src/utils/profanity';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../src/theme';
export default function TeamSetup() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const registerTeam = useAuthStore((s) => s.registerTeam);
  const insets = useSafeAreaInsets();
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState(['']);
  const [gradeLevel, setGradeLevel] = useState('');
  const [isSignIn, setIsSignIn] = useState(false);

  const gradeLevels = [
    t('setup.gradeUpperPrimary'),
    t('setup.gradeLowerHigh'),
  ];

  const handleSignIn = async () => {
    if (!teamName || !password) {
      Alert.alert(t('setup.missingFields'), t('setup.missingSignInMsg'));
      return;
    }
    const success = await signIn(teamName, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert(t('setup.signInError'), t('setup.signInErrorMsg'));
    }
  };

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

  const handleSubmit = async () => {
    const filteredMembers = members.filter(m => m.trim() !== '');
    if (!teamName || !password || filteredMembers.length === 0 || !gradeLevel) {
      Alert.alert(t('setup.missingFields'), t('setup.missingFieldsMsg'));
      return;
    }

    if (hasProfanity(teamName) || hasProfanity(password) || filteredMembers.some(hasProfanity)) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

    await registerTeam({
      name: teamName,
      password,
      members: filteredMembers,
      gradeLevel,
    });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.gradient}>
      <SafeAreaView style={styles.flex}>
        <View style={[styles.langToggleContainer, { top: Math.max(insets.top, 16) + 16 }]}>
          <TouchableOpacity
            style={[styles.langToggleBtn, i18n.language === 'en' && styles.langToggleBtnActive]}
            onPress={() => i18n.changeLanguage('en')}
          >
            <Text style={[styles.langToggleText, i18n.language === 'en' && styles.langToggleTextActive]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langToggleBtn, i18n.language === 'id' && styles.langToggleBtnActive]}
            onPress={() => i18n.changeLanguage('id')}
          >
            <Text style={[styles.langToggleText, i18n.language === 'id' && styles.langToggleTextActive]}>ID</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={36} color={Colors.white} />
            </View>
            <Text style={styles.title}>{t('setup.title')}</Text>
            <Text style={styles.subtitle}>{t('setup.subtitle')}</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.tabsContainer}>
              <TouchableOpacity onPress={() => setIsSignIn(false)} style={[styles.tab, !isSignIn && styles.activeTab]}>
                <Text style={[styles.tabText, !isSignIn && styles.activeTabText]}>{t('setup.createTeamTab')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsSignIn(true)} style={[styles.tab, isSignIn && styles.activeTab]}>
                <Text style={[styles.tabText, isSignIn && styles.activeTabText]}>{t('setup.signInTab')}</Text>
              </TouchableOpacity>
            </View>

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

            {!isSignIn && (
              <>
                <Select
                  label={t('setup.gradeLevel')}
                  value={gradeLevel}
                  options={gradeLevels}
                  onValueChange={setGradeLevel}
                  placeholder={t('setup.gradeLevelPlaceholder')}
                />

                <Text style={styles.sectionLabel}>{t('setup.teamMembers')}</Text>

                {members.map((member, index) => (
                  <View key={index} style={styles.memberRow}>
                    <View style={styles.memberInput}>
                      <Input
                        value={member}
                        onChangeText={(v) => updateMember(index, v)}
                        placeholder={t('setup.memberPlaceholder', { count: index + 1 })}
                        containerStyle={{ marginBottom: 0 }}
                      />
                    </View>
                    {members.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeMember(index)}
                        style={styles.removeBtn}
                      >
                        <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                      </TouchableOpacity>
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
                    style={{ marginTop: Spacing.sm, marginBottom: Spacing.xl }}
                  />
                )}
                {members.length >= 5 && (
                  <View style={{ marginTop: Spacing.sm, marginBottom: Spacing.xl, alignItems: 'center' }}>
                    <Text style={{ ...Typography.caption, color: Colors.textMuted }}>{t('setup.maxMembers')}</Text>
                  </View>
                )}

                <Button
                  title={t('setup.createTeamBtn')}
                  onPress={handleSubmit}
                  size="lg"
                  fullWidth
                />
              </>
            )}

            {isSignIn && (
              <Button
                title={t('setup.signInBtn')}
                onPress={handleSignIn}
                size="lg"
                fullWidth
                style={{ marginTop: Spacing.xl }}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    ...Shadows.lg,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  activeTab: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  tabText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  sectionLabel: {
    ...Typography.label,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  memberInput: {
    flex: 1,
  },
  removeBtn: {
    padding: Spacing.sm,
    marginTop: -Spacing.sm,
  },
  langToggleContainer: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.xl,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.md,
    padding: 4,
    zIndex: 10,
  },
  langToggleBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  langToggleBtnActive: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  langToggleText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.white,
  },
  langToggleTextActive: {
    color: Colors.primary,
  },
});
