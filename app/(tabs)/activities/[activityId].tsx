import React, { useState, useEffect } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../src/components/Card';
import { Chip } from '../../../src/components/Chip';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { Select } from '../../../src/components/Select';
import { ACTIVITIES } from '../../../src/types';
import {
  getTeam,
  saveActivityResult,
  getActivityResults,
  deleteActivityResult,
} from '../../../src/utils/storage';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../../src/theme';
import type { ActivityResult, Team } from '../../../src/types';

interface FormField {
  name: string;
  label: string;
  type: string;
  options?: string[];
}

export default function ActivityDetail() {
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [pastResults, setPastResults] = useState<ActivityResult[]>([]);
  const [team, setTeam] = useState<Team | null>(null);

  const activity = activityId ? ACTIVITIES[activityId as keyof typeof ACTIVITIES] : null;

  useEffect(() => {
    (async () => {
      const teamData = await getTeam();
      setTeam(teamData);
      if (teamData && activityId) {
        const allResults = await getActivityResults();
        const teamResults = allResults.filter(
          r => r.teamDiscriminator === teamData.discriminator && r.activityId === activityId
        );
        setPastResults(teamResults.sort((a, b) => b.timestamp - a.timestamp));
      }
    })();
  }, [activityId]);

  if (!activity || !team) return null;

  const handleSubmit = async () => {
    const result: ActivityResult = {
      id: Date.now().toString(),
      activityId: activity.id,
      activityName: activity.name,
      teamDiscriminator: team.discriminator,
      timestamp: Date.now(),
      data: formData,
    };

    await saveActivityResult(result);
    setFormData({});
    setPastResults([result, ...pastResults]);
    Alert.alert('Saved!', 'Your results have been recorded.');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Result', 'Are you sure you want to delete this result?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteActivityResult(id);
          setPastResults(pastResults.filter(r => r.id !== id));
        },
      },
    ]);
  };

  const getFormFields = (): FormField[] => {
    switch (activity.id) {
      case 'parachute-drop':
        return [
          { name: 'gForce', label: 'G-Force Measured', type: 'number' },
          { name: 'dropHeight', label: 'Drop Height (cm)', type: 'number' },
          { name: 'parachuteSize', label: 'Parachute Size (cm²)', type: 'number' },
        ];
      case 'sound-pollution':
        return [
          { name: 'maxDecibels', label: 'Max Sound Level (dB)', type: 'number' },
          { name: 'avgDecibels', label: 'Average Sound Level (dB)', type: 'number' },
          { name: 'location', label: 'Location', type: 'text' },
        ];
      case 'hand-fan':
        return [
          { name: 'windSpeed', label: 'Wind Speed (m/s)', type: 'number' },
          { name: 'fanSize', label: 'Fan Diameter (cm)', type: 'number' },
        ];
      case 'earthquake':
        return [
          { name: 'vibrationLevel', label: 'Max Vibration (Hz)', type: 'number' },
          { name: 'structureHeight', label: 'Structure Height (cm)', type: 'number' },
          { name: 'survived', label: 'Structure Survived', type: 'select', options: ['Yes', 'No'] },
        ];
      case 'human-performance':
        return [
          { name: 'bendAngle', label: 'Max Bend Angle (degrees)', type: 'number' },
          { name: 'speed', label: 'Movement Speed (1-10)', type: 'number' },
          { name: 'gracefulness', label: 'Gracefulness Score (1-10)', type: 'number' },
        ];
      case 'reaction-board':
        return [
          { name: 'reactionTime', label: 'Reaction Time (ms)', type: 'number' },
          { name: 'accuracy', label: 'Accuracy (%)', type: 'number' },
        ];
      case 'breathing-pace':
        return [
          { name: 'breathsPerMinute', label: 'Breaths Per Minute', type: 'number' },
          { name: 'consistency', label: 'Consistency Score (1-10)', type: 'number' },
        ];
      default:
        return [];
    }
  };

  const fields = getFormFields();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.primary} />
            <Text style={styles.backText}>Back to Activities</Text>
          </TouchableOpacity>

          {/* Activity info */}
          <Card style={styles.infoCard}>
            <Text style={styles.activityName}>{activity.name}</Text>
            <Text style={styles.activityDesc}>{activity.description}</Text>

            <View style={styles.chipRow}>
              <Chip label={activity.category} variant="filled" color={Colors.primary} size="md" />
              {activity.sensors.map((sensor) => (
                <Chip key={sensor} label={sensor.replace('-', ' ')} size="sm" />
              ))}
            </View>

            {/* Info alert */}
            <View style={styles.alert}>
              <Ionicons name="information-circle" size={18} color={Colors.primary} />
              <Text style={styles.alertText}>
                Record your measurements and results below. All data will be saved to your team profile.
              </Text>
            </View>

            {/* Form */}
            {fields.map((field) =>
              field.type === 'select' ? (
                <Select
                  key={field.name}
                  label={field.label}
                  value={formData[field.name] || ''}
                  options={field.options || []}
                  onValueChange={(v) => setFormData({ ...formData, [field.name]: v })}
                />
              ) : (
                <Input
                  key={field.name}
                  label={field.label}
                  value={formData[field.name] || ''}
                  onChangeText={(v) => setFormData({ ...formData, [field.name]: v })}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )
            )}

            <Input
              label="Notes (optional)"
              value={formData.notes || ''}
              onChangeText={(v) => setFormData({ ...formData, notes: v })}
              multiline
              numberOfLines={3}
              placeholder="Add any notes..."
            />

            <Button
              title="Save Results"
              onPress={handleSubmit}
              size="lg"
              fullWidth
              icon={<Ionicons name="save" size={18} color={Colors.white} />}
            />
          </Card>

          {/* Past results */}
          {pastResults.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>
                Past Results ({pastResults.length})
              </Text>
              {pastResults.map((result) => (
                <Card key={result.id} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultDate}>
                      {new Date(result.timestamp).toLocaleString()}
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(result.id)}>
                      <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                  {Object.entries(result.data).map(([key, value]) => (
                    <Text key={key} style={styles.resultField}>
                      <Text style={styles.resultFieldName}>{key}: </Text>
                      {value}
                    </Text>
                  ))}
                </Card>
              ))}
            </View>
          )}
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  backText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  infoCard: {
    marginBottom: Spacing.xl,
  },
  activityName: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  activityDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  alertText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    flex: 1,
  },
  resultsSection: {
    marginTop: Spacing.sm,
  },
  resultsTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  resultCard: {
    marginBottom: Spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  resultDate: {
    ...Typography.caption,
  },
  resultField: {
    ...Typography.bodySmall,
    marginBottom: 2,
  },
  resultFieldName: {
    fontWeight: '600',
    color: Colors.text,
  },
});
