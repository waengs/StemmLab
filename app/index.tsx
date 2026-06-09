import React, { useCallback, useMemo, useState } from 'react';
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
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, Button, Select } from '../src/components';
import { TeamJoinPanel } from '../src/components/team/TeamJoinPanel';
import { useAuthStore } from '../src/stores';
import { hasProfanity } from '../src/utils/profanity';
import { useTheme } from '../src/context/ThemeContext';
import { useAsyncAction } from '../src/hooks/useAsyncAction';
import { Spacing, BorderRadius, Shadows } from '../src/theme';

type AuthMode = 'signIn' | 'register';
type TeamMode = 'create' | 'join';

export default function AuthSetup() {
  const { t, i18n } = useTranslation();
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        gradient: { flex: 1, backgroundColor: colors.primary },
        flex: { flex: 1 },
        scrollContent: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xxl },
        header: { alignItems: 'center', marginBottom: Spacing.xxxl },
        iconContainer: {
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: 'rgba(255,255,255,0.2)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: Spacing.lg,
        },
        title: { fontSize: 32, fontWeight: '800', color: colors.white, marginBottom: Spacing.xs },
        subtitle: { ...typography.body, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
        formCard: {
          backgroundColor: colors.surface,
          borderRadius: BorderRadius.xl,
          padding: Spacing.xxl,
          ...Shadows.lg,
        },
        tabsContainer: {
          flexDirection: 'row',
          marginBottom: Spacing.xl,
          backgroundColor: colors.background,
          borderRadius: BorderRadius.md,
          padding: 4,
        },
        tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.sm },
        activeTab: { backgroundColor: colors.surfaceElevated, ...Shadows.sm },
        tabText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
        activeTabText: { color: colors.primary },
        welcomeUser: {
          fontSize: 15,
          fontWeight: '600',
          marginBottom: Spacing.lg,
          color: colors.text,
        },
        hint: { fontSize: 12, color: colors.textMuted, marginTop: -Spacing.sm, marginBottom: Spacing.md },
        langToggleContainer: {
          position: 'absolute',
          right: Spacing.xl,
          flexDirection: 'row',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: BorderRadius.md,
          padding: 4,
          zIndex: 10,
        },
        langToggleBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
        langToggleBtnActive: { backgroundColor: colors.surfaceElevated, ...Shadows.sm },
        langToggleText: { ...typography.bodySmall, fontWeight: '700', color: colors.white },
        langToggleTextActive: { color: colors.primary },
      }),
    [colors, typography]
  );
  const user = useAuthStore((s) => s.user);
  const needsTeam = useAuthStore((s) => s.needsTeam);
  const signIn = useAuthStore((s) => s.signIn);
  const register = useAuthStore((s) => s.register);
  const createTeamAction = useAuthStore((s) => s.createTeam);
  const joinTeamAction = useAuthStore((s) => s.joinTeam);
  const signOut = useAuthStore((s) => s.signOut);

  const [authMode, setAuthMode] = useState<AuthMode>('signIn');
  const [teamMode, setTeamMode] = useState<TeamMode>('create');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [teamName, setTeamName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [joinPassword, setJoinPassword] = useState('');

  const gradeLevels = [
    t('setup.gradeUpperPrimary'),
    t('setup.gradeLowerHigh'),
  ];

  const showTeamStep = Boolean(user && needsTeam);

  const signInAction = useCallback(async () => {
    if (!email || !password) {
      Alert.alert(t('setup.missingFields'), t('setup.missingSignInMsg'));
      return;
    }
    try {
      const success = await signIn(email.trim(), password);
      if (!success) {
        Alert.alert(t('setup.signInError'), t('setup.signInErrorMsg'));
      }
    } catch (err: any) {
      if (String(err).includes('auth/invalid-credential')) {
        Alert.alert(t('setup.signInError'), t('setup.signInErrorMsg'));
      } else {
        Alert.alert(t('setup.signInError'), String(err.message || err));
      }
    }
  }, [email, password, signIn, t]);

  const registerAction = useCallback(async () => {
    if (!displayName || !email || !password) {
      Alert.alert(t('setup.missingFields'), t('setup.missingRegisterMsg'));
      return;
    }
    if (hasProfanity(displayName) || hasProfanity(password)) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('setup.passwordTooShort'), t('setup.passwordLengthMsg'));
      return;
    }
    try {
      await register({ displayName: displayName.trim(), email: email.trim(), password });
    } catch (err: any) {
      if (String(err).includes('email-already-in-use')) {
        Alert.alert(t('setup.registerError'), t('setup.emailInUseMsg'));
      } else {
        Alert.alert(t('setup.registerError'), String(err.message || err));
      }
    }
  }, [displayName, email, password, register, t]);

  const createTeamActionFn = useCallback(async () => {
    if (!teamName || !joinPassword || !gradeLevel) {
      Alert.alert(t('setup.missingFields'), t('setup.missingTeamMsg'));
      return;
    }
    if (hasProfanity(teamName) || hasProfanity(joinPassword)) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }
    if (joinPassword.length < 6) {
      Alert.alert(t('setup.passwordTooShort'), t('setup.passwordLengthMsg'));
      return;
    }
    await createTeamAction({ name: teamName.trim(), gradeLevel, joinPassword });
  }, [teamName, joinPassword, gradeLevel, createTeamAction, t]);

  const [handleSignIn, isSigningIn] = useAsyncAction(signInAction);
  const [handleRegister, isRegistering] = useAsyncAction(registerAction);
  const [handleCreateTeam, isCreatingTeam] = useAsyncAction(createTeamActionFn);

  const isAuthBusy = authMode === 'signIn' ? isSigningIn : isRegistering;

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
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name={showTeamStep ? 'people' : 'person'} size={36} color={colors.white} />
              </View>
              <Text style={styles.title}>{t('setup.title')}</Text>
              <Text style={styles.subtitle}>
                {showTeamStep ? t('setup.teamStepSubtitle') : t('setup.subtitle')}
              </Text>
            </View>

            <View style={styles.formCard}>
              {!showTeamStep ? (
                <>
                  <View style={styles.tabsContainer}>
                    <TouchableOpacity
                      onPress={() => setAuthMode('signIn')}
                      style={[styles.tab, authMode === 'signIn' && styles.activeTab]}
                    >
                      <Text style={[styles.tabText, authMode === 'signIn' && styles.activeTabText]}>
                        {t('setup.signInTab')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setAuthMode('register')}
                      style={[styles.tab, authMode === 'register' && styles.activeTab]}
                    >
                      <Text style={[styles.tabText, authMode === 'register' && styles.activeTabText]}>
                        {t('setup.registerTab')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {authMode === 'register' && (
                    <Input
                      label={t('setup.displayName')}
                      value={displayName}
                      onChangeText={setDisplayName}
                      placeholder={t('setup.displayNamePlaceholder')}
                      autoCapitalize="words"
                    />
                  )}

                  <Input
                    label={t('setup.email')}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('setup.emailPlaceholder')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onLightSurface
                    testID="email_input"
                    accessibilityLabel="email_input"
                  />

                  <Input
                    label={t('setup.password')}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('setup.passwordPlaceholder')}
                    secureTextEntry
                    onLightSurface
                    testID="password_input"
                    accessibilityLabel="password_input"
                  />

                  <Button
                    title={authMode === 'signIn' ? t('setup.signInBtn') : t('setup.registerBtn')}
                    onPress={authMode === 'signIn' ? handleSignIn : handleRegister}
                    size="lg"
                    fullWidth
                    loading={isAuthBusy}
                    style={{ marginTop: Spacing.lg }}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.welcomeUser}>
                    {t('setup.helloUser', { name: user?.displayName ?? '' })}
                  </Text>

                  <View style={styles.tabsContainer}>
                    <TouchableOpacity
                      onPress={() => setTeamMode('create')}
                      style={[styles.tab, teamMode === 'create' && styles.activeTab]}
                    >
                      <Text style={[styles.tabText, teamMode === 'create' && styles.activeTabText]}>
                        {t('setup.createTeamTab')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTeamMode('join')}
                      style={[styles.tab, teamMode === 'join' && styles.activeTab]}
                    >
                      <Text style={[styles.tabText, teamMode === 'join' && styles.activeTabText]}>
                        {t('setup.joinTeamTab')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {teamMode === 'create' ? (
                    <>
                      <Input
                        label={t('setup.teamName')}
                        value={teamName}
                        onChangeText={setTeamName}
                        placeholder={t('setup.teamNamePlaceholder')}
                      />
                      <Select
                        label={t('setup.gradeLevel')}
                        value={gradeLevel}
                        options={gradeLevels}
                        onValueChange={setGradeLevel}
                        placeholder={t('setup.gradeLevelPlaceholder')}
                      />
                      <Input
                        label={t('setup.joinPassword')}
                        value={joinPassword}
                        onChangeText={setJoinPassword}
                        placeholder={t('setup.joinPasswordPlaceholder')}
                        secureTextEntry
                      />
                      <Text style={styles.hint}>{t('setup.joinPasswordHint')}</Text>
                      <Button
                        title={t('setup.createTeamBtn')}
                        onPress={handleCreateTeam}
                        size="lg"
                        fullWidth
                        loading={isCreatingTeam}
                        style={{ marginTop: Spacing.lg }}
                      />
                    </>
                  ) : (
                    <TeamJoinPanel joinTeam={joinTeamAction} />
                  )}

                  <Button
                    title={t('setup.signOutDifferent')}
                    onPress={() => void signOut()}
                    variant="ghost"
                    fullWidth
                    style={{ marginTop: Spacing.md }}
                  />
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

