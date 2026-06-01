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
import { Card, Chip, Input, Button, Select, ParachuteDropForm, ParachuteDropPostActivity, ParachuteDropResults, ParachuteDropDiscussion, HandFanForm, HandFanPostActivity, HandFanResults, HandFanDiscussion, SoundPollutionForm, SoundPollutionResults, SoundPollutionPostActivity, SoundPollutionDiscussion, EarthquakeForm, EarthquakeResults, EarthquakePostActivity, EarthquakeDiscussion, HumanPerformanceForm, HumanPerformancePostActivity, HumanPerformanceResults, HumanPerformanceDiscussion, BreathingPaceForm, BreathingPacePostActivity, BreathingPaceResults, BreathingPaceDiscussion, ReactionBoardForm, ReactionBoardPostActivity, ReactionBoardResults, ReactionBoardDiscussion } from '../../../src/components';
import { ACTIVITIES } from '../../../src/types';
import { hasProfanity } from '../../../src/utils/profanity';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../../src/theme';
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
              <Ionicons name="information-circle" size={18} color={Colors.primary} />
              <Text style={styles.alertText}>
                {activity.id === 'parachute-drop' ? t('data.activities.parachute-drop.overview') : activity.id === 'human-performance' ? t('data.activities.human-performance.overview') : activity.id === 'breathing-pace' ? t('data.activities.breathing-pace.overview') : activity.id === 'reaction-board' ? t('data.activities.reaction-board.overview') : t('activities.infoAlert')}
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
                      title={latestResult?.data?.quizCompleted ? "View Quiz" : "Do Quiz"} 
                      onPress={() => setParachuteViewState('quiz')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="school" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title="Discussions" 
                      onPress={() => setParachuteViewState('forum')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="chatbubbles" size={18} color={Colors.white} />} 
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
            ) : activity.id === 'hand-fan' ? (
              <>
                {handFanViewState === 'form' && (
                  <HandFanForm value={formData} onChange={setFormData} onSubmit={handleSubmit} />
                )}
                {handFanViewState === 'menu' && (
                  <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Activity Dashboard</Text>
                    <Button 
                      title="View Past Results" 
                      onPress={() => setHandFanViewState('past-result')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="time" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title={latestResult?.data?.quizCompleted ? "View Quiz" : "Do Quiz"} 
                      onPress={() => setHandFanViewState('quiz')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="school" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title="Discussions" 
                      onPress={() => setHandFanViewState('forum')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="chatbubbles" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title="Do Another Experiment" 
                      onPress={() => {
                        setFormData({});
                        setHandFanViewState('form');
                      }} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="flask" size={18} color={Colors.primary} />} 
                      variant="outlined" 
                    />
                  </View>
                )}
              </>
            ) : activity.id === 'human-performance' ? (
              <>
                {humanPerformanceViewState === 'form' && (
                  <HumanPerformanceForm value={formData} onChange={setFormData} onSubmit={handleSubmit} />
                )}
                {humanPerformanceViewState === 'menu' && (
                  <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Activity Dashboard</Text>
                    <Button 
                      title="View Past Results" 
                      onPress={() => setHumanPerformanceViewState('past-result')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="time" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title={latestResult?.data?.quizCompleted ? "View Quiz" : "Do Quiz"} 
                      onPress={() => setHumanPerformanceViewState('quiz')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="school" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title="Discussions" 
                      onPress={() => setHumanPerformanceViewState('forum')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="chatbubbles" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title="Do Another Experiment" 
                      onPress={() => {
                        setFormData({});
                        setHumanPerformanceViewState('form');
                      }} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="flask" size={18} color={Colors.primary} />} 
                      variant="outlined" 
                    />
                  </View>
                )}
              </>
            ) : activity.id === 'breathing-pace' ? (
              <>
                {breathingPaceViewState === 'form' && (
                  <BreathingPaceForm value={formData} onChange={setFormData} onSubmit={handleSubmit} />
                )}
                {breathingPaceViewState === 'menu' && (
                  <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Activity Dashboard</Text>
                    <Button
                      title="View Past Results"
                      onPress={() => setBreathingPaceViewState('past-result')}
                      style={styles.menuBtn}
                      icon={<Ionicons name="time" size={18} color={Colors.white} />}
                    />
                    <Button
                      title={latestResult?.data?.quizCompleted ? 'View Quiz' : 'Do Quiz'}
                      onPress={() => setBreathingPaceViewState('quiz')}
                      style={styles.menuBtn}
                      icon={<Ionicons name="school" size={18} color={Colors.white} />}
                    />
                    <Button
                      title="Discussions"
                      onPress={() => setBreathingPaceViewState('forum')}
                      style={styles.menuBtn}
                      icon={<Ionicons name="chatbubbles" size={18} color={Colors.white} />}
                    />
                    <Button
                      title="Do Another Experiment"
                      onPress={() => {
                        setFormData({});
                        setBreathingPaceViewState('form');
                      }}
                      style={styles.menuBtn}
                      icon={<Ionicons name="flask" size={18} color={Colors.primary} />}
                      variant="outlined"
                    />
                  </View>
                )}
              </>
            ) : activity.id === 'human-performance' ? (
              <>
                {humanPerformanceViewState === 'form' && (
                  <HumanPerformanceForm value={formData} onChange={setFormData} onSubmit={handleSubmit} />
                )}
                {humanPerformanceViewState === 'menu' && (
                  <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Activity Dashboard</Text>
                    <Button 
                      title="View Past Results" 
                      onPress={() => setHumanPerformanceViewState('past-result')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="time" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title={latestResult?.data?.quizCompleted ? "View Quiz" : "Do Quiz"} 
                      onPress={() => setHumanPerformanceViewState('quiz')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="school" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title="Discussions" 
                      onPress={() => setHumanPerformanceViewState('forum')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="chatbubbles" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title="Do Another Experiment" 
                      onPress={() => {
                        setFormData({});
                        setHumanPerformanceViewState('form');
                      }} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="flask" size={18} color={Colors.primary} />} 
                      variant="outlined" 
                    />
                  </View>
                )}
              </>
            ) : activity.id === 'breathing-pace' ? (
              <>
                {breathingPaceViewState === 'form' && (
                  <BreathingPaceForm value={formData} onChange={setFormData} onSubmit={handleSubmit} />
                )}
                {breathingPaceViewState === 'menu' && (
                  <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Activity Dashboard</Text>
                    <Button
                      title="View Past Results"
                      onPress={() => setBreathingPaceViewState('past-result')}
                      style={styles.menuBtn}
                      icon={<Ionicons name="time" size={18} color={Colors.white} />}
                    />
                    <Button
                      title={latestResult?.data?.quizCompleted ? 'View Quiz' : 'Do Quiz'}
                      onPress={() => setBreathingPaceViewState('quiz')}
                      style={styles.menuBtn}
                      icon={<Ionicons name="school" size={18} color={Colors.white} />}
                    />
                    <Button
                      title="Discussions"
                      onPress={() => setBreathingPaceViewState('forum')}
                      style={styles.menuBtn}
                      icon={<Ionicons name="chatbubbles" size={18} color={Colors.white} />}
                    />
                    <Button
                      title="Do Another Experiment"
                      onPress={() => {
                        setFormData({});
                        setBreathingPaceViewState('form');
                      }}
                      style={styles.menuBtn}
                      icon={<Ionicons name="flask" size={18} color={Colors.primary} />}
                      variant="outlined"
                    />
                  </View>
                )}
              </>
            ) : activity.id === 'sound-pollution' ? (
              <>
                {soundPollutionViewState === 'form' && (
                  <SoundPollutionForm value={formData} onChange={setFormData} onSubmit={handleSubmit} />
                )}
                {soundPollutionViewState === 'menu' && (
                  <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Activity Dashboard</Text>
                    <Button 
                      title="View Past Results" 
                      onPress={() => setSoundPollutionViewState('past-result')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="time" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title={latestResult?.data?.quizCompleted ? "View Quiz" : "Do Quiz"} 
                      onPress={() => setSoundPollutionViewState('quiz')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="school" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title="Discussions" 
                      onPress={() => setSoundPollutionViewState('forum')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="chatbubbles" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title="Do Another Experiment" 
                      onPress={() => {
                        setFormData({});
                        setSoundPollutionViewState('form');
                      }} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="flask" size={18} color={Colors.primary} />} 
                      variant="outlined" 
                    />
                  </View>
                )}
              </>
            ) : activity.id === 'earthquake' ? (
              <>
                {earthquakeViewState === 'form' && (
                  <EarthquakeForm value={formData} onChange={setFormData} onSubmit={handleSubmit} />
                )}
                {earthquakeViewState === 'menu' && (
                  <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Activity Dashboard</Text>
                    <Button 
                      title="View Past Results" 
                      onPress={() => setEarthquakeViewState('past-result')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="time" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title={latestResult?.data?.quizCompleted ? "View Quiz" : "Do Quiz"} 
                      onPress={() => setEarthquakeViewState('quiz')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="school" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title="Discussions" 
                      onPress={() => setEarthquakeViewState('forum')} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="chatbubbles" size={18} color={Colors.white} />} 
                    />
                    <Button 
                      title="Do Another Experiment" 
                      onPress={() => {
                        setFormData({});
                        setEarthquakeViewState('form');
                      }} 
                      style={styles.menuBtn} 
                      icon={<Ionicons name="flask" size={18} color={Colors.primary} />} 
                      variant="outlined" 
                    />
                  </View>
                )}
              </>
            ) : activity.id === 'reaction-board' ? (
              <>
                {reactionBoardViewState === 'form' && (
                  <ReactionBoardForm value={formData} onChange={setFormData} onSubmit={handleSubmit} />
                )}
                {reactionBoardViewState === 'menu' && (
                  <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Activity Dashboard</Text>
                    <Button
                      title="View Past Results"
                      onPress={() => setReactionBoardViewState('past-result')}
                      style={styles.menuBtn}
                      icon={<Ionicons name="time" size={18} color={Colors.white} />}
                    />
                    <Button
                      title={latestResult?.data?.quizCompleted ? 'View Quiz' : 'Do Quiz'}
                      onPress={() => setReactionBoardViewState('quiz')}
                      style={styles.menuBtn}
                      icon={<Ionicons name="school" size={18} color={Colors.white} />}
                    />
                    <Button
                      title="Discussions"
                      onPress={() => setReactionBoardViewState('forum')}
                      style={styles.menuBtn}
                      icon={<Ionicons name="chatbubbles" size={18} color={Colors.white} />}
                    />
                    <Button
                      title="Do Another Experiment"
                      onPress={() => {
                        setFormData({});
                        setReactionBoardViewState('form');
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

            {activity.id !== 'parachute-drop' && activity.id !== 'hand-fan' && activity.id !== 'sound-pollution' && activity.id !== 'earthquake' && activity.id !== 'human-performance' && activity.id !== 'breathing-pace' && activity.id !== 'reaction-board' && (
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
                          <Text style={{fontWeight: '700', color: Colors.primary}}>
                            Score: {calculateScore(result)}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
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
                          <Text style={{fontWeight: '700', color: Colors.primary}}>
                            Score: {calculateScore(result)}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
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
                          <Text style={{fontWeight: '700', color: Colors.primary}}>
                            Score: {calculateScore(result)}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
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
                          <Text style={{fontWeight: '700', color: Colors.primary}}>
                            Score: {calculateScore(result)}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
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
                          <Text style={{fontWeight: '700', color: Colors.primary}}>
                            Score: {calculateScore(result)}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
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
                          <Text style={{ fontWeight: '700', color: Colors.primary }}>
                            Score: {calculateScore(result)}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
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
                          <Text style={{ fontWeight: '700', color: Colors.primary }}>
                            Score: {calculateScore(result)}
                          </Text>
                          <TouchableOpacity onPress={() => handleDelete(result.id)}>
                            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
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
