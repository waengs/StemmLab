import React, { useState, useEffect, useCallback } from 'react';
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
import { Card, Chip, Input, Button, Select, ActivityMenuDashboard, ParachuteDropForm, ParachuteDropPostActivity, ParachuteDropResults, ParachuteDropDiscussion, HandFanForm, HandFanPostActivity, HandFanResults, HandFanDiscussion, SoundPollutionForm, SoundPollutionResults, SoundPollutionPostActivity, SoundPollutionDiscussion, EarthquakeForm, EarthquakeResults, EarthquakePostActivity, EarthquakeDiscussion, HumanPerformanceForm, HumanPerformancePostActivity, HumanPerformanceResults, HumanPerformanceDiscussion, BreathingPaceForm, BreathingPacePostActivity, BreathingPaceResults, BreathingPaceDiscussion, ReactionBoardForm, ReactionBoardPostActivity, ReactionBoardResults, ReactionBoardDiscussion } from '../../../src/components';
import { ACTIVITIES } from '../../../src/types';
import { hasProfanity } from '../../../src/utils/profanity';
import { useTheme } from '../../../src/context/ThemeContext';
import { useThemedStyles } from '../../../src/hooks/useThemedStyles';
import { useAsyncAction } from '../../../src/hooks/useAsyncAction';
import { Spacing, BorderRadius, Shadows } from '../../../src/theme';
import { useRequireAuth, useActivityResultsStore, useResultsForActivity, calculateScore } from '../../../src/stores';
import type { ActivityResult } from '../../../src/types';

interface FormField {
  name: string;
  label: string;
  type: string;
  options?: string[];
}

export default function ActivityDetail() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors: c, typography }) => ({
    safe: { flex: 1, backgroundColor: c.background },
    container: { flex: 1 },
    content: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.lg },
    backText: { ...typography.body, color: c.primary, fontWeight: '600' },
    infoCard: { marginBottom: Spacing.xl },
    activityName: { ...typography.h2, marginBottom: Spacing.xs, color: c.text },
    activityDesc: { ...typography.body, color: c.textSecondary, marginBottom: Spacing.md },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    alert: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.sm,
      backgroundColor: c.primary + '10',
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginBottom: Spacing.xl,
    },
    alertText: { ...typography.bodySmall, color: c.primary, flex: 1 },
    menuContainer: {
      padding: Spacing.md,
      backgroundColor: c.surface,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    menuTitle: { ...typography.h3, marginBottom: Spacing.lg, color: c.text, textAlign: 'center' },
    menuBtn: { marginBottom: Spacing.md },
    resultsSection: { marginTop: Spacing.sm },
    resultsTitle: { ...typography.h3, marginBottom: Spacing.md, color: c.text },
    resultCard: { marginBottom: Spacing.md },
    resultHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    resultDate: { ...typography.caption, color: c.textMuted },
    resultField: { ...typography.bodySmall, marginBottom: 2, color: c.textSecondary },
    resultFieldName: { fontWeight: '600', color: c.text },
  }));
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { user, team } = useRequireAuth();
  const pastResults = useResultsForActivity(team?.discriminator, activityId);
  const addResult = useActivityResultsStore((s) => s.addResult);
  const removeResult = useActivityResultsStore((s) => s.removeResult);
  
  // Custom State for Parachute Drop Menu Flow
  const [parachuteViewState, setParachuteViewState] = useState<'form' | 'menu' | 'quiz' | 'forum' | 'past-result'>('form');
  // Custom State for Hand Fan Menu Flow
  const [handFanViewState, setHandFanViewState] = useState<'form' | 'menu' | 'quiz' | 'forum' | 'past-result'>('form');
  // Custom State for Sound Pollution Menu Flow
  const [soundPollutionViewState, setSoundPollutionViewState] = useState<'form' | 'menu' | 'quiz' | 'forum' | 'past-result'>('form');
  // Custom State for Earthquake Menu Flow
  const [earthquakeViewState, setEarthquakeViewState] = useState<'form' | 'menu' | 'quiz' | 'forum' | 'past-result'>('form');
  // Custom State for Human Performance Menu Flow
  const [humanPerformanceViewState, setHumanPerformanceViewState] = useState<'form' | 'menu' | 'quiz' | 'forum' | 'past-result'>('form');
  const [breathingPaceViewState, setBreathingPaceViewState] = useState<'form' | 'menu' | 'quiz' | 'forum' | 'past-result'>('form');
  const [reactionBoardViewState, setReactionBoardViewState] = useState<'form' | 'menu' | 'quiz' | 'forum' | 'past-result'>('form');

  useEffect(() => {
    // If they open the activity and already have results, default to the menu
    if (activityId === 'parachute-drop' && pastResults.length > 0 && parachuteViewState === 'form') {
      const justLoaded = Object.keys(formData).length === 0;
      if (justLoaded) {
        setParachuteViewState('menu');
      }
    }
    if (activityId === 'hand-fan' && pastResults.length > 0 && handFanViewState === 'form') {
      const justLoaded = Object.keys(formData).length === 0;
      if (justLoaded) {
        setHandFanViewState('menu');
      }
    }
    if (activityId === 'sound-pollution' && pastResults.length > 0 && soundPollutionViewState === 'form') {
      const justLoaded = Object.keys(formData).length === 0;
      if (justLoaded) {
        setSoundPollutionViewState('menu');
      }
    }
    if (activityId === 'earthquake' && pastResults.length > 0 && earthquakeViewState === 'form') {
      const justLoaded = Object.keys(formData).length === 0;
      if (justLoaded) {
        setEarthquakeViewState('menu');
      }
    }
    if (activityId === 'human-performance' && pastResults.length > 0 && humanPerformanceViewState === 'form') {
      const justLoaded = Object.keys(formData).length === 0;
      if (justLoaded) {
        setHumanPerformanceViewState('menu');
      }
    }
    if (activityId === 'breathing-pace' && pastResults.length > 0 && breathingPaceViewState === 'form') {
      const justLoaded = Object.keys(formData).length === 0;
      if (justLoaded) {
        setBreathingPaceViewState('menu');
      }
    }
    if (activityId === 'reaction-board' && pastResults.length > 0 && reactionBoardViewState === 'form') {
      const justLoaded = Object.keys(formData).length === 0;
      if (justLoaded) {
        setReactionBoardViewState('menu');
      }
    }
  }, [activityId, pastResults.length]);

  const activity = activityId ? ACTIVITIES[activityId as keyof typeof ACTIVITIES] : null;

  const submitActivity = useCallback(async () => {
    if (!user || !team || !activity) return;

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
      data: { ...formData, __teamName: team.name },
      score: 0,
    };
    result.score = calculateScore(result);

    await addResult(result);
    setFormData({});
    Alert.alert(t('activities.savedTitle'), t('activities.savedMsg'));
    
    if (activity.id === 'parachute-drop') {
      setParachuteViewState('quiz');
    } else if (activity.id === 'hand-fan') {
      setHandFanViewState('quiz');
    } else if (activity.id === 'sound-pollution') {
      setSoundPollutionViewState('quiz');
    } else if (activity.id === 'earthquake') {
      setEarthquakeViewState('quiz');
    } else if (activity.id === 'human-performance') {
      setHumanPerformanceViewState('quiz');
    } else if (activity.id === 'breathing-pace') {
      setBreathingPaceViewState('quiz');
    } else if (activity.id === 'reaction-board') {
      setReactionBoardViewState('quiz');
    }
  }, [user, team, activity, formData, addResult, t]);

  const [handleSubmit, isSubmitting] = useAsyncAction(submitActivity);

  if (!activity || !team) return null;

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
          } else if (activity.id === 'hand-fan' && pastResults.length <= 1) {
             setHandFanViewState('form');
          } else if (activity.id === 'sound-pollution' && pastResults.length <= 1) {
             setSoundPollutionViewState('form');
          } else if (activity.id === 'earthquake' && pastResults.length <= 1) {
             setEarthquakeViewState('form');
          } else if (activity.id === 'human-performance' && pastResults.length <= 1) {
             setHumanPerformanceViewState('form');
          } else if (activity.id === 'breathing-pace' && pastResults.length <= 1) {
             setBreathingPaceViewState('form');
          } else if (activity.id === 'reaction-board' && pastResults.length <= 1) {
             setReactionBoardViewState('form');
          }
        },
      },
    ]);
  };

  const getFormFields = (): FormField[] => {
    switch (activity.id) {
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
              } else if (activity.id === 'hand-fan' && handFanViewState !== 'menu' && pastResults.length > 0) {
                 setHandFanViewState('menu');
              } else if (activity.id === 'sound-pollution' && soundPollutionViewState !== 'menu' && pastResults.length > 0) {
                 setSoundPollutionViewState('menu');
              } else if (activity.id === 'earthquake' && earthquakeViewState !== 'menu' && pastResults.length > 0) {
                 setEarthquakeViewState('menu');
              } else if (activity.id === 'human-performance' && humanPerformanceViewState !== 'menu' && pastResults.length > 0) {
                 setHumanPerformanceViewState('menu');
              } else if (activity.id === 'breathing-pace' && breathingPaceViewState !== 'menu' && pastResults.length > 0) {
                 setBreathingPaceViewState('menu');
              } else if (activity.id === 'reaction-board' && reactionBoardViewState !== 'menu' && pastResults.length > 0) {
                 setReactionBoardViewState('menu');
              } else {
                 router.back();
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backText}>{t('common.back')}</Text>
          </TouchableOpacity>

          {/* Activity info */}
          <Card style={styles.infoCard}>
            <Text style={styles.activityName}>{t(`data.activities.${activity.id}.name`, { defaultValue: activity.name })}</Text>
            <Text style={styles.activityDesc}>{t(`data.activities.${activity.id}.desc`, { defaultValue: activity.description })}</Text>

            <View style={styles.chipRow}>
              <Chip label={t(`data.categories.${activity.category}`, { defaultValue: activity.category })} variant="filled" color={colors.primary} size="md" />
              {activity.sensors.map((sensor) => (
                <Chip
                  key={sensor}
                  label={t(`data.activities.${activity.id}.chips.${sensor}`, {
                    defaultValue: t(`data.sensors.${sensor}.name`, { defaultValue: sensor.replace(/-/g, ' ') }),
                  })}
                  size="sm"
                />
              ))}
            </View>

            {/* Info alert */}
            <View style={styles.alert}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={styles.alertText}>
                {t(`data.activities.${activity.id}.overview`, {
                  defaultValue: t('activities.infoAlert'),
                })}
              </Text>
            </View>

            {/* Form */}
            {activity.id === 'parachute-drop' ? (
              <>
                {parachuteViewState === 'form' && (
                  <ParachuteDropForm value={formData} onChange={setFormData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                )}
                {parachuteViewState === 'menu' && (
                  <ActivityMenuDashboard
                    quizCompleted={!!latestResult?.data?.quizCompleted}
                    pastResultsVariant="singular"
                    onPastResults={() => setParachuteViewState('past-result')}
                    onQuiz={() => setParachuteViewState('quiz')}
                    onDiscussions={() => setParachuteViewState('forum')}
                    onNewExperiment={() => {
                      setFormData({});
                      setParachuteViewState('form');
                    }}
                  />
                )}
              </>
            ) : activity.id === 'hand-fan' ? (
              <>
                {handFanViewState === 'form' && (
                  <HandFanForm value={formData} onChange={setFormData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                )}
                {handFanViewState === 'menu' && (
                  <ActivityMenuDashboard
                    quizCompleted={!!latestResult?.data?.quizCompleted}
                    onPastResults={() => setHandFanViewState('past-result')}
                    onQuiz={() => setHandFanViewState('quiz')}
                    onDiscussions={() => setHandFanViewState('forum')}
                    onNewExperiment={() => {
                      setFormData({});
                      setHandFanViewState('form');
                    }}
                  />
                )}
              </>
            ) : activity.id === 'human-performance' ? (
              <>
                {humanPerformanceViewState === 'form' && (
                  <HumanPerformanceForm value={formData} onChange={setFormData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                )}
                {humanPerformanceViewState === 'menu' && (
                  <ActivityMenuDashboard
                    quizCompleted={!!latestResult?.data?.quizCompleted}
                    onPastResults={() => setHumanPerformanceViewState('past-result')}
                    onQuiz={() => setHumanPerformanceViewState('quiz')}
                    onDiscussions={() => setHumanPerformanceViewState('forum')}
                    onNewExperiment={() => {
                      setFormData({});
                      setHumanPerformanceViewState('form');
                    }}
                  />
                )}
              </>
            ) : activity.id === 'breathing-pace' ? (
              <>
                {breathingPaceViewState === 'form' && (
                  <BreathingPaceForm value={formData} onChange={setFormData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                )}
                {breathingPaceViewState === 'menu' && (
                  <ActivityMenuDashboard
                    quizCompleted={!!latestResult?.data?.quizCompleted}
                    onPastResults={() => setBreathingPaceViewState('past-result')}
                    onQuiz={() => setBreathingPaceViewState('quiz')}
                    onDiscussions={() => setBreathingPaceViewState('forum')}
                    onNewExperiment={() => {
                      setFormData({});
                      setBreathingPaceViewState('form');
                    }}
                  />
                )}
              </>
            ) : activity.id === 'human-performance' ? (
              <>
                {humanPerformanceViewState === 'form' && (
                  <HumanPerformanceForm value={formData} onChange={setFormData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                )}
                {humanPerformanceViewState === 'menu' && (
                  <ActivityMenuDashboard
                    quizCompleted={!!latestResult?.data?.quizCompleted}
                    onPastResults={() => setHumanPerformanceViewState('past-result')}
                    onQuiz={() => setHumanPerformanceViewState('quiz')}
                    onDiscussions={() => setHumanPerformanceViewState('forum')}
                    onNewExperiment={() => {
                      setFormData({});
                      setHumanPerformanceViewState('form');
                    }}
                  />
                )}
              </>
            ) : activity.id === 'breathing-pace' ? (
              <>
                {breathingPaceViewState === 'form' && (
                  <BreathingPaceForm value={formData} onChange={setFormData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                )}
                {breathingPaceViewState === 'menu' && (
                  <ActivityMenuDashboard
                    quizCompleted={!!latestResult?.data?.quizCompleted}
                    onPastResults={() => setBreathingPaceViewState('past-result')}
                    onQuiz={() => setBreathingPaceViewState('quiz')}
                    onDiscussions={() => setBreathingPaceViewState('forum')}
                    onNewExperiment={() => {
                      setFormData({});
                      setBreathingPaceViewState('form');
                    }}
                  />
                )}
              </>
            ) : activity.id === 'sound-pollution' ? (
              <>
                {soundPollutionViewState === 'form' && (
                  <SoundPollutionForm value={formData} onChange={setFormData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                )}
                {soundPollutionViewState === 'menu' && (
                  <ActivityMenuDashboard
                    quizCompleted={!!latestResult?.data?.quizCompleted}
                    onPastResults={() => setSoundPollutionViewState('past-result')}
                    onQuiz={() => setSoundPollutionViewState('quiz')}
                    onDiscussions={() => setSoundPollutionViewState('forum')}
                    onNewExperiment={() => {
                      setFormData({});
                      setSoundPollutionViewState('form');
                    }}
                  />
                )}
              </>
            ) : activity.id === 'earthquake' ? (
              <>
                {earthquakeViewState === 'form' && (
                  <EarthquakeForm value={formData} onChange={setFormData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                )}
                {earthquakeViewState === 'menu' && (
                  <ActivityMenuDashboard
                    quizCompleted={!!latestResult?.data?.quizCompleted}
                    onPastResults={() => setEarthquakeViewState('past-result')}
                    onQuiz={() => setEarthquakeViewState('quiz')}
                    onDiscussions={() => setEarthquakeViewState('forum')}
                    onNewExperiment={() => {
                      setFormData({});
                      setEarthquakeViewState('form');
                    }}
                  />
                )}
              </>
            ) : activity.id === 'reaction-board' ? (
              <>
                {reactionBoardViewState === 'form' && (
                  <ReactionBoardForm value={formData} onChange={setFormData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                )}
                {reactionBoardViewState === 'menu' && (
                  <ActivityMenuDashboard
                    quizCompleted={!!latestResult?.data?.quizCompleted}
                    onPastResults={() => setReactionBoardViewState('past-result')}
                    onQuiz={() => setReactionBoardViewState('quiz')}
                    onDiscussions={() => setReactionBoardViewState('forum')}
                    onNewExperiment={() => {
                      setFormData({});
                      setReactionBoardViewState('form');
                    }}
                  />
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

            {activity.id !== 'parachute-drop' && activity.id !== 'hand-fan' && activity.id !== 'sound-pollution' && activity.id !== 'earthquake' && activity.id !== 'human-performance' && activity.id !== 'breathing-pace' && activity.id !== 'reaction-board' && (
              <Button
                title={t('common.save')}
                onPress={handleSubmit}
                size="lg"
                fullWidth
                loading={isSubmitting}
                icon={<Ionicons name="save" size={18} color={colors.white} />}
              />
            )}
          </Card>

          {/* Past results & Quiz Views */}
          {activity.id === 'parachute-drop' ? (
            <View>
              {parachuteViewState === 'quiz' && latestResult && (
                 <ParachuteDropPostActivity result={latestResult} onComplete={() => setParachuteViewState('forum')} />
              )}
              {parachuteViewState === 'forum' && (
                 <ParachuteDropDiscussion />
              )}
              {parachuteViewState === 'past-result' && pastResults.length > 0 && (
                <View style={styles.resultsSection}>
                  <Text style={styles.resultsTitle}>
                    {t('activities.pastResults', { count: pastResults.length })}
                  </Text>
                  {pastResults.map((result) => (
                    <Card key={result.id} style={styles.resultCard}>
                      <View style={styles.resultHeader}>
                        <Text style={styles.resultDate}>{new Date(result.timestamp).toLocaleDateString()}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: Spacing.sm}}>
                          <Text style={{fontWeight: '700', color: colors.primary}}>
                            {t('activities.scoreLabel', { score: calculateScore(result) })}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <ParachuteDropResults data={result.data} />
                    </Card>
                  ))}
                </View>
              )}
            </View>
          ) : activity.id === 'hand-fan' ? (
            <View>
              {handFanViewState === 'quiz' && latestResult && (
                 <HandFanPostActivity result={latestResult} onComplete={() => setHandFanViewState('forum')} />
              )}
              {handFanViewState === 'forum' && (
                 <HandFanDiscussion />
              )}
              {handFanViewState === 'past-result' && pastResults.length > 0 && (
                <View style={styles.resultsSection}>
                  <Text style={styles.resultsTitle}>
                    {t('activities.pastResults', { count: pastResults.length })}
                  </Text>
                  {pastResults.map((result) => (
                    <Card key={result.id} style={styles.resultCard}>
                      <View style={styles.resultHeader}>
                        <Text style={styles.resultDate}>{new Date(result.timestamp).toLocaleDateString()}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: Spacing.sm}}>
                          <Text style={{fontWeight: '700', color: colors.primary}}>
                            {t('activities.scoreLabel', { score: calculateScore(result) })}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <HandFanResults results={[result]} />
                    </Card>
                  ))}
                </View>
              )}
            </View>
          ) : activity.id === 'sound-pollution' ? (
            <View>
              {soundPollutionViewState === 'quiz' && latestResult && (
                 <SoundPollutionPostActivity result={latestResult} onComplete={() => setSoundPollutionViewState('forum')} />
              )}
              {soundPollutionViewState === 'forum' && (
                 <SoundPollutionDiscussion />
              )}
              {soundPollutionViewState === 'past-result' && pastResults.length > 0 && (
                <View style={styles.resultsSection}>
                  <Text style={styles.resultsTitle}>
                    {t('activities.pastResults', { count: pastResults.length })}
                  </Text>
                  {pastResults.map((result) => (
                    <Card key={result.id} style={styles.resultCard}>
                      <View style={styles.resultHeader}>
                        <Text style={styles.resultDate}>{new Date(result.timestamp).toLocaleDateString()}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: Spacing.sm}}>
                          <Text style={{fontWeight: '700', color: colors.primary}}>
                            {t('activities.scoreLabel', { score: calculateScore(result) })}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <SoundPollutionResults results={[result]} />
                    </Card>
                  ))}
                </View>
              )}
            </View>
          ) : activity.id === 'earthquake' ? (
            <View>
              {earthquakeViewState === 'quiz' && latestResult && (
                 <EarthquakePostActivity result={latestResult} onComplete={() => setEarthquakeViewState('forum')} />
              )}
              {earthquakeViewState === 'forum' && (
                 <EarthquakeDiscussion />
              )}
              {earthquakeViewState === 'past-result' && pastResults.length > 0 && (
                <View style={styles.resultsSection}>
                  <Text style={styles.resultsTitle}>
                    {t('activities.pastResults', { count: pastResults.length })}
                  </Text>
                  {pastResults.map((result) => (
                    <Card key={result.id} style={styles.resultCard}>
                      <View style={styles.resultHeader}>
                        <Text style={styles.resultDate}>{new Date(result.timestamp).toLocaleDateString()}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: Spacing.sm}}>
                          <Text style={{fontWeight: '700', color: colors.primary}}>
                            {t('activities.scoreLabel', { score: calculateScore(result) })}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <EarthquakeResults results={[result]} />
                    </Card>
                  ))}
                </View>
              )}
            </View>
          ) : activity.id === 'human-performance' ? (
            <View>
              {humanPerformanceViewState === 'quiz' && latestResult && (
                 <HumanPerformancePostActivity result={latestResult} onComplete={() => setHumanPerformanceViewState('forum')} />
              )}
              {humanPerformanceViewState === 'forum' && (
                 <HumanPerformanceDiscussion />
              )}
              {humanPerformanceViewState === 'past-result' && pastResults.length > 0 && (
                <View style={styles.resultsSection}>
                  <Text style={styles.resultsTitle}>
                    {t('activities.pastResults', { count: pastResults.length })}
                  </Text>
                  {pastResults.map((result) => (
                    <Card key={result.id} style={styles.resultCard}>
                      <View style={styles.resultHeader}>
                        <Text style={styles.resultDate}>{new Date(result.timestamp).toLocaleDateString()}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: Spacing.sm}}>
                          <Text style={{fontWeight: '700', color: colors.primary}}>
                            {t('activities.scoreLabel', { score: calculateScore(result) })}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <HumanPerformanceResults data={result.data} />
                    </Card>
                  ))}
                </View>
              )}
            </View>
          ) : activity.id === 'breathing-pace' ? (
            <View>
              {breathingPaceViewState === 'quiz' && latestResult && (
                <BreathingPacePostActivity result={latestResult} onComplete={() => setBreathingPaceViewState('forum')} />
              )}
              {breathingPaceViewState === 'forum' && (
                <BreathingPaceDiscussion />
              )}
              {breathingPaceViewState === 'past-result' && pastResults.length > 0 && (
                <View style={styles.resultsSection}>
                  <Text style={styles.resultsTitle}>
                    {t('activities.pastResults', { count: pastResults.length })}
                  </Text>
                  {pastResults.map((result) => (
                    <Card key={result.id} style={styles.resultCard}>
                      <View style={styles.resultHeader}>
                        <Text style={styles.resultDate}>{new Date(result.timestamp).toLocaleDateString()}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                          <Text style={{ fontWeight: '700', color: colors.primary }}>
                            {t('activities.scoreLabel', { score: calculateScore(result) })}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <BreathingPaceResults data={result.data} />
                    </Card>
                  ))}
                </View>
              )}
            </View>
          ) : activity.id === 'reaction-board' ? (
            <View>
              {reactionBoardViewState === 'quiz' && latestResult && (
                <ReactionBoardPostActivity result={latestResult} onComplete={() => setReactionBoardViewState('forum')} />
              )}
              {reactionBoardViewState === 'forum' && (
                <ReactionBoardDiscussion />
              )}
              {reactionBoardViewState === 'past-result' && pastResults.length > 0 && (
                <View style={styles.resultsSection}>
                  <Text style={styles.resultsTitle}>
                    {t('activities.pastResults', { count: pastResults.length })}
                  </Text>
                  {pastResults.map((result) => (
                    <Card key={result.id} style={styles.resultCard}>
                      <View style={styles.resultHeader}>
                        <Text style={styles.resultDate}>{new Date(result.timestamp).toLocaleDateString()}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                          <Text style={{ fontWeight: '700', color: colors.primary }}>
                            {t('activities.scoreLabel', { score: calculateScore(result) })}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <ReactionBoardResults data={result.data as any} />
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
                        <Text style={{fontWeight: '700', color: colors.primary}}>
                          Score: {calculateScore(result)}
                        </Text>
                        <TouchableOpacity onPress={() => handleDelete(result.id)}>
                          <Ionicons name="trash-outline" size={18} color={colors.danger} />
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
