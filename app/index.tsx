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
import { saveTeam, generateDiscriminator } from '../src/utils/storage';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../src/theme';
import type { Team } from '../src/types';

export default function TeamSetup() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState(['']);
  const [gradeLevel, setGradeLevel] = useState('');

  const gradeLevels = [
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12', 'Year 1', 'Year 2', 'Year 3', 'Year 4',
  ];

  const addMember = () => setMembers([...members, '']);

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

            <Button
              title="Add Member"
              onPress={addMember}
              variant="outlined"
              fullWidth
              icon={<Ionicons name="add" size={18} color={Colors.primary} />}
              style={{ marginTop: Spacing.sm, marginBottom: Spacing.xl }}
            />

            <Button
              title="Create Team"
              onPress={handleSubmit}
              size="lg"
              fullWidth
            />
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
