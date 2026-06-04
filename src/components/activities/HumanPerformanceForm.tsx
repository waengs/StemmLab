import React, { useState, useEffect, useMemo } from 'react';
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
import { ActivityInstructionsList } from './ActivityInstructionsList';
import { actT } from '../../utils/activityContent';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spacing, Typography, BorderRadius  } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useRequireAuth } from '../../stores';
import { HumanPerformanceExperiment } from './HumanPerformanceExperiment';
import {
  MOVEMENT_IDS,
  getMovementLabel,
  movementIdFromLabel,
  resolveMovementLabel,
  type MovementId,
} from '../../utils/humanPerformanceMovements';

export type { MovementId };

export interface MovementTrial {
  id: MovementId;
  label: string;
  predictedVibration: string;
  vibrationAvg: string;
  vibrationAvgWithFeedback: string;
  speedAvg: string;
  smoothness: string;
  rangeOfMotion: string;
  movementTime: string;
  manualSpeed: string;
}

export interface HumanPerformanceData {
  predictedHardestMovement: string;
  usedInstantCalc: boolean;
  trials: MovementTrial[];
}

interface Props {
  value: any;
  onChange: (value: any) => void;
  onSubmit?: () => void;
}

const DEFAULT_TIME = 1800; // 30 minutes

function getInitialTrials(t: (key: string) => string): MovementTrial[] {
  return MOVEMENT_IDS.map((id) => ({
    id,
    label: getMovementLabel(id, t),
    predictedVibration: '',
    vibrationAvg: '',
    vibrationAvgWithFeedback: '',
    speedAvg: '',
    smoothness: '',
    rangeOfMotion: '',
    movementTime: '',
    manualSpeed: '',
  }));
}

function getInitialData(t: (key: string) => string): HumanPerformanceData {
  return {
    predictedHardestMovement: '',
    usedInstantCalc: false,
    trials: getInitialTrials(t),
  };
}

function useHumanPerformanceFormStyles() {
  return useThemedStyles(({ colors, typography }) => ({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxxl },
  pageCard: { marginBottom: Spacing.md, padding: Spacing.xl },
  sectionTitle: { ...typography.h2, marginBottom: Spacing.md },
  subSectionTitle: { ...typography.h3, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  tabContainer: { borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  tabScroll: { paddingHorizontal: Spacing.md },
  tab: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: colors.primary },
  tabText: { ...typography.body, color: colors.textSecondary, fontWeight: '500' },
  activeTabText: { color: colors.primary, fontWeight: '700' },
  stickyTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timerTitle: { ...typography.caption, fontWeight: '700', color: colors.textSecondary, marginBottom: 2 },
  timerDisplay: { fontSize: 24, fontWeight: '700', color: colors.primary, fontVariant: ['tabular-nums'] },
  timerButtons: { flexDirection: 'row', gap: Spacing.sm },
  checklistItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.md },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary },
  checklistText: { ...typography.body, flex: 1 },
  instructionText: { ...typography.body, marginBottom: Spacing.sm },
  illustration: { width: '100%', height: 200, marginTop: Spacing.md, borderRadius: BorderRadius.md },
  wizardNavBoth: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md },
  hintText: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: Spacing.lg },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: Spacing.sm,
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: { ...typography.bodySmall, color: colors.textSecondary, paddingRight: Spacing.sm },
  predictionCheck: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: colors.background,
    borderRadius: BorderRadius.md,
  },
  predictionCheckTitle: { ...typography.label, marginBottom: Spacing.sm },
  predictionCheckText: { ...typography.bodySmall, marginBottom: Spacing.xs },
  predictionResultText: { ...typography.bodySmall, fontWeight: '600', marginTop: Spacing.sm },
  instructionsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  instructionsTitle: { ...typography.h3, color: colors.primary },
  formulaBox: { backgroundColor: colors.primary + '10', padding: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.sm },
  formulaText: { ...typography.bodySmall, color: colors.primary },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  tableTitle: { ...typography.h3 },
  calcBlock: { marginBottom: Spacing.lg, padding: Spacing.md, backgroundColor: colors.background, borderRadius: BorderRadius.md },
  calcTitle: { ...typography.label, marginBottom: Spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: Spacing.xl },
  modalContent: { backgroundColor: colors.surface, padding: Spacing.xl, borderRadius: BorderRadius.lg, alignItems: 'center' },
  modalTitle: { ...typography.h2, color: colors.danger, marginBottom: Spacing.sm },
  modalText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  }));
}

export function HumanPerformanceForm({
  value,
  onChange,
  onSubmit,
}: Props) {
  const styles = useHumanPerformanceFormStyles();
  const { colors } = useTheme();

  const { t } = useTranslation();
  const { team } = useRequireAuth();

  const isLowerHighSchool =
    team?.gradeLevel === t('setup.gradeLowerHigh') ||
    team?.gradeLevel === 'Lower High School (Grades 7–9)' ||
    (team?.gradeLevel?.includes('High') && !team?.gradeLevel?.includes('Upper'));

  const [activeTab, setActiveTab] = useState<'setup' | 'predictions' | 'experiment' | 'results' | 'calculations'>('setup');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const equipmentList = useMemo(
    () => [
      t('data.activities.human-performance.equipmentPhone'),
      t('data.activities.human-performance.equipmentSpace'),
    ],
    [t]
  );
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

  const defaultData = getInitialData(t);
  const data: HumanPerformanceData = {
    ...defaultData,
    ...(value as Partial<HumanPerformanceData>),
    trials: (value?.trials as MovementTrial[]) || defaultData.trials,
  };

  const predictedHardestId = useMemo(() => {
    if (!data.predictedHardestMovement) return '';
    const id = movementIdFromLabel(data.predictedHardestMovement, t);
    return id ?? data.predictedHardestMovement;
  }, [data.predictedHardestMovement, t]);

  const movementOptionLabels = useMemo(
    () => MOVEMENT_IDS.map((id) => getMovementLabel(id, t)),
    [t]
  );

  const updateData = (updates: Partial<HumanPerformanceData>) => onChange({ ...data, ...updates });

  const updateTrial = (id: MovementId, updates: Partial<MovementTrial>) => {
    const newTrials = data.trials.map((trial) => (trial.id === id ? { ...trial, ...updates } : trial));
    updateData({ trials: newTrials });
  };

  const handleInstantCalc = () => {
    if (isLocked) return;
    Alert.alert(
      t('activities.calcWarningTitle', { defaultValue: 'Instant Calculation' }),
      t('activities.calcWarningText', { defaultValue: 'Using instant calculation will result in a 20 point deduction. Are you sure?' }),
      [
        { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('common.proceed', { defaultValue: 'Proceed' }),
          style: 'destructive',
          onPress: () => {
            const calculatedTrials = data.trials.map((trial) => {
              const rom = parseFloat(trial.rangeOfMotion) || 0;
              const time = parseFloat(trial.movementTime) || 10;
              const speed = time > 0 ? (rom / 100 / time).toFixed(2) : '';
              return { ...trial, manualSpeed: speed };
            });
            updateData({ usedInstantCalc: true, trials: calculatedTrials });
          },
        },
      ]
    );
  };

  const validateSpeed = (manual: string, trial: MovementTrial): boolean | null => {
    if (!manual) return null;
    const rom = parseFloat(trial.rangeOfMotion) || 0;
    const time = parseFloat(trial.movementTime) || 10;
    const expected = rom / 100 / time;
    const actual = parseFloat(manual);
    if (isNaN(actual)) return false;
    return Math.abs(expected - actual) <= Math.max(0.05, expected * 0.15);
  };

  const isFormValid = () => {
    if (!data.predictedHardestMovement) return false;
    for (const trial of data.trials) {
      if (!trial.predictedVibration || !trial.vibrationAvg || !trial.vibrationAvgWithFeedback) {
        return false;
      }
      if (isLowerHighSchool && !trial.manualSpeed) return false;
    }
    return true;
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
    onChange(getInitialData(t));
    setActiveTab('setup');
  };

  const tabs = [
    'setup',
    'predictions',
    'experiment',
    'results',
    ...(isLowerHighSchool ? ['calculations'] : []),
  ] as const;

  const allRecordingsComplete = data.trials.every((t) => t.vibrationAvg && t.vibrationAvgWithFeedback);

  const hardestActual = data.trials.reduce<{ id: MovementId; avg: number } | null>((best, trial) => {
    const avg = parseFloat(trial.vibrationAvg) || 0;
    if (!best || avg > best.avg) return { id: trial.id, avg };
    return best;
  }, null);

  return (
    <View style={styles.container}>
      <RNModal visible={showTimeoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('data.activities.human-performance.timeUpTitle', { defaultValue: 'Time is up!' })}</Text>
            <Text style={styles.modalText}>
              {t('data.activities.human-performance.timeUpText', {
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
                  Alert.alert(t('activities.timerRequiredTitle'), t('activities.timerRequiredMsg'));
                  return;
                }
                setActiveTab(tab);
              }}
              disabled={!isTimerRunning && activeTab !== tab}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {t(`data.activities.human-performance.tabs.${tab}`, {
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
                {t('data.activities.human-performance.timerTitle', { defaultValue: 'Activity Timer (30 min)' })}
              </Text>
              <Text style={[styles.timerDisplay, timeLeft <= 300 && { color: colors.danger }]}>{formatTime(timeLeft)}</Text>
            </View>
            <View style={styles.timerButtons}>
              <Button
                title={isTimerRunning ? t('activities.timerPause', { defaultValue: 'Pause' }) : t('activities.timerStart', { defaultValue: 'Start' })}
                onPress={() => {
                  if (isTimerRunning) {
                    Alert.alert(
                      t('data.activities.parachute-drop.timerPauseTitle'),
                      t('data.activities.parachute-drop.timerPauseWarning'),
                      [
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
                  Alert.alert(t('activities.resetTimerTitle'), t('activities.resetTimerMsg'), [
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
                    {checkedEquipment[item] && <Ionicons name="checkmark" size={16} color={colors.white} />}
                  </View>
                  <Text style={styles.checklistText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </Card>

            <Card style={styles.pageCard}>
              <ActivityInstructionsList
                activityId="human-performance"
                textStyle={styles.instructionText}
                titleStyle={styles.sectionTitle}
              />
              <Image
                source={require('../../../assets/images/activity5illustration.jpeg')}
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
                {t('data.activities.human-performance.predictionsTitle', { defaultValue: 'Questions Before the Experiment' })}
              </Text>

              <Select
                label={t('data.activities.human-performance.predictHardest', {
                  defaultValue: 'Predict what movement is the hardest to keep the vibration low',
                })}
                value={predictedHardestId}
                options={[...MOVEMENT_IDS]}
                optionLabels={movementOptionLabels}
                onValueChange={(v) => updateData({ predictedHardestMovement: v })}
                disabled={isLocked}
              />

              <Text style={styles.subSectionTitle}>
                {t('data.activities.human-performance.predictVibration', {
                  defaultValue: 'Predict Phone Vibration Sensor result (cm)',
                })}
              </Text>

              {data.trials.map((trial) => (
                <Input
                  key={trial.id}
                  label={getMovementLabel(trial.id, t)}
                  value={trial.predictedVibration}
                  onChangeText={(v) => updateTrial(trial.id, { predictedVibration: v })}
                  keyboardType="numeric"
                  editable={!isLocked}
                  onLightSurface
                  placeholder="cm"
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
            <HumanPerformanceExperiment
              trials={data.trials}
              disabled={isLocked}
              onUpdateTrial={updateTrial}
              onAllComplete={() => setActiveTab('results')}
            />

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => setActiveTab('predictions')} />
              <Button
                title={t('common.next', { defaultValue: 'Next' })}
                onPress={() => setActiveTab('results')}
                disabled={!allRecordingsComplete}
              />
            </View>
          </View>
        )}

        {activeTab === 'results' && (
          <View>
            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>
                {t('data.activities.human-performance.resultsTitle', { defaultValue: 'Results' })}
              </Text>

              <View style={styles.tableRowHeader}>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {t('data.activities.human-performance.resultsTable.movement')}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                  {t('data.activities.human-performance.resultsTable.time')}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                  {t('data.activities.human-performance.resultsTable.predicted')}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                  {t('data.activities.human-performance.resultsTable.actual')}
                </Text>
              </View>

              {data.trials.map((trial) => (
                <View key={trial.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{getMovementLabel(trial.id, t)}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{trial.movementTime || '—'}s</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{trial.predictedVibration || '—'} cm</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{trial.vibrationAvg || '—'} cm</Text>
                </View>
              ))}

              {hardestActual && predictedHardestId && (
                <View style={styles.predictionCheck}>
                  <Text style={styles.predictionCheckTitle}>
                    {t('data.activities.human-performance.resultsTable.hardestPredictionTitle')}
                  </Text>
                  <Text style={styles.predictionCheckText}>
                    {t('data.activities.human-performance.resultsTable.youPredicted', {
                      movement: resolveMovementLabel(data.predictedHardestMovement, t),
                    })}
                  </Text>
                  <Text style={styles.predictionCheckText}>
                    {t('data.activities.human-performance.resultsTable.actualHighest', {
                      movement: getMovementLabel(hardestActual.id, t),
                      value: hardestActual.avg.toFixed(1),
                    })}
                  </Text>
                  <Text style={styles.predictionResultText}>
                    {predictedHardestId === hardestActual.id
                      ? t('data.activities.human-performance.resultsTable.predictionMatched')
                      : t('data.activities.human-performance.resultsTable.predictionDiffered')}
                  </Text>
                </View>
              )}
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => setActiveTab('experiment')} />
              {isLowerHighSchool ? (
                <Button title={t('common.next', { defaultValue: 'Next' })} onPress={() => setActiveTab('calculations')} />
              ) : (
                <Button title={t('activities.complete', { defaultValue: 'Complete Activity' })} onPress={handleComplete} variant="primary" />
              )}
            </View>
          </View>
        )}

        {isLowerHighSchool && activeTab === 'calculations' && (
          <View>
            <Card style={styles.pageCard}>
              <View style={styles.instructionsHeader}>
                <Ionicons name="calculator" size={24} color={colors.primary} />
                <Text style={styles.instructionsTitle}>{actT('shared.formulasTitle')}</Text>
              </View>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>{t('data.activities.human-performance.formulaSpeed')}</Text>
                <Text style={[styles.formulaText, { marginTop: Spacing.xs }]}>
                  {t('data.activities.human-performance.formulaSpeedHint')}
                </Text>
              </View>
            </Card>

            <Card style={styles.pageCard}>
              <Text style={styles.tableTitle}>{t('data.activities.human-performance.calculateSpeedTitle')}</Text>
              {!isLocked && (
                <Button
                  title={t('data.activities.parachute-drop.btnInstantCalc')}
                  onPress={handleInstantCalc}
                  variant="outlined"
                  size="sm"
                  style={{ alignSelf: 'flex-start', marginBottom: Spacing.lg }}
                />
              )}

              {data.trials.map((trial) => {
                const isValid = validateSpeed(trial.manualSpeed, trial);
                return (
                  <View key={trial.id} style={styles.calcBlock}>
                    <Text style={styles.calcTitle}>
                      {t('data.activities.human-performance.calcTrialRom', {
                        label: getMovementLabel(trial.id, t),
                        rom: trial.rangeOfMotion || '0',
                        time: trial.movementTime || '10',
                      })}
                    </Text>
                    <Input
                      label={t('data.activities.human-performance.calculatedSpeedLabel')}
                      value={trial.manualSpeed}
                      onChangeText={(v) => updateTrial(trial.id, { manualSpeed: v })}
                      keyboardType="numeric"
                      editable={!isLocked}
                      onLightSurface
                      error={isValid === false ? t('activities.incorrectCalculation') : undefined}
                    />
                  </View>
                );
              })}
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => setActiveTab('results')} />
              <Button title={t('activities.complete', { defaultValue: 'Complete Activity' })} onPress={handleComplete} variant="primary" />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}


