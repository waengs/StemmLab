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
import { useRequireAuth } from '../../stores';
import { HumanPerformanceExperiment } from './HumanPerformanceExperiment';

export type MovementId = 'circle' | 'figure8' | 'upDown' | 'sideToSide';

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

const MOVEMENTS: { id: MovementId; label: string }[] = [
  { id: 'circle', label: 'Circle' },
  { id: 'figure8', label: 'Figure of 8' },
  { id: 'upDown', label: 'Up and down' },
  { id: 'sideToSide', label: 'Side to side' },
];

function getInitialTrials(): MovementTrial[] {
  return MOVEMENTS.map((m) => ({
    id: m.id,
    label: m.label,
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

function getInitialData(): HumanPerformanceData {
  return {
    predictedHardestMovement: '',
    usedInstantCalc: false,
    trials: getInitialTrials(),
  };
}

export function HumanPerformanceForm({ value, onChange, onSubmit }: Props) {
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

  const equipmentList = ['Mobile phone with STEMM Lab app', 'Open space to move safely'];
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
  const data: HumanPerformanceData = {
    ...defaultData,
    ...(value as Partial<HumanPerformanceData>),
    trials: (value?.trials as MovementTrial[]) || defaultData.trials,
  };

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
    onChange(getInitialData());
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
                  Alert.alert('Timer Required', 'Please start the timer to navigate to other sections.');
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
              <Text style={styles.instructionText}>1. Hold the phone firmly in one hand. Activate the App vibration sensor.</Text>
              <Text style={styles.instructionText}>2. Round 1: record each movement silently (sensor only).</Text>
              <Text style={styles.instructionText}>3. Round 2: repeat with live feedback — screen turns red and says &quot;Slow&quot; if too shaky.</Text>
              <Text style={styles.instructionText}>4. Review smoothness and range-of-motion data; calculate speed yourself.</Text>
              <Text style={styles.instructionText}>5. Upload results and complete the post-experiment quiz.</Text>
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
                value={data.predictedHardestMovement}
                options={MOVEMENTS.map((m) => m.label)}
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
                  label={trial.label}
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
                <Text style={[styles.tableCell, { flex: 2 }]}>Movement</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Time</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Predicted</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Actual</Text>
              </View>

              {data.trials.map((trial) => (
                <View key={trial.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{trial.label}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{trial.movementTime || '—'}s</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{trial.predictedVibration || '—'} cm</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{trial.vibrationAvg || '—'} cm</Text>
                </View>
              ))}

              {hardestActual && data.predictedHardestMovement && (
                <View style={styles.predictionCheck}>
                  <Text style={styles.predictionCheckTitle}>Hardest movement prediction:</Text>
                  <Text style={styles.predictionCheckText}>You predicted: {data.predictedHardestMovement}</Text>
                  <Text style={styles.predictionCheckText}>
                    Actual highest vibration: {MOVEMENTS.find((m) => m.id === hardestActual.id)?.label} ({hardestActual.avg.toFixed(1)} cm)
                  </Text>
                  <Text style={styles.predictionResultText}>
                    {data.predictedHardestMovement === MOVEMENTS.find((m) => m.id === hardestActual.id)?.label
                      ? 'Your hardest-movement prediction matched the results.'
                      : 'Your hardest-movement prediction differed from the results.'}
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
                <Ionicons name="calculator" size={24} color={Colors.primary} />
                <Text style={styles.instructionsTitle}>{t('activities.formulasTitle', { defaultValue: 'Helpful Formulas' })}</Text>
              </View>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>
                  <Text style={{ fontWeight: '700' }}>Speed (m/s) =</Text> Range of Motion (m) ÷ Time (s)
                </Text>
                <Text style={[styles.formulaText, { marginTop: Spacing.xs }]}>
                  Convert cm to m by dividing by 100.
                </Text>
              </View>
            </Card>

            <Card style={styles.pageCard}>
              <Text style={styles.tableTitle}>Calculate Speed</Text>
              {!isLocked && (
                <Button
                  title="Instant Calc (-20 pts)"
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
                      {trial.label} — ROM: {trial.rangeOfMotion || '0'} cm, Time: {trial.movementTime || '10'}s
                    </Text>
                    <Input
                      label="Calculated Speed (m/s)"
                      value={trial.manualSpeed}
                      onChangeText={(v) => updateTrial(trial.id, { manualSpeed: v })}
                      keyboardType="numeric"
                      editable={!isLocked}
                      onLightSurface
                      error={isValid === false ? 'Incorrect calculation' : undefined}
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
  hintText: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.lg },
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
  tableCell: { ...Typography.bodySmall, color: Colors.textSecondary, paddingRight: Spacing.sm },
  predictionCheck: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  predictionCheckTitle: { ...Typography.label, marginBottom: Spacing.sm },
  predictionCheckText: { ...Typography.bodySmall, marginBottom: Spacing.xs },
  predictionResultText: { ...Typography.bodySmall, fontWeight: '600', marginTop: Spacing.sm },
  instructionsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  instructionsTitle: { ...Typography.h3, color: Colors.primary },
  formulaBox: { backgroundColor: Colors.primary + '10', padding: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.sm },
  formulaText: { ...Typography.bodySmall, color: Colors.primary },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  tableTitle: { ...Typography.h3 },
  calcBlock: { marginBottom: Spacing.lg, padding: Spacing.md, backgroundColor: Colors.background, borderRadius: BorderRadius.md },
  calcTitle: { ...Typography.label, marginBottom: Spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: Spacing.xl },
  modalContent: { backgroundColor: Colors.white, padding: Spacing.xl, borderRadius: BorderRadius.lg, alignItems: 'center' },
  modalTitle: { ...Typography.h2, color: Colors.danger, marginBottom: Spacing.sm },
  modalText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
});
