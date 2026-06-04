import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView, Modal as RNModal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActivityInstructionsList } from './ActivityInstructionsList';
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
import {
  HAND_FAN_DESIGNS,
  HAND_FAN_DISTANCES,
  HAND_FAN_MATERIALS,
  getHandFanDesignLabels,
  getHandFanMaterialLabels,
  resolveHandFanDesign,
  resolveHandFanMaterial,
} from '../../utils/handFanLabels';

export interface HandFanTrial {
  id: string;
  design: string;
  fanMaterial: string;
  targetMaterial: string;
  distance: string;
  maxBendAngle: string;
  videoUri?: string;
  manualForce: string;
}

export interface HandFanData {
  predictedMaterial: string;
  predictedDesign: string;
  predictedDistance?: string;
  usedInstantCalc: boolean;
  trials: HandFanTrial[];
}

interface Props {
  value: any;
  onChange: (value: any) => void;
  onSubmit?: () => void;
}

const DEFAULT_TIME = 3600;

type StiffnessRow = { material: string; thickness: string; k: string; notes: string };

type HandFanTab = 'setup' | 'predictions' | 'experiment' | 'calculations';

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
    marginTop: Spacing.md,
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
}: Props) {
  const styles = useHandFanFormStyles();
  const { colors } = useTheme();

  const { t } = useTranslation();
  const { isHighSchool } = useGradeBand();

  const [activeTab, setActiveTab] = useState<HandFanTab>('setup');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const equipmentString = t('data.activities.hand-fan.equipment');
  const equipmentList = useMemo(
    () => equipmentString.split(',').map((s) => s.trim()),
    [equipmentString]
  );
  const [checkedEquipment, setCheckedEquipment] = useState<Record<string, boolean>>({});
  const allEquipmentChecked = equipmentList.length > 0 && equipmentList.every(item => checkedEquipment[item]);

  const materialLabels = useMemo(() => getHandFanMaterialLabels(t), [t]);
  const designLabels = useMemo(() => getHandFanDesignLabels(t), [t]);

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getInitialData = (): HandFanData => ({
    predictedMaterial: '',
    predictedDesign: '',
    predictedDistance: '',
    usedInstantCalc: false,
    trials: [
      { id: '1', design: 'Paper, Wide Fold', fanMaterial: 'Paper', targetMaterial: 'Paper', distance: '15cm', maxBendAngle: '', manualForce: '' },
      { id: '2', design: 'Paper, Wide Fold', fanMaterial: 'Paper', targetMaterial: 'Paper', distance: '30cm', maxBendAngle: '', manualForce: '' },
      { id: '3', design: 'Paper, Wide Fold', fanMaterial: 'Paper', targetMaterial: 'Paper', distance: '45cm', maxBendAngle: '', manualForce: '' },
      { id: '4', design: 'Paper, Narrow Fold', fanMaterial: 'Paper', targetMaterial: 'Paper', distance: '15cm', maxBendAngle: '', manualForce: '' },
      { id: '5', design: 'Paper, Narrow Fold', fanMaterial: 'Paper', targetMaterial: 'Paper', distance: '30cm', maxBendAngle: '', manualForce: '' },
      { id: '6', design: 'Paper, Narrow Fold', fanMaterial: 'Paper', targetMaterial: 'Paper', distance: '45cm', maxBendAngle: '', manualForce: '' },
      { id: '7', design: 'Cardboard, Wide Fold', fanMaterial: 'Cardboard', targetMaterial: 'Paper', distance: '15cm', maxBendAngle: '', manualForce: '' },
      { id: '8', design: 'Cardboard, Wide Fold', fanMaterial: 'Cardboard', targetMaterial: 'Paper', distance: '30cm', maxBendAngle: '', manualForce: '' },
      { id: '9', design: 'Cardboard, Wide Fold', fanMaterial: 'Cardboard', targetMaterial: 'Paper', distance: '45cm', maxBendAngle: '', manualForce: '' },
      { id: '10', design: 'Cardboard, Narrow Fold', fanMaterial: 'Cardboard', targetMaterial: 'Paper', distance: '15cm', maxBendAngle: '', manualForce: '' },
      { id: '11', design: 'Cardboard, Narrow Fold', fanMaterial: 'Cardboard', targetMaterial: 'Paper', distance: '30cm', maxBendAngle: '', manualForce: '' },
      { id: '12', design: 'Cardboard, Narrow Fold', fanMaterial: 'Cardboard', targetMaterial: 'Paper', distance: '45cm', maxBendAngle: '', manualForce: '' }
    ]
  });

  const defaultData = getInitialData();
  const data: HandFanData = {
    ...defaultData,
    ...(value || {}),
    trials: value?.trials || defaultData.trials,
  };
  const updateData = (updates: Partial<HandFanData>) => onChange({ ...data, ...updates });

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
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }
    setActiveTab(tab);
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
      t('activities.calcWarningTitle', { defaultValue: 'Instant Calculation' }),
      t('activities.calcWarningText', { defaultValue: 'Using instant calculation will result in a 20 point deduction. Are you sure?' }),
      [
        { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        { 
          text: t('common.proceed', { defaultValue: 'Proceed' }), 
          style: 'destructive',
          onPress: () => {
            const calculatedTrials = data.trials.map(trial => {
              // F = k * bend angle. Approx k based on target material.
              let k = 0.05; // Thin printer paper
              if (trial.targetMaterial === 'Cardboard') k = 0.5; // Thin cardboard
              const f = (k * (parseFloat(trial.maxBendAngle) || 0)).toFixed(2);
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
    if (trial.targetMaterial === 'Cardboard') k = 0.5;
    const expected = k * (parseFloat(trial.maxBendAngle) || 0);
    const actual = parseFloat(manualF);
    if (isNaN(actual)) return false;
    // Allow 10% tolerance
    return Math.abs(expected - actual) <= Math.max(0.1, expected * 0.1);
  };

  const isFormValid = () => {
    if (!data.predictedMaterial || !data.predictedDesign) return false;
    for (const t of data.trials) {
      if (!t.design || !t.fanMaterial || !t.targetMaterial || !t.distance || !t.maxBendAngle) return false;
      if (isHighSchool && !t.manualForce) return false;
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
          {(['setup', 'predictions', 'experiment', ...(isHighSchool ? ['calculations'] : [])] as HandFanTab[]).map((tab) => (
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
        {/* TIMER (Visible on all tabs) */}
        <View style={{ marginBottom: Spacing.lg }}>
          <View style={styles.stickyTimer}>
            <View style={{flex: 1}}>
              <Text style={styles.timerTitle}>{t('activities.timerTitle', { defaultValue: 'Activity Timer (60 Min)' })}</Text>
              <Text style={[styles.timerDisplay, timeLeft <= 300 && {color: colors.danger}]}>{formatTime(timeLeft)}</Text>
            </View>
            <View style={styles.timerButtons}>
              <Button 
                title={isTimerRunning ? t('activities.timerPause', { defaultValue: 'Pause' }) : t('activities.timerStart', { defaultValue: 'Start' })} 
                onPress={() => {
                  if (isTimerRunning) {
                    Alert.alert(
                      "Pause Timer",
                      "Don't pause the timer unless you need to. Value integrity!",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Pause", onPress: () => setIsTimerRunning(false) }
                      ]
                    );
                  } else {
                    setIsTimerRunning(true);
                  }
                }} 
                variant={isTimerRunning ? "outlined" : "primary"}
                size="sm"
                disabled={isLocked && timeLeft === 0}
              />
              <Button 
                title={t('common.reset', { defaultValue: 'Reset' })} 
                onPress={() => {
                  Alert.alert("Reset Timer & Data", "Are you sure you want to start over? This wipes all data.", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Start Over", style: "destructive", onPress: handleStartOver }
                  ]);
                }} 
                variant="outlined"
                size="sm"
              />
            </View>
          </View>
        </View>

        {/* SETUP TAB */}
        {activeTab === 'setup' && (
          <View>

            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>{t('activities.equipmentTitle', { defaultValue: 'Equipment Checklist' })}</Text>
              {equipmentList.map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={styles.checklistItem}
                  onPress={() => {
                    if (!isLocked) {
                      setCheckedEquipment(prev => ({ ...prev, [item]: !prev[item] }));
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
                activityId="hand-fan"
                textStyle={styles.instructionText}
                titleStyle={styles.sectionTitle}
              />
              <Image 
                source={require('../../../assets/images/activity3illustration.jpeg')} 
                style={styles.illustration}
                resizeMode="contain"
              />
            </Card>

            <Button
              title={t('common.next', { defaultValue: 'Next' })}
              onPress={() => goToTab('predictions')}
              disabled={!allEquipmentChecked}
            />
          </View>
        )}

        {/* PREDICTIONS TAB */}
        {activeTab === 'predictions' && (
          <View>
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
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => goToTab('setup')} />
              <Button title={t('common.next', { defaultValue: 'Next' })} onPress={() => goToTab('experiment')} />
            </View>
          </View>
        )}

        {/* EXPERIMENT TAB */}
        {activeTab === 'experiment' && (
          <View>
            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>{t('activities.trialsTitle', { defaultValue: 'Record Trials' })}</Text>
              <Text style={styles.recordHint}>{t('data.activities.hand-fan.recordHint')}</Text>

              {data.trials.map((trial, index) => (
                <View key={trial.id} style={styles.trialBlock}>
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
                    options={[...HAND_FAN_MATERIALS]}
                    optionLabels={materialLabels}
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
                    label={t('data.activities.hand-fan.maxBendAngleLabel')}
                    value={trial.maxBendAngle}
                    onChangeText={(v) => updateTrial(trial.id, { maxBendAngle: v })}
                    keyboardType="numeric"
                    editable={!isLocked}
                    onLightSurface
                  />

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
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => goToTab('predictions')} />
              {isHighSchool ? (
                <Button title={t('common.next', { defaultValue: 'Next' })} onPress={() => goToTab('calculations')} />
              ) : (
                <Button title={t('activities.complete', { defaultValue: 'Complete Activity' })} onPress={handleComplete} variant="primary" />
              )}
            </View>
          </View>
        )}

        {/* CALCULATIONS TAB */}
        {isHighSchool && activeTab === 'calculations' && (
          <View>
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
                        design: displayDesign(trial.design),
                        material: displayMaterial(trial.targetMaterial),
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
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => goToTab('experiment')} />
              <Button title={t('activities.complete', { defaultValue: 'Complete Activity' })} onPress={handleComplete} variant="primary" />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}


