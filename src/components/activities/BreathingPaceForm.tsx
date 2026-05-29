import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Modal as RNModal,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { BreathingPaceExperiment } from './BreathingPaceExperiment';

export type BreathingConditionId = 'atRest' | 'afterJog' | 'afterStarJump';

export interface BreathingTrial {
  id: BreathingConditionId;
  label: string;
  predictedBpm: string;
  breathCount: string;
  breathsPerMinute: string;
  sensorBreathCount: string;
  movementAvg: string;
  movementPeak: string;
  recordingDuration: string;
  notes: string;
}

export interface BreathingPaceData {
  predictedMostMovement: string;
  trials: BreathingTrial[];
}

interface Props {
  value: any;
  onChange: (value: any) => void;
  onSubmit?: () => void;
}

const DEFAULT_TIME = 1800;

const CONDITIONS: { id: BreathingConditionId; label: string }[] = [
  { id: 'atRest', label: 'Breathing at Rest' },
  { id: 'afterJog', label: 'After Jog' },
  { id: 'afterStarJump', label: 'After Star Jumps' },
];

function getInitialTrials(): BreathingTrial[] {
  return CONDITIONS.map((condition) => ({
    id: condition.id,
    label: condition.label,
    predictedBpm: '',
    breathCount: '',
    breathsPerMinute: '',
    sensorBreathCount: '',
    movementAvg: '',
    movementPeak: '',
    recordingDuration: '',
    notes: '',
  }));
}

function getInitialData(): BreathingPaceData {
  return {
    predictedMostMovement: '',
    trials: getInitialTrials(),
  };
}

export function BreathingPaceForm({ value, onChange, onSubmit }: Props) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'setup' | 'predictions' | 'experiment' | 'results'>('setup');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const equipmentList = [
    t('data.activities.breathing-pace.equipmentPhone', { defaultValue: 'Mobile phone with STEMM Lab app' }),
    t('data.activities.breathing-pace.equipmentMat', { defaultValue: 'Flat surface or mat' }),
  ];
  const [checkedEquipment, setCheckedEquipment] = useState<Record<string, boolean>>({});
  const allEquipmentChecked = equipmentList.every((item) => checkedEquipment[item]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setIsLocked(true);
            setShowTimeoutModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const defaultData = getInitialData();
  const data: BreathingPaceData = {
    ...defaultData,
    ...(value as Partial<BreathingPaceData>),
    trials: (value?.trials as BreathingTrial[]) || defaultData.trials,
  };

  const startTimerOnInteraction = () => {
    if (!isTimerRunning && !isLocked && timeLeft > 0) {
      setIsTimerRunning(true);
    }
  };

  const updateData = (updates: Partial<BreathingPaceData>) => {
    if (isLocked) return;
    startTimerOnInteraction();
    onChange({ ...data, ...updates });
  };

  const updateTrial = (id: BreathingConditionId, updates: Partial<BreathingTrial>) => {
    updateData({
      trials: data.trials.map((trial) => (trial.id === id ? { ...trial, ...updates } : trial)),
    });
  };

  const isFormValid = () => {
    if (!data.predictedMostMovement) return false;
    return data.trials.every(
      (trial) => trial.predictedBpm && trial.breathsPerMinute && trial.movementAvg && trial.recordingDuration
    );
  };

  const handleComplete = () => {
    if (!isFormValid()) {
      Alert.alert(
        t('activities.incompleteTitle', { defaultValue: 'Incomplete Data' }),
        t('activities.incompleteMsg', { defaultValue: 'Please fill out all fields before submitting.' })
      );
      return;
    }
    setIsTimerRunning(false);
    setIsLocked(true);
    onSubmit?.();
  };

  const handleStartOver = () => {
    setTimeLeft(DEFAULT_TIME);
    setIsTimerRunning(false);
    setIsLocked(false);
    setShowTimeoutModal(false);
    setCheckedEquipment({});
    onChange(getInitialData());
    setActiveTab('setup');
  };

  const allRecordingsComplete = data.trials.every((trial) => trial.recordingDuration);

  const movementWinner = data.trials.reduce<{ id: BreathingConditionId; avg: number } | null>((best, trial) => {
    const avg = parseFloat(trial.movementAvg) || 0;
    if (!best || avg > best.avg) return { id: trial.id, avg };
    return best;
  }, null);

  const tabs = ['setup', 'predictions', 'experiment', 'results'] as const;

  return (
    <View style={styles.container}>
      <RNModal visible={showTimeoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('data.activities.breathing-pace.timeUpTitle', { defaultValue: 'Time is up!' })}
            </Text>
            <Text style={styles.modalText}>
              {t('data.activities.breathing-pace.timeUpText', {
                defaultValue: 'Your 30 minutes are up. The form is now locked, but you can still review your data.',
              })}
            </Text>
            <Button title={t('common.ok', { defaultValue: 'OK' })} onPress={() => setShowTimeoutModal(false)} />
          </View>
        </View>
      </RNModal>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab, !isTimerRunning && activeTab !== tab && { opacity: 0.5 }]}
              onPress={() => {
                if (!isTimerRunning) {
                  Alert.alert('Timer Required', 'Please start the timer to navigate to other sections.');
                  return;
                }
                setActiveTab(tab);
              }}
              disabled={!isTimerRunning && activeTab !== tab}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {t(`data.activities.breathing-pace.tabs.${tab}`, {
                  defaultValue: tab.charAt(0).toUpperCase() + tab.slice(1),
                })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ marginBottom: Spacing.lg }}>
          <View style={styles.stickyTimer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.timerTitle}>
                {t('data.activities.breathing-pace.timerTitle', { defaultValue: 'Activity Timer (30 min)' })}
              </Text>
              <Text style={[styles.timerDisplay, timeLeft <= 300 && { color: Colors.danger }]}>{formatTime(timeLeft)}</Text>
            </View>
            <View style={styles.timerButtons}>
              <Button
                title={isTimerRunning ? t('activities.timerPause', { defaultValue: 'Pause' }) : t('activities.timerStart', { defaultValue: 'Start' })}
                onPress={() => {
                  if (isTimerRunning) {
                    Alert.alert('Pause Timer', "Don't pause the timer unless you need to. Value integrity!", [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Pause', onPress: () => setIsTimerRunning(false) },
                    ]);
                  } else {
                    setIsTimerRunning(true);
                  }
                }}
                variant={isTimerRunning ? 'outlined' : 'primary'}
                size="sm"
                disabled={isLocked && timeLeft === 0}
              />
              <Button
                title={t('common.reset', { defaultValue: 'Reset' })}
                onPress={() => {
                  Alert.alert('Reset Timer & Data', 'Are you sure you want to start over? This wipes all data.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Start Over', style: 'destructive', onPress: handleStartOver },
                  ]);
                }}
                variant="outlined"
                size="sm"
              />
            </View>
          </View>
        </View>

        {activeTab === 'setup' && (
          <View>
            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>{t('activities.equipmentTitle', { defaultValue: 'Equipment Needed' })}</Text>
              {equipmentList.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.checklistItem}
                  onPress={() => {
                    if (!isLocked) {
                      setCheckedEquipment((prev) => ({ ...prev, [item]: !prev[item] }));
                      if (!isTimerRunning) setIsTimerRunning(true);
                    }
                  }}
                  disabled={isLocked}
                >
                  <View style={[styles.checkbox, checkedEquipment[item] && styles.checkboxChecked]}>
                    {checkedEquipment[item] && <Ionicons name="checkmark" size={16} color={Colors.white} />}
                  </View>
                  <Text style={styles.checklistText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </Card>

            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>{t('activities.instructionsTitle', { defaultValue: 'Instructions' })}</Text>
              <Text style={styles.instructionText}>1. Place the phone gently on your chest.</Text>
              <Text style={styles.instructionText}>2. Record breathing at rest for 1 minute. Count each breath.</Text>
              <Text style={styles.instructionText}>3. Jog on the spot for 1 minute, then record breathing again.</Text>
              <Text style={styles.instructionText}>4. Do 100 star jumps, then record breathing again.</Text>
              <Text style={styles.instructionText}>5. Compare breaths per minute and chest movement. Complete the quiz.</Text>
              <Image
                source={require('../../../assets/images/activity7illustration.jpeg')}
                style={styles.illustration}
                resizeMode="contain"
              />
            </Card>

            <Button title={t('common.next', { defaultValue: 'Next' })} onPress={() => setActiveTab('predictions')} disabled={!allEquipmentChecked} />
          </View>
        )}

        {activeTab === 'predictions' && (
          <View>
            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>
                {t('data.activities.breathing-pace.predictionsTitle', { defaultValue: 'Questions Before the Experiment' })}
              </Text>

              <Select
                label={t('data.activities.breathing-pace.predictMostMovement', {
                  defaultValue: 'Predict which exercise makes the phone move the most on your chest',
                })}
                value={data.predictedMostMovement}
                options={['After Jog', 'After Star Jumps']}
                onValueChange={(v) => updateData({ predictedMostMovement: v })}
                disabled={isLocked}
              />

              <Text style={styles.subSectionTitle}>
                {t('data.activities.breathing-pace.predictBpmTitle', { defaultValue: 'Predict breaths per minute' })}
              </Text>

              {data.trials.map((trial) => (
                <Input
                  key={trial.id}
                  label={trial.label}
                  value={trial.predictedBpm}
                  onChangeText={(v) => updateTrial(trial.id, { predictedBpm: v })}
                  keyboardType="numeric"
                  editable={!isLocked}
                  onLightSurface
                  placeholder="breaths/min"
                />
              ))}
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => setActiveTab('setup')} />
              <Button title={t('common.next', { defaultValue: 'Next' })} onPress={() => setActiveTab('experiment')} />
            </View>
          </View>
        )}

        {activeTab === 'experiment' && (
          <View>
            <BreathingPaceExperiment
              trials={data.trials}
              disabled={isLocked}
              onUpdateTrial={updateTrial}
              onAllComplete={() => setActiveTab('results')}
            />

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => setActiveTab('predictions')} />
              <Button title={t('common.next', { defaultValue: 'Next' })} onPress={() => setActiveTab('results')} disabled={!allRecordingsComplete} />
            </View>
          </View>
        )}

        {activeTab === 'results' && (
          <View>
            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>
                {t('data.activities.breathing-pace.resultsTitle', { defaultValue: 'Results' })}
              </Text>

              <View style={styles.tableRowHeader}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Condition</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Pred. BPM</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Actual BPM</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Movement</Text>
              </View>

              {data.trials.map((trial) => (
                <View key={trial.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{trial.label}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{trial.predictedBpm || '—'}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{trial.breathsPerMinute || '—'}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{trial.movementAvg ? `${trial.movementAvg} cm` : '—'}</Text>
                </View>
              ))}

              {movementWinner && data.predictedMostMovement && (
                <View style={styles.predictionCheck}>
                  <Text style={styles.predictionCheckTitle}>Most chest movement:</Text>
                  <Text style={styles.predictionCheckText}>You predicted: {data.predictedMostMovement}</Text>
                  <Text style={styles.predictionCheckText}>
                    Highest movement: {CONDITIONS.find((condition) => condition.id === movementWinner.id)?.label} ({movementWinner.avg.toFixed(1)} cm avg)
                  </Text>
                  <Text style={styles.predictionResultText}>
                    {data.predictedMostMovement === CONDITIONS.find((condition) => condition.id === movementWinner.id)?.label
                      ? 'Your movement prediction matched the results.'
                      : 'Your movement prediction differed from the results.'}
                  </Text>
                </View>
              )}

              <Text style={styles.subSectionTitle}>Outcome details</Text>
              {data.trials.map((trial) => (
                <View key={`${trial.id}-detail`} style={styles.detailBlock}>
                  <Text style={styles.detailTitle}>{trial.label}</Text>
                  <Text style={styles.detailText}>
                    {trial.recordingDuration || '60'}s recording | {trial.breathsPerMinute || '—'} breaths/min | movement {trial.movementAvg || '—'} cm avg, {trial.movementPeak || '—'} cm peak
                  </Text>
                  <Input
                    label={t('common.notes')}
                    value={trial.notes}
                    onChangeText={(v) => updateTrial(trial.id, { notes: v })}
                    multiline
                    numberOfLines={2}
                    editable={!isLocked}
                    onLightSurface
                    placeholder="Your answer..."
                  />
                </View>
              ))}
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => setActiveTab('experiment')} />
              <Button title={t('activities.complete', { defaultValue: 'Complete Activity' })} onPress={handleComplete} variant="primary" />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxxl },
  pageCard: { marginBottom: Spacing.md, padding: Spacing.xl },
  sectionTitle: { ...Typography.h2, marginBottom: Spacing.md },
  subSectionTitle: { ...Typography.h3, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  tabContainer: { borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  tabScroll: { paddingHorizontal: Spacing.md },
  tab: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: Colors.primary },
  tabText: { ...Typography.body, color: Colors.textSecondary, fontWeight: '500' },
  activeTabText: { color: Colors.primary, fontWeight: '700' },
  stickyTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timerTitle: { ...Typography.caption, fontWeight: '700', color: Colors.textSecondary, marginBottom: 2 },
  timerDisplay: { fontSize: 24, fontWeight: '700', color: Colors.primary, fontVariant: ['tabular-nums'] },
  timerButtons: { flexDirection: 'row', gap: Spacing.sm },
  checklistItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.md },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary },
  checklistText: { ...Typography.body, flex: 1 },
  instructionText: { ...Typography.body, marginBottom: Spacing.sm },
  illustration: { width: '100%', height: 200, marginTop: Spacing.md, borderRadius: BorderRadius.md },
  wizardNavBoth: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableCell: { ...Typography.bodySmall },
  predictionCheck: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
  },
  predictionCheckTitle: { ...Typography.label, marginBottom: Spacing.xs },
  predictionCheckText: { ...Typography.bodySmall, marginBottom: 2 },
  predictionResultText: { ...Typography.bodySmall, fontWeight: '700', marginTop: Spacing.xs, color: Colors.primary },
  detailBlock: { marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  detailTitle: { ...Typography.label, marginBottom: Spacing.xs },
  detailText: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.sm, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.xl },
  modalContent: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  modalTitle: { ...Typography.h2, marginBottom: Spacing.sm },
  modalText: { ...Typography.body, marginBottom: Spacing.lg, color: Colors.textSecondary },
});
