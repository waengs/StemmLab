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
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Chip, Input, Button, Select, ParachuteDropForm, ParachuteDropPostActivity, ParachuteDropResults } from '../../../src/components';
import { ACTIVITIES } from '../../../src/types';
import { hasProfanity } from '../../../src/utils/profanity';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../../src/theme';
import { useRequireAuth } from '../../../src/stores';
import { useActivityResultsStore, useResultsForActivity } from '../../../src/stores';
import { calculateScore } from '../../../src/stores';
import type { ActivityResult } from '../../../src/types';

interface FormField {
  name: string;
  label: string;
  type: string;
  options?: string[];
}

export default function ActivityDetail() {
  const { t } = useTranslation();
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { user, team } = useRequireAuth();
  const pastResults = useResultsForActivity(team?.discriminator, activityId);
  const addResult = useActivityResultsStore((s) => s.addResult);
  const removeResult = useActivityResultsStore((s) => s.removeResult);
  
  // Custom State for Parachute Drop Menu Flow
  const [parachuteViewState, setParachuteViewState] = useState<'form' | 'menu' | 'quiz' | 'past-result'>('form');

  useEffect(() => {
    // If they open the activity and already have results, default to the menu
    if (activityId === 'parachute-drop' && pastResults.length > 0 && parachuteViewState === 'form') {
      // Only default to menu if we haven't explicitly set it to something else
      const justLoaded = Object.keys(formData).length === 0;
      if (justLoaded) {
        setParachuteViewState('menu');
      }
    }
  }, [activityId, pastResults.length]);

  const activity = activityId ? ACTIVITIES[activityId as keyof typeof ACTIVITIES] : null;

  if (!activity || !team) return null;

  const handleSubmit = async () => {
    if (!user || !team) return;

    const hasBadWords = Object.values(formData).some(val => typeof val === 'string' && hasProfanity(val));
    if (hasBadWords) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

    const result: ActivityResult = {
      id: Date.now().toString(),
      activityId: activity.id,
      activityName: activity.name,
      teamDiscriminator: team.discriminator,
      submittedByUid: user.uid,
      timestamp: Date.now(),
      data: formData,
    };

    await addResult(result);
    setFormData({});
    Alert.alert(t('activities.savedTitle'), t('activities.savedMsg'));
    
    if (activity.id === 'parachute-drop') {
      setParachuteViewState('quiz');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('activities.deleteResult'), t('activities.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await removeResult(id);
          if (activity.id === 'parachute-drop' && pastResults.length <= 1) {
             setParachuteViewState('form');
          }
        },
      },
    ]);
  };

  const getFormFields = (): FormField[] => {
    switch (activity.id) {
      case 'sound-pollution':
        return [
          { name: 'maxDecibels', label: t('data.activities.sound-pollution.fields.maxDecibels'), type: 'number' },
          { name: 'avgDecibels', label: t('data.activities.sound-pollution.fields.avgDecibels'), type: 'number' },
          { name: 'location', label: t('data.activities.sound-pollution.fields.location'), type: 'text' },
        ];
      case 'hand-fan':
        return [
          { name: 'windSpeed', label: t('data.activities.hand-fan.fields.windSpeed'), type: 'number' },
          { name: 'fanSize', label: t('data.activities.hand-fan.fields.fanSize'), type: 'number' },
        ];
      case 'earthquake':
        return [
          { name: 'vibrationLevel', label: t('data.activities.earthquake.fields.vibrationLevel'), type: 'number' },
          { name: 'structureHeight', label: t('data.activities.earthquake.fields.structureHeight'), type: 'number' },
          { name: 'survived', label: t('data.activities.earthquake.fields.survived'), type: 'select', options: ['Yes', 'No'] },
        ];
      case 'human-performance':
        return [
          { name: 'bendAngle', label: t('data.activities.human-performance.fields.bendAngle'), type: 'number' },
          { name: 'speed', label: t('data.activities.human-performance.fields.speed'), type: 'number' },
          { name: 'gracefulness', label: t('data.activities.human-performance.fields.gracefulness'), type: 'number' },
        ];
      case 'reaction-board':
        return [
          { name: 'reactionTime', label: t('data.activities.reaction-board.fields.reactionTime'), type: 'number' },
          { name: 'accuracy', label: t('data.activities.reaction-board.fields.accuracy'), type: 'number' },
        ];
      case 'breathing-pace':
        return [
          { name: 'breathsPerMinute', label: t('data.activities.breathing-pace.fields.breathsPerMinute'), type: 'number' },
          { name: 'consistency', label: t('data.activities.breathing-pace.fields.consistency'), type: 'number' },
        ];
      default:
        return [];
    }
  };

  const fields = getFormFields();
  const latestResult = pastResults[0];

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
            onPress={() => {
              if (activity.id === 'parachute-drop' && parachuteViewState !== 'menu' && pastResults.length > 0) {
                 setParachuteViewState('menu');
              } else {
                 router.back();
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.primary} />
            <Text style={styles.backText}>{t('common.back')}</Text>
          </TouchableOpacity>

          {/* Activity info */}
          <Card style={styles.infoCard}>
            <Text style={styles.activityName}>{t(`data.activities.${activity.id}.name`, { defaultValue: activity.name })}</Text>
            <Text style={styles.activityDesc}>{t(`data.activities.${activity.id}.desc`, { defaultValue: activity.description })}</Text>

            <View style={styles.chipRow}>
              <Chip label={t(`data.categories.${activity.category}`, { defaultValue: activity.category })} variant="filled" color={Colors.primary} size="md" />
              {activity.sensors.map((sensor) => (
                <Chip key={sensor} label={t(`data.sensors.${sensor}.name`, { defaultValue: sensor.replace('-', ' ') })} size="sm" />
              ))}
            </View>

            {/* Info alert */}
            <View style={styles.alert}>
              <Ionicons name="information-circle" size={18} color={Colors.primary} />
              <Text style={styles.alertText}>
                {activity.id === 'parachute-drop' ? t('data.activities.parachute-drop.overview') : t('activities.infoAlert')}
              </Text>
            </View>

            {/* Form */}
            {activity.id === 'parachute-drop' ? (
              <>
                {parachuteViewState === 'form' && (
                  <ParachuteDropForm value={formData} onChange={setFormData} onSubmit={handleSubmit} />
                )}
                {parachuteViewState === 'menu' && (
                  <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Activity Dashboard</Text>
                    <Button 
                      title="View Past Result" 
                      onPress={() => setParachuteViewState('past-result')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="time" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title="View Quiz & Discussions" 
                      onPress={() => setParachuteViewState('quiz')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="school" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title="Do Another Experiment" 
                      onPress={() => {
                        setFormData({});
                        setParachuteViewState('form');
                      }} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="flask" size={18} color={Colors.primary} />} 
                      variant="outlined" 
                    />
                  </View>
                )}
              </>
            ) : (
              <>
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
                      placeholder={t('activities.enterValue', { label: field.label.toLowerCase() })}
                    />
                  )
                )}

                <Input
                  label={t('common.notes')}
                  value={formData.notes || ''}
                  onChangeText={(v) => setFormData({ ...formData, notes: v })}
                  multiline
                  numberOfLines={3}
                  placeholder={t('sensors.notesPlaceholder')}
                />
              </>
            )}

            {activity.id !== 'parachute-drop' && (
              <Button
                title={t('common.save')}
                onPress={handleSubmit}
                size="lg"
                fullWidth
                icon={<Ionicons name="save" size={18} color={Colors.white} />}
              />
            )}
          </Card>

          {/* Past results & Quiz Views */}
          {activity.id === 'parachute-drop' ? (
            <View>
              {parachuteViewState === 'quiz' && latestResult && (
                 <ParachuteDropPostActivity data={latestResult.data} />
              )}
              {parachuteViewState === 'past-result' && pastResults.length > 0 && (
                <View style={styles.resultsSection}>
                  <Text style={styles.resultsTitle}>
                    {t('activities.pastResults', { count: pastResults.length })}
                  </Text>
                  {pastResults.map((result) => (
                    <Card key={result.id} style={styles.resultCard}>
                      <View style={styles.resultHeader}>
                        <Text style={styles.resultDate}>
                          {new Date(result.timestamp).toLocaleString()}
                        </Text>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: Spacing.sm}}>
                        <Text style={{fontWeight: '700', color: Colors.primary}}>
                          Score: {calculateScore(result)}
                        </Text>
                        <TouchableOpacity onPress={() => handleDelete(result.id)}>
                          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                        </TouchableOpacity>
                      </View>
                      </View>
                      <ParachuteDropResults data={result.data} />
                    </Card>
                  ))}
                </View>
              )}
            </View>
          ) : (
            pastResults.length > 0 && (
              <View style={styles.resultsSection}>
                <Text style={styles.resultsTitle}>
                  {t('activities.pastResults', { count: pastResults.length })}
                </Text>
                {pastResults.map((result) => (
                  <Card key={result.id} style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultDate}>
                        {new Date(result.timestamp).toLocaleString()}
                      </Text>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: Spacing.sm}}>
                        <Text style={{fontWeight: '700', color: Colors.primary}}>
                          Score: {calculateScore(result)}
                        </Text>
                        <TouchableOpacity onPress={() => handleDelete(result.id)}>
                          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {Object.entries(result.data).map(([key, value]) => (
                      <Text key={key} style={styles.resultField}>
                        <Text style={styles.resultFieldName}>{key}: </Text>
                        {value as string}
                      </Text>
                    ))}
                  </Card>
                ))}
              </View>
            )
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
  menuContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuTitle: {
    ...Typography.h3,
    marginBottom: Spacing.lg,
    color: Colors.text,
    textAlign: 'center',
  },
  menuBtn: {
    marginBottom: Spacing.md,
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
