import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Select } from '../../src/components/Select';
import { getTeam, saveTeam, clearTeam } from '../../src/utils/storage';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';
import type { Team } from '../../src/types';

export default function Settings() {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [gradeLevel, setGradeLevel] = useState('');
  const [saved, setSaved] = useState(false);

  const gradeLevels = [
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12', 'Year 1', 'Year 2', 'Year 3', 'Year 4',
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

  const addMember = () => setMembers([...members, '']);

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
      Alert.alert('Missing Fields', 'Please fill in all fields and add at least one team member');
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
    Alert.alert(
      'Logout',
      "Are you sure you want to logout? You'll need to log back in with your team credentials.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearTeam();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!team) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.pageTitle}>Team Settings</Text>

          {/* Success message */}
          {saved && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
              <Text style={styles.successText}>Changes saved successfully!</Text>
            </View>
          )}

          {/* Team Information */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Team Information</Text>

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
              placeholder="Enter password"
              secureTextEntry
            />

            <Select
              label="Grade or Year Level"
              value={gradeLevel}
              options={gradeLevels}
              onValueChange={setGradeLevel}
            />

            <View style={styles.teamIdBox}>
              <Text style={styles.teamIdLabel}>Team ID: {team.discriminator}</Text>
              <Text style={styles.teamIdHint}>
                This unique code identifies your team on the leaderboard
              </Text>
            </View>
          </Card>

          {/* Team Members */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Team Members</Text>

            {members.map((member, index) => (
              <View key={index} style={styles.memberRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    value={member}
                    onChangeText={(v) => updateMember(index, v)}
                    placeholder={`Member ${index + 1}`}
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

            <Button
              title="Add Member"
              onPress={addMember}
              variant="outlined"
              fullWidth
              icon={<Ionicons name="add" size={18} color={Colors.primary} />}
              style={{ marginTop: Spacing.sm }}
            />
          </Card>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              fullWidth
              size="lg"
              icon={<Ionicons name="save" size={18} color={Colors.white} />}
            />

            <Button
              title="Logout"
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
});
