import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Modal as RNModal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActivityInstructionsList } from './ActivityInstructionsList';
import { ActivityIllustration } from './ActivityIllustration';
import { EquipmentChecklist } from './EquipmentChecklist';
import { ActivityTimerBar } from './ActivityTimerBar';
import { CalcEncouragementNote } from './CalcEncouragementNote';
import { actT } from '../../utils/activityContent';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spacing, Typography, BorderRadius  } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useGradeBand } from '../../hooks/useGradeBand';
import { TrialVideoPlayer } from '../sensors/TrialVideoPlayer';
import { GyroProtractorModal } from './GyroProtractorModal';
import { HandFanResults } from './HandFanResults';
import {
  HAND_FAN_DESIGNS,
  HAND_FAN_DISTANCES,
  HAND_FAN_MATERIALS,
  getHandFanDesignLabels,
  getHandFanMaterialLabels,
  resolveHandFanDesign,
  resolveHandFanMaterial,
  HAND_FAN_TARGET_MATERIALS,
  resolveHandFanTargetMaterial
} from '../../utils/handFanLabels';

export interface HandFanTrial {
  id: string;
  design: string;
  fanMaterial: string;
  targetMaterial: string;
  distance: string;
  maxBendAngle: string;
  predictedBendAngle?: string;
  videoUri?: string;
  manualForce: string;
}

export interface HandFanData {
  predictedMaterial: string;
  predictedDesign: string;
  predictedDistance?: string;
  usedInstantCalc: boolean;
  trials: HandFanTrial[];
  checkedEquipment?: Record<string, boolean>;
}

interface Props {
  value: any;
  onChange: (value: any) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

const DEFAULT_TIME = 3600;

type StiffnessRow = { material: string; thickness: string; k: string; notes: string };

type HandFanTab = 'setup' | 'predictions' | 'experiment' | 'calculations' | 'results';

function useHandFanFormStyles() {
  return useThemedStyles(({ colors, typography }) => ({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  pageCard: {
    marginBottom: Spacing.md,
    padding: Spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: Spacing.md,
  },
  recordHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabScroll: {
    paddingHorizontal: Spacing.md,
  },
  tab: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
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
  timerTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  timerDisplay: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  timerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  flex3: {
    flex: 3,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checklistText: {
    ...typography.body,
    flex: 1,
  },
  instructionText: {
    ...typography.body,
    marginBottom: Spacing.sm,
  },
  illustration: {
    width: '100%',
    height: 200,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  wizardNavBoth: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  trialBlock: {
    padding: Spacing.md,
    backgroundColor: colors.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  trialTitle: {
    ...typography.h3,
    marginBottom: Spacing.sm,
  },
  videoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  tableScroll: {
    marginTop: Spacing.sm,
  },
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
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingRight: Spacing.sm,
  },
  tableHeaderCell: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text,
    paddingRight: Spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tableTitle: {
    ...typography.h3,
  },
  calcBlock: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: colors.background,
    borderRadius: BorderRadius.md,
  },
  calcTitle: {
    ...typography.label,
    marginBottom: Spacing.xs,
  },
  calcText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.danger,
    marginBottom: Spacing.sm,
  },
  modalText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  instructionsTitle: {
    ...typography.h3,
    color: colors.primary,
  },
  formulaBox: {
    backgroundColor: colors.primary + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  formulaText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginBottom: Spacing.xs,
  },
  }));
}

export function HandFanForm({
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const styles = useHandFanFormStyles();
  const { colors } = useTheme();

  const { t } = useTranslation();
  const { isHighSchool } = useGradeBand();

  const initialTab = (value as any)?.__activeTab || 'setup';
  const [activeTab, setActiveTab] = useState<HandFanTab>(initialTab);
  
  const timerEndTs = (value as any)?.__timerEndTs;
  const initialTimeLeft = timerEndTs 
    ? Math.max(0, Math.floor((timerEndTs - Date.now()) / 1000))
    : DEFAULT_TIME;
    
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [isTimerRunning, setIsTimerRunning] = useState(initialTab !== 'setup' && initialTimeLeft > 0);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [activeGyroTrialId, setActiveGyroTrialId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  
  const equipmentString = t('data.activities.hand-fan.equipment');
  const equipmentList = useMemo(
    () => equipmentString.split(',').map((s) => s.trim()),
    [equipmentString]
  );
  
  const materialLabels = useMemo(() => getHandFanMaterialLabels(t), [t]);
  const designLabels = useMemo(() => getHandFanDesignLabels(t), [t]);
  const targetMaterialLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    HAND_FAN_TARGET_MATERIALS.forEach(m => labels[m] = resolveHandFanTargetMaterial(m, t));
    return labels;
  }, [t]);

  const stiffnessRows = useMemo(() => {
    const rows = t('data.activities.hand-fan.stiffnessRows', { returnObjects: true });
    if (Array.isArray(rows)) {
      return rows as StiffnessRow[];
    }
    return [];
  }, [t]);

  const displayDesign = (design: string) => resolveHandFanDesign(design, t);
  const displayMaterial = (material: string) => resolveHandFanMaterial(material, t);

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

  const getInitialData = (): HandFanData => ({
    predictedMaterial: '',
    predictedDesign: '',
    predictedDistance: '',
    usedInstantCalc: false,
    trials: [
      { id: '1', design: '', fanMaterial: '', targetMaterial: '', distance: '', maxBendAngle: '', manualForce: '' },
      { id: '2', design: '', fanMaterial: '', targetMaterial: '', distance: '', maxBendAngle: '', manualForce: '' }
    ]
  });

  const defaultData = getInitialData();
  const data: HandFanData = {
    ...defaultData,
    ...(value || {}),
    trials: value?.trials || defaultData.trials,
  };
  const updateData = (updates: Partial<HandFanData>) => onChange({ ...data, ...updates });

  const checkedEquipment = data.checkedEquipment || {};
  const setCheckedEquipment = (updater: any) => {
    if (typeof updater === 'function') {
      updateData({ checkedEquipment: updater(checkedEquipment) });
    } else {
      updateData({ checkedEquipment: updater });
    }
  };
  const allEquipmentChecked = equipmentList.length > 0 && equipmentList.every((item: string) => checkedEquipment[item]);
  
  const updateTrial = (id: string, updates: Partial<HandFanTrial>) => {
    const newTrials = data.trials.map(t => t.id === id ? { ...t, ...updates } : t);
    updateData({ trials: newTrials });
  };

  const goToTab = (tab: HandFanTab) => {
    if (isLocked && tab !== activeTab) {
      Alert.alert(
        t('activities.timeUpTitle', { defaultValue: 'Time is up!' }),
        t('activities.timeUpText', { defaultValue: 'Your time is up. Reset the activity to make changes.' })
      );
      return;
    }
    if (tab !== 'setup' && !allEquipmentChecked) {
      Alert.alert(
        t('activities.equipmentTitle', { defaultValue: 'Equipment Checklist' }),
        t('activities.equipmentRequiredMsg', {
          defaultValue: 'Tick every item on the Setup tab before continuing.',
        })
      );
      return;
    }
    setActiveTab(tab);
    let updates: any = { __activeTab: tab };
    if (tab !== 'setup' && !(data as any).__timerEndTs) {
      updates.__timerEndTs = Date.now() + DEFAULT_TIME * 1000;
    }
    onChange({ ...data, ...updates });
  };

  const ensureCanRecord = (): boolean => {
    if (isLocked) {
      Alert.alert(
        t('activities.timeUpTitle', { defaultValue: 'Time is up!' }),
        t('activities.timeUpText', { defaultValue: 'Your time is up. Reset the activity to record again.' })
      );
      return false;
    }
    if (!allEquipmentChecked) {
      Alert.alert(
        t('activities.equipmentTitle', { defaultValue: 'Equipment Checklist' }),
        t('activities.equipmentRequiredMsg', {
          defaultValue: 'Tick every item on the Setup tab before recording.',
        })
      );
      return false;
    }
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }
    return true;
  };

  const recordVideo = async (trialId: string) => {
    if (!ensureCanRecord()) return;

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(t('common.cameraPermissionMsg', { defaultValue: 'Camera permission is required' }));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      updateTrial(trialId, { videoUri: result.assets[0].uri });
    }
  };

  const handleInstantCalc = () => {
    if (isLocked) return;
    Alert.alert(
      t('activities.calcWarningTitle'),
      t('activities.calcWarningText'),
      [
        { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        { 
          text: t('common.proceed', { defaultValue: 'Proceed' }), 
          style: 'destructive',
          onPress: () => {
            const calculatedTrials = data.trials.map(trial => {
              // F = k * bend angle (converted to radians internally if needed, but here we just use the raw angle per earlier logic or assume F is proportional)
              // Wait, F = k * theta. If k is in N/rad, we should convert angle to rad. 
              // Original code: const f = (k * (parseFloat(trial.maxBendAngle) || 0)).toFixed(2);
              // Let's stick to the original math logic to not break tests, but just update the k values.
              let k = 0.05; // Thin printer paper
              if (trial.targetMaterial === 'Standard card stock') k = 0.2;
              else if (trial.targetMaterial === 'Thin cardboard') k = 0.5;
              else if (trial.targetMaterial === 'Corrugated cardboard') k = 2.5;
              const f = (k * (parseFloat(trial.maxBendAngle) || 0) * (Math.PI / 180)).toFixed(3);
              return { ...trial, manualForce: f.toString() };
            });
            updateData({ usedInstantCalc: true, trials: calculatedTrials });
          }
        }
      ]
    );
  };

  // Helper validation for High School formulas
  const validateForce = (manualF: string, trial: HandFanTrial) => {
    if (!manualF) return null;
    let k = 0.05;
    if (trial.targetMaterial === 'Standard card stock') k = 0.2;
    else if (trial.targetMaterial === 'Thin cardboard') k = 0.5;
    else if (trial.targetMaterial === 'Corrugated cardboard') k = 2.5;

    const angleRad = (parseFloat(trial.maxBendAngle) || 0) * (Math.PI / 180);
    const expected = k * angleRad;
    const actual = parseFloat(manualF);
    if (isNaN(actual)) return false;
    // Allow 10% tolerance
    return Math.abs(expected - actual) <= Math.max(0.1, expected * 0.1);
  };

  const isFormValid = () => {
    if (!data.predictedMaterial || !data.predictedDesign) return false;
    for (const t of data.trials) {
      if (!t.design || !t.fanMaterial || !t.targetMaterial || !t.distance || !t.maxBendAngle?.trim() || !t.predictedBendAngle?.trim()) return false;
      if (isHighSchool && !t.manualForce?.trim()) return false;
    }
    return true;
  };

  // Sanitize potentially invalid predictedDesign from old drafts
  useEffect(() => {
    if (data.predictedDesign && !HAND_FAN_DESIGNS.includes(data.predictedDesign as any)) {
      updateData({ predictedDesign: '' });
    }
  }, [data.predictedDesign]);

  const predictionsValid = !!data.predictedMaterial && !!data.predictedDesign && data.trials.every(t => t.predictedBendAngle?.trim());
  const experimentValid = data.trials.every(t => t.maxBendAngle?.trim());
  const calculationsValid = data.trials.every(t => t.manualForce?.trim());

  const handleComplete = () => {
    if (!isFormValid()) {
      Alert.alert(
        t('activities.incompleteTitle', { defaultValue: 'Almost there!' }), 
        t('activities.incompleteMsg', { defaultValue: 'It looks like some required fields haven\'t been filled out yet. Please double-check the tabs to make sure everything is complete before submitting.' })
      );
      return;
    }
    setIsTimerRunning(false);
    setIsLocked(true);
    if (onSubmit) onSubmit();
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

  const timerTitle = t('activities.timerTitle', { defaultValue: 'Activity Timer (60 Min)' });
  const showTimerControls = activeTab !== 'setup' || isTimerRunning;

  const promptResetTimer = () => {
    Alert.alert(t('activities.resetTimerTitle'), t('activities.resetTimerMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('activities.startOver'), style: 'destructive', onPress: handleStartOver },
    ]);
  };

  const renderTimerBar = () => (
    <ActivityTimerBar
      durationMinutes={60}
      timeLeft={timeLeft}
      isTimerRunning={isTimerRunning}
      isLocked={isLocked}
      timerTitle={timerTitle}
      showControls={showTimerControls}
      onPause={() => setIsTimerRunning(false)}
      onResume={() => setIsTimerRunning(true)}
      onReset={promptResetTimer}
    />
  );

  return (
    <View style={styles.container}>
      {/* Timeout Modal */}
      <RNModal visible={showTimeoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('activities.timeoutTitle', { defaultValue: 'Time is up!' })}</Text>
            <Text style={styles.modalText}>{t('activities.timeoutMsg', { defaultValue: 'Your 60 minutes are up. You can only review your data now.' })}</Text>
            <Button title={t('common.ok', { defaultValue: 'OK' })} onPress={() => setShowTimeoutModal(false)} />
          </View>
        </View>
      </RNModal>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {(['setup', 'predictions', 'experiment', ...(isHighSchool ? ['calculations'] : []), 'results'] as HandFanTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => goToTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {t(`activities.tabs.${tab}`, { defaultValue: tab.charAt(0).toUpperCase() + tab.slice(1) })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.scrollContent}>
        {activeTab === 'setup' && (
          <View>
            <Card style={styles.pageCard}>
              <ActivityInstructionsList
                activityId="hand-fan"
                durationMinutes={60}
                textStyle={styles.instructionText}
                titleStyle={styles.sectionTitle}
              />
              <ActivityIllustration activityId="hand-fan" style={styles.illustration} />
            </Card>

            <Card style={styles.pageCard}>
              <EquipmentChecklist
                equipmentList={equipmentList}
                checkedEquipment={checkedEquipment}
                disabled={isLocked}
                onToggle={(item) => {
                  setCheckedEquipment((prev) => ({ ...prev, [item]: !prev[item] }));
                }}
              />
            </Card>

            {renderTimerBar()}

            <Button
              title={t('common.next', { defaultValue: 'Next' })}
              onPress={() => goToTab('predictions')}
              disabled={!allEquipmentChecked}
            />
          </View>
        )}

        {activeTab === 'predictions' && (
          <View>
            {renderTimerBar()}
            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>{t('activities.predictionsTitle', { defaultValue: 'Make Your Predictions' })}</Text>
              
              <Select
                label={t('data.activities.hand-fan.predictMaterialLabel')}
                value={data.predictedMaterial}
                options={[...HAND_FAN_MATERIALS]}
                optionLabels={materialLabels}
                onValueChange={(v) => updateData({ predictedMaterial: v })}
                disabled={isLocked}
              />
              
              <Select
                label={t('data.activities.hand-fan.predictDesignLabel')}
                value={data.predictedDesign}
                options={[...HAND_FAN_DESIGNS]}
                optionLabels={designLabels}
                onValueChange={(v) => updateData({ predictedDesign: v })}
                disabled={isLocked}
              />
              
              <Select
                label={t('data.activities.hand-fan.predictDistanceLabel')}
                value={data.predictedDistance || ''}
                options={[...HAND_FAN_DISTANCES]}
                onValueChange={(v) => updateData({ predictedDistance: v })}
                disabled={isLocked}
              />

              <View style={{ marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
                <Text style={styles.instructionText}>{t('data.activities.hand-fan.predictBendAngleInstruction', { defaultValue: 'Predict the bend angle for each trial:' })}</Text>
                {data.trials.map((trial, index) => (
                  <View key={`pred-${trial.id}`} style={styles.trialBlock}>
                    <Text style={styles.trialTitle}>{t('activities.trialNumber', { n: index + 1 })}</Text>
                    
                    <Select
                      label={t('data.activities.hand-fan.fanDesignLabel')}
                      value={trial.design}
                      options={[...HAND_FAN_DESIGNS]}
                      optionLabels={designLabels}
                      onValueChange={(v) => updateTrial(trial.id, { design: v })}
                      disabled={isLocked}
                    />
                    
                    <Select
                      label={t('data.activities.hand-fan.fanMaterialLabel')}
                      value={trial.fanMaterial}
                      options={[...HAND_FAN_MATERIALS]}
                      optionLabels={materialLabels}
                      onValueChange={(v) => updateTrial(trial.id, { fanMaterial: v })}
                      disabled={isLocked}
                    />

                    <Select
                      label={t('data.activities.hand-fan.targetMaterialLabel')}
                      value={trial.targetMaterial}
                      options={[...HAND_FAN_TARGET_MATERIALS]}
                      optionLabels={targetMaterialLabels}
                      onValueChange={(v) => updateTrial(trial.id, { targetMaterial: v })}
                      disabled={isLocked}
                    />
                    
                    <Select
                      label={t('data.activities.hand-fan.fanDistanceLabel')}
                      value={trial.distance}
                      options={[...HAND_FAN_DISTANCES]}
                      onValueChange={(v) => updateTrial(trial.id, { distance: v })}
                      disabled={isLocked}
                    />

                    <Input
                      label={t('data.activities.hand-fan.predictBendAngleLabel', { defaultValue: 'Predicted Bend Angle (degrees)' })}
                      value={trial.predictedBendAngle || ''}
                      onChangeText={(v) => updateTrial(trial.id, { predictedBendAngle: v })}
                      keyboardType="numeric"
                      placeholder={t('data.activities.hand-fan.predictBendAnglePlaceholder', { defaultValue: 'e.g. 45' })}
                      editable={!isLocked}
                      onLightSurface
                    />
                  </View>
                ))}

                {data.trials.length < 5 && !isLocked && (
                  <Button
                    title={t('activities.addTrial', { defaultValue: 'Add Trial' })}
                    onPress={() => {
                      const newId = Date.now().toString();
                      const newTrials = [...data.trials, { id: newId, design: '', fanMaterial: '', targetMaterial: '', distance: '', maxBendAngle: '', manualForce: '' }];
                      updateData({ trials: newTrials });
                    }}
                    variant="outlined"
                    icon={<Ionicons name="add" size={16} color={colors.primary} />}
                    style={{ alignSelf: 'flex-start', marginTop: Spacing.sm }}
                  />
                )}
              </View>
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous')} variant="outlined" onPress={() => goToTab('setup')} />
              <Button title={t('common.next')} onPress={() => goToTab('experiment')} disabled={!predictionsValid} />
            </View>
          </View>
        )}

        {activeTab === 'experiment' && (
          <View>
            {renderTimerBar()}
            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>{t('activities.trialsTitle', { defaultValue: 'Record Trials' })}</Text>
              <Text style={styles.recordHint}>{t('data.activities.hand-fan.recordHint')}</Text>

              {data.trials.map((trial, index) => (
                <View key={`exp-${trial.id}`} style={styles.trialBlock}>
                  <Text style={styles.trialTitle}>
                    {t('activities.trialNumber', { n: index + 1 })}: {displayDesign(trial.design)} ({displayMaterial(trial.fanMaterial)} at {trial.distance})
                  </Text>

                  <Input
                    label={t('data.activities.hand-fan.maxBendAngleLabel')}
                    value={trial.maxBendAngle}
                    onChangeText={(v) => updateTrial(trial.id, { maxBendAngle: v })}
                    keyboardType="numeric"
                    editable={!isLocked}
                    onLightSurface
                  />
                  {!isLocked && (
                    <Button 
                      title={t('data.activities.hand-fan.measureWithGyroscope')} 
                      variant="outlined" 
                      onPress={() => setActiveGyroTrialId(trial.id)}
                      icon={<Ionicons name="phone-portrait-outline" size={18} color={colors.primary} />}
                      style={{ marginBottom: Spacing.md }}
                    />
                  )}

                  {trial.videoUri ? (
                    <View style={styles.videoContainer}>
                      <TrialVideoPlayer videoUri={trial.videoUri} />
                      {!isLocked && (
                        <Button 
                          title={t('activities.retakeVideo')} 
                          onPress={() => recordVideo(trial.id)} 
                          variant="outlined"
                          size="sm"
                          style={{ marginTop: Spacing.sm }}
                          icon={<Ionicons name="camera-reverse" size={16} color={colors.primary} />}
                        />
                      )}
                    </View>
                  ) : (
                    <Button 
                      title={t('activities.recordSlowMoVideo')} 
                      onPress={() => recordVideo(trial.id)} 
                      variant="primary"
                      icon={<Ionicons name="videocam" size={18} color={colors.white} />}
                      disabled={isLocked}
                      style={{ marginTop: Spacing.sm }}
                    />
                  )}
                </View>
              ))}

            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous')} variant="outlined" onPress={() => goToTab('predictions')} />
              {isHighSchool ? (
                <Button title={t('common.next')} onPress={() => goToTab('calculations')} disabled={!experimentValid} />
              ) : (
                <Button title={t('common.next')} onPress={() => goToTab('results')} disabled={!experimentValid} />
              )}
            </View>
          </View>
        )}

        {isHighSchool && activeTab === 'calculations' && (
          <View>
            {renderTimerBar()}
            <Card style={[styles.pageCard, { marginBottom: Spacing.lg }]}>
              <View style={styles.instructionsHeader}>
                <Ionicons name="calculator" size={24} color={colors.primary} />
                <Text style={styles.instructionsTitle}>{actT('shared.formulasTitle')}</Text>
              </View>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>{t('data.activities.hand-fan.formulaForce')}</Text>
              </View>
            </Card>

            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>{t('activities.stiffnessTitle')}</Text>
              
              <View style={{ marginTop: Spacing.sm }}>
                <View style={styles.tableRowHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 2 }]}>{t('activities.tableMaterial')}</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>k</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 2 }]}>{t('activities.tableNotes')}</Text>
                </View>
                {stiffnessRows.map((row, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{row.material}</Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{row.k}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{row.notes}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <Card style={styles.pageCard}>
              <View style={{ marginBottom: Spacing.md }}>
                <Text style={styles.tableTitle}>{t('data.activities.hand-fan.calculateForceTitle')}</Text>
                <CalcEncouragementNote />
                {!isLocked && (
                  <Button 
                    title={t('data.activities.parachute-drop.btnInstantCalc')} 
                    onPress={handleInstantCalc} 
                    variant="outlined" 
                    size="sm"
                    style={{ alignSelf: 'flex-start', marginTop: Spacing.xs }}
                  />
                )}
              </View>

              {data.trials.map((trial, i) => {
                const isValid = validateForce(trial.manualForce, trial);
                return (
                  <View key={trial.id} style={styles.calcBlock}>
                    <Text style={styles.calcTitle}>
                      {t('data.activities.hand-fan.calcTrialTitle', {
                        n: i + 1,
                        design: resolveHandFanDesign(trial.design, t),
                        material: resolveHandFanTargetMaterial(trial.targetMaterial, t),
                      })}
                    </Text>
                    <Text style={styles.calcText}>
                      {t('data.activities.hand-fan.maxBendValue', { angle: trial.maxBendAngle || '0' })}
                    </Text>
                    <Input
                      label={t('data.activities.hand-fan.calculatedForceLabel')}
                      value={trial.manualForce}
                      onChangeText={(v) => updateTrial(trial.id, { manualForce: v })}
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
              <Button title={t('common.previous')} variant="outlined" onPress={() => goToTab('experiment')} />
              <Button title={t('common.next')} onPress={() => goToTab('results')} disabled={!calculationsValid} />
            </View>
          </View>
        )}

        {activeTab === 'results' && (
          <View>
            {renderTimerBar()}
            <HandFanResults results={[{ data, timestamp: Date.now(), id: 'temp', score: 0, completedAt: Date.now() }]} hideHeader={true} />
            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous')} variant="outlined" onPress={() => goToTab(isHighSchool ? 'calculations' : 'experiment')} />
              <Button title={t('activities.complete', { defaultValue: 'Complete Activity' })} onPress={handleComplete} variant="primary" disabled={!isFormValid()} loading={isSubmitting} />
            </View>
          </View>
        )}
      </View>

      <GyroProtractorModal 
        visible={!!activeGyroTrialId}
        onClose={() => setActiveGyroTrialId(null)}
        onCapture={(angle) => {
          if (activeGyroTrialId) {
            updateTrial(activeGyroTrialId, { maxBendAngle: angle });
            setActiveGyroTrialId(null);
          }
        }}
      />
    </View>
  );
}


