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
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';
import { Select } from '../src/components/Select';
import { saveTeam, generateDiscriminator, signInTeam } from '../src/utils/storage';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../src/theme';
import type { Team } from '../src/types';

export default function TeamSetup() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState(['']);
  const [gradeLevel, setGradeLevel] = useState('');
  const [isSignIn, setIsSignIn] = useState(false);

  const gradeLevels = [
    'Upper Primary School (Grades 4–6)',
    'Lower High School (Grades 7–9)',
  ];

  const handleSignIn = async () => {
    if (!teamName || !password) {
      Alert.alert('Missing Fields', 'Please enter your team name and password');
      return;
    }
    const success = await signInTeam(teamName, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Invalid team name or password. Please try again or create a new team.');
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
      Alert.alert('Missing Fields', 'Please fill in all fields and add at least one team member');
      return;
    }

    const team: Team = {
      name: teamName,
      password,
      members: filteredMembers,
      gradeLevel,
      discriminator: generateDiscriminator(),
    };

    await saveTeam(team);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.gradient}>
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
            <Text style={styles.title}>STEM Lab</Text>
            <Text style={styles.subtitle}>Create your team to get started</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.tabsContainer}>
              <TouchableOpacity onPress={() => setIsSignIn(false)} style={[styles.tab, !isSignIn && styles.activeTab]}>
                <Text style={[styles.tabText, !isSignIn && styles.activeTabText]}>Create Team</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsSignIn(true)} style={[styles.tab, isSignIn && styles.activeTab]}>
                <Text style={[styles.tabText, isSignIn && styles.activeTabText]}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Team Name"
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Enter team name"
            />

            <Input
              label="Team Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter a password"
              secureTextEntry
            />

            {!isSignIn && (
              <>
                <Select
                  label="Grade or Year Level"
                  value={gradeLevel}
                  options={gradeLevels}
                  onValueChange={setGradeLevel}
                  placeholder="Select level..."
                />

                <Text style={styles.sectionLabel}>Team Members</Text>

                {members.map((member, index) => (
                  <View key={index} style={styles.memberRow}>
                    <View style={styles.memberInput}>
                      <Input
                        value={member}
                        onChangeText={(v) => updateMember(index, v)}
                        placeholder={`Member ${index + 1}`}
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
                    title="Add Member"
                    onPress={addMember}
                    variant="outlined"
                    fullWidth
                    icon={<Ionicons name="add" size={18} color={Colors.primary} />}
                    style={{ marginTop: Spacing.sm, marginBottom: Spacing.xl }}
                  />
                )}
                {members.length >= 5 && (
                  <View style={{ marginTop: Spacing.sm, marginBottom: Spacing.xl, alignItems: 'center' }}>
                    <Text style={{ ...Typography.caption, color: Colors.textMuted }}>Maximum of 5 members per team reached</Text>
                  </View>
                )}

                <Button
                  title="Create Team"
                  onPress={handleSubmit}
                  size="lg"
                  fullWidth
                />
              </>
            )}

            {isSignIn && (
              <Button
                title="Sign In"
                onPress={handleSignIn}
                size="lg"
                fullWidth
                style={{ marginTop: Spacing.xl }}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
});
