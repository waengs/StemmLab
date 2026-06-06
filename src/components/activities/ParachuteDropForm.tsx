import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal as RNModal, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActivityInstructionsList } from './ActivityInstructionsList';
import { ActivityIllustration } from './ActivityIllustration';
import { EquipmentChecklist } from './EquipmentChecklist';
import { ActivityTimerBar } from './ActivityTimerBar';
import { CalcEncouragementNote } from './CalcEncouragementNote';
import { actT } from '../../utils/activityContent';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spacing, Typography, BorderRadius  } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useRequireAuth } from '../../stores';
import { TrialVideoPlayer } from '../sensors/TrialVideoPlayer';
import {
  isParachuteBaselineTrial,
  resolveParachuteTrialLabel,
} from '../../utils/parachuteTrialLabel';

interface TrialData {
  id: string;
  label: string;
  predictedTime: string;
  actualTime: string;
  stoppingTime: string;
  didBounce: string;
  reboundTime: string;
  notes: string;
  videoUri?: string;
  manualSpeed: string;
  manualVelocity: string;
  manualAcceleration: string;
  manualNetForce: string;
  manualDragForce: string;
  manualGForce: string;
}

interface ParachuteDropData {
  dropHeight: string;
  toyMass: string;
  predictedDesign: string;
  usedInstantCalc: boolean;
  trials: TrialData[];
}

interface Props {
  value: any;
  onChange: (value: any) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

const DEFAULT_TIME = 3600;

function useParachuteDropFormStyles() {
  return useThemedStyles(({ colors, typography }) => ({
  container: {
    marginBottom: Spacing.xl,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: Spacing.md,
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
  wizardNavRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  wizardNavBoth: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    paddingTop: Spacing.sm,
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
  pageCard: {
    marginBottom: Spacing.md,
    padding: Spacing.xl,
  },
  integrityBox: {
    flexDirection: 'row',
    backgroundColor: colors.accentLight + '30',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  integrityText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  checklistContainer: {
    marginTop: Spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  checklistText: {
    ...typography.body,
    flex: 1,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: Spacing.md,
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
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  instructionsTitle: {
    ...typography.h3,
    color: colors.primary,
  },
  instructionListTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text,
    marginBottom: Spacing.xs,
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
  tableTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: Spacing.md,
  },
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tableHeaderCell: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    paddingRight: Spacing.sm,
  },
  tableBodyCell: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '400',
    paddingRight: Spacing.sm,
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },
  row: {
    flexDirection: 'row',
  },
  trialRowBlock: {
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
    paddingBottom: Spacing.lg,
  },
  subInputsContainer: {
    paddingLeft: Spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.primaryLight + '50',
    marginTop: Spacing.sm,
  },
  calcHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  hsCalcBlock: {
    marginBottom: Spacing.lg,
    backgroundColor: colors.surfaceElevated,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  hsCalcTitle: {
    ...typography.body,
    fontWeight: '400',
    color: colors.text,
    marginBottom: Spacing.sm,
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
  videoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.sm,
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
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  }));
}

export function ParachuteDropForm({
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const styles = useParachuteDropFormStyles();
  const { colors, isDark } = useTheme();

  const { t } = useTranslation();
  const { team } = useRequireAuth();
  
  const isHighSchool = team?.gradeLevel === t('setup.gradeLowerHigh') || 
                       team?.gradeLevel === 'Lower High School (Grades 7–9)' || 
                       team?.gradeLevel?.includes('High');
  
  const [activeTab, setActiveTab] = useState<'setup' | 'predictions' | 'experiment' | 'calculations'>('setup');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  // Equipment Checklist State
  const equipmentString = t('data.activities.parachute-drop.equipment');
  const equipmentList = useMemo(() => equipmentString.split(',').map(s => s.trim()), [equipmentString]);
  const [checkedEquipment, setCheckedEquipment] = useState<Record<string, boolean>>({});

  const allEquipmentChecked = equipmentList.length > 0 && equipmentList.every(item => checkedEquipment[item]);

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

  const getInitialData = (): ParachuteDropData => ({
    dropHeight: '',
    toyMass: '',
    predictedDesign: '',
    usedInstantCalc: false,
    trials: [
      {
        id: Date.now().toString(),
        label: t('data.activities.parachute-drop.baseline'),
        predictedTime: '',
        actualTime: '',
        stoppingTime: '',
        didBounce: 'No',
        reboundTime: '',
        notes: '',
        manualSpeed: '',
        manualVelocity: '',
        manualAcceleration: '',
        manualNetForce: '',
        manualDragForce: '',
        manualGForce: ''
      },
      {
        id: (Date.now() + 1).toString(),
        label: t('data.activities.parachute-drop.designN', { n: 1 }),
        predictedTime: '',
        actualTime: '',
        stoppingTime: '',
        didBounce: 'No',
        reboundTime: '',
        notes: '',
        manualSpeed: '',
        manualVelocity: '',
        manualAcceleration: '',
        manualNetForce: '',
        manualDragForce: '',
        manualGForce: ''
      }
    ]
  });

  const data = (value && value.trials) ? value : getInitialData();

  const updateData = (updates: Partial<ParachuteDropData>) => {
    if (isLocked) return;
    onChange({ ...data, ...updates });
  };

  const updateTrial = (trialId: string, updates: Partial<TrialData>) => {
    if (isLocked) return;
    updateData({
      trials: data.trials.map((t: TrialData) => t.id === trialId ? { ...t, ...updates } : t)
    });
  };

  const addTrial = () => {
    if (isLocked || data.trials.length >= 4) return;
    const newIdx = data.trials.filter((tr) => !isParachuteBaselineTrial(tr.label)).length + 1;
    updateData({
      trials: [
        ...data.trials,
        {
          id: Date.now().toString(),
          label: t('data.activities.parachute-drop.designN', { n: newIdx }),
          predictedTime: '',
          actualTime: '',
          stoppingTime: '',
          didBounce: 'No',
          reboundTime: '',
          notes: '',
          manualSpeed: '',
          manualVelocity: '',
          manualAcceleration: '',
          manualNetForce: '',
          manualDragForce: '',
          manualGForce: ''
        }
      ]
    });
  };

  const recordVideo = async (trialId: string) => {
    if (isLocked) return;
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert(t('common.cameraPermissionMsg'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      updateTrial(trialId, { videoUri: result.assets[0].uri });
    }
  };

  const handleStartOver = () => {
    setShowTimeoutModal(false);
    setIsLocked(false);
    setIsTimerRunning(false);
    setTimeLeft(DEFAULT_TIME);
    onChange(getInitialData());
    setCheckedEquipment({});
    setActiveTab('setup');
  };

  const handleTimeoutSaveResults = () => {
    setShowTimeoutModal(false);
    if (onSubmit) onSubmit();
  };

  const validateAllFields = () => {
    if (data.trials.length < 2) return false;
    if (!data.dropHeight?.trim() || !data.toyMass?.trim() || !data.predictedDesign) return false;
    for (const t of data.trials) {
      if (!t.predictedTime?.trim() || !t.actualTime?.trim() || !t.stoppingTime?.trim()) return false;
      if (t.didBounce === 'Yes' && !t.reboundTime?.trim()) return false;
      if (!isHighSchool && !t.manualSpeed?.trim()) return false;
      if (isHighSchool && (!t.manualVelocity?.trim() || !t.manualAcceleration?.trim() || !t.manualNetForce?.trim() || !t.manualDragForce?.trim() || !t.manualGForce?.trim())) return false;
    }
    return true;
  };

  const setupValid = data.dropHeight?.trim() && data.toyMass?.trim();
  const predictionsValid = data.predictedDesign && data.trials.every(t => t.predictedTime?.trim());
  const experimentValid = data.trials.every(t => t.actualTime?.trim() && t.stoppingTime?.trim() && (t.didBounce !== 'Yes' || t.reboundTime?.trim()));

  const handleFinalSave = () => {
    setIsTimerRunning(false); // Stop timer on submit
    if (onSubmit) onSubmit();
  };

  // Calculations
  const calculateTruePhysics = (trial: TrialData) => {
    const dh = parseFloat(data.dropHeight) || 0;
    const tm = parseFloat(data.toyMass) || 0;
    const tAct = parseFloat(trial.actualTime) || 0;
    const tStop = parseFloat(trial.stoppingTime) || 0;
    
    let speed = 0, vel = 0, acc = 0, nf = 0, df = 0, gf = 0;
    
    if (dh > 0 && tAct > 0) {
      vel = (2 * dh) / tAct;
      speed = vel;
      acc = vel / tAct;
      nf = tm * acc;
      df = (tm * 9.8) - nf;
      
      if (tStop > 0) {
        if (trial.didBounce === 'Yes') {
          const tRebound = parseFloat(trial.reboundTime) || 0;
          const reboundVel = tRebound * 9.8;
          gf = (vel + reboundVel) / (tStop * 9.8);
        } else {
          gf = vel / (tStop * 9.8);
        }
      }
    }
    return { speed, vel, acc, nf, df, gf };
  };

  const handleInstantCalculate = () => {
    if (isLocked) return;
    Alert.alert(
      t('data.activities.parachute-drop.calcWarningTitle'),
      t('data.activities.parachute-drop.calcWarningText'),
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Proceed", 
          style: "destructive",
          onPress: () => {
            const newTrials = data.trials.map((t: TrialData) => {
              const phys = calculateTruePhysics(t);
              return {
                ...t,
                manualSpeed: phys.speed.toFixed(2),
                manualVelocity: phys.vel.toFixed(2),
                manualAcceleration: phys.acc.toFixed(2),
                manualNetForce: phys.nf.toFixed(2),
                manualDragForce: phys.df.toFixed(2),
                manualGForce: phys.gf.toFixed(2)
              };
            });
            updateData({ trials: newTrials, usedInstantCalc: true });
          }
        }
      ]
    );
  };

  const validate = (val: string, trueVal: number) => {
    if (!val) return null;
    const num = parseFloat(val);
    const diff = Math.abs(num - trueVal);
    return diff <= 0.02;
  };

  const designOptions = data.trials
    .filter((tr: TrialData) => !isParachuteBaselineTrial(tr.label))
    .map((tr: TrialData) => tr.label);
  const designOptionLabels = designOptions.map((label: string) =>
    resolveParachuteTrialLabel(label, t)
  );

  const toggleEquipment = (item: string) => {
    setCheckedEquipment(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const timerTitle = t('data.activities.parachute-drop.timerTitle', { defaultValue: 'Activity Timer (60 min)' });
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
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {['setup', 'predictions', 'experiment', ...(isHighSchool ? ['calculations'] : [])].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab, !isTimerRunning && activeTab !== tab && { opacity: 0.5 }]}
              onPress={() => {
                if (!isTimerRunning && tab !== 'setup') {
                  Alert.alert(t('activities.timerRequiredTitle'), t('activities.timerRequiredMsg'));
                  return;
                }
                setActiveTab(tab as any);
              }}
              disabled={!isTimerRunning && activeTab !== tab}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {t(`activities.tabs.${tab}`, { defaultValue: tab.charAt(0).toUpperCase() + tab.slice(1) })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* PAGE 1: SETUP */}
      {activeTab === 'setup' && (
        <View>
          <Card style={styles.pageCard}>
            <ActivityInstructionsList
              activityId="parachute-drop"
              durationMinutes={60}
              textStyle={styles.instructionText}
              titleStyle={styles.sectionTitle}
            />
            
            <ActivityIllustration activityId="parachute-drop" style={styles.illustration} />
          </Card>

          <Card style={styles.pageCard}>
            <EquipmentChecklist
              equipmentList={equipmentList}
              checkedEquipment={checkedEquipment}
              titleKey="data.activities.parachute-drop.equipmentTitle"
              onToggle={toggleEquipment}
            />
          </Card>

          <Card style={styles.pageCard}>
            <Text style={styles.sectionTitle}>{t('data.activities.parachute-drop.setupSection', { defaultValue: 'Activity Setup' })}</Text>
            <Input
              label={t('data.activities.parachute-drop.dropHeight')}
              value={data.dropHeight}
              onChangeText={(v) => updateData({ dropHeight: v })}
              keyboardType="numeric"
              editable={!isLocked}
            />
            <Input
              label={t('data.activities.parachute-drop.toyMass')}
              value={data.toyMass}
              onChangeText={(v) => updateData({ toyMass: v })}
              keyboardType="numeric"
              editable={!isLocked}
            />
          </Card>

          {renderTimerBar()}
          
          <View style={styles.wizardNavRight}>
            <Button 
              title={t('common.next')} 
              onPress={() => {
                setIsTimerRunning(true);
                setActiveTab('predictions');
              }} 
              disabled={!allEquipmentChecked || !data.dropHeight?.trim() || !data.toyMass?.trim()}
              iconRight={<Ionicons name="arrow-forward" size={16} color={colors.white} />}
            />
          </View>
        </View>
      )}

      {/* PAGE 2: PREDICTIONS */}
      {activeTab === 'predictions' && (
        <View>
          {renderTimerBar()}
          <Card style={styles.pageCard}>
            <Text style={styles.tableTitle}>{t('data.activities.parachute-drop.predictionTableTitle')}</Text>
            <Select
              label={t('data.activities.parachute-drop.predictedDesignLabel')}
              value={data.predictedDesign}
              options={designOptions}
              optionLabels={designOptionLabels}
              onValueChange={(v) => updateData({ predictedDesign: v })}
            />
            
            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableHeaderCell, styles.flex2]}>{t('data.activities.parachute-drop.headerDesign')}</Text>
              <Text style={[styles.tableHeaderCell, styles.flex3]}>{t('data.activities.parachute-drop.headerPredictedTime')}</Text>
            </View>
            
            {data.trials.map((trial: TrialData) => (
              <View key={`pred-${trial.id}`} style={styles.tableRow}>
                <Text style={[styles.tableBodyCell, styles.flex2]}>{resolveParachuteTrialLabel(trial.label, t)}</Text>
                <View style={styles.flex3}>
                  <Input
                    value={trial.predictedTime}
                    onChangeText={(v) => updateTrial(trial.id, { predictedTime: v })}
                    keyboardType="numeric"
                    onLightSurface
                    containerStyle={{ marginBottom: 0 }}
                    editable={!isLocked}
                  />
                </View>
              </View>
            ))}
            {data.trials.length < 4 && !isLocked && (
              <Button
                title={t('data.activities.parachute-drop.addTrial')}
                onPress={addTrial}
                variant="outlined"
                icon={<Ionicons name="add" size={16} color={isDark ? colors.primaryLight : colors.primary} />}
                style={{ marginTop: Spacing.sm, alignSelf: 'flex-start' }}
              />
            )}
          </Card>
          
          <View style={styles.wizardNavBoth}>
            <Button 
              title={t('common.previous')} 
              variant="outlined"
              onPress={() => setActiveTab('setup')} 
              icon={<Ionicons name="arrow-back" size={16} color={colors.primary} />}
            />
            <Button 
              title={t('common.next')} 
              onPress={() => setActiveTab('experiment')} 
              iconRight={<Ionicons name="arrow-forward" size={16} color={colors.white} />}
              disabled={!predictionsValid}
            />
          </View>
        </View>
      )}

      {activeTab === 'experiment' && (
        <View>
          {renderTimerBar()}
          <Card variant="outlined" style={styles.pageCard}>
            <Text style={styles.tableTitle}>{t('data.activities.parachute-drop.actualTableTitle')}</Text>
            
            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableHeaderCell, styles.flex2]}>{t('data.activities.parachute-drop.headerDesign')}</Text>
              <Text style={[styles.tableHeaderCell, styles.flex2]}>{t('data.activities.parachute-drop.headerActualTime')}</Text>
              <Text style={[styles.tableHeaderCell, styles.flex2]}>{t('data.activities.parachute-drop.headerDifference')}</Text>
            </View>
            
            {data.trials.map((trial: TrialData, index: number) => {
              const diff = (parseFloat(trial.predictedTime) || 0) - (parseFloat(trial.actualTime) || 0);
              return (
                <View key={`act-${trial.id}`} style={styles.trialRowBlock}>
                  {index > 0 && (
                    <View style={styles.tableRowHeader}>
                      <Text style={[styles.tableHeaderCell, styles.flex2]}>{t('data.activities.parachute-drop.headerDesign')}</Text>
                      <Text style={[styles.tableHeaderCell, styles.flex2]}>{t('data.activities.parachute-drop.headerActualTime')}</Text>
                      <Text style={[styles.tableHeaderCell, styles.flex2]}>{t('data.activities.parachute-drop.headerDifference')}</Text>
                    </View>
                  )}
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableBodyCell, styles.flex2]}>{resolveParachuteTrialLabel(trial.label, t)}</Text>
                    <View style={styles.flex2}>
                      <Input
                        value={trial.actualTime}
                        onChangeText={(v) => updateTrial(trial.id, { actualTime: v })}
                        keyboardType="numeric"
                        onLightSurface
                        containerStyle={{ marginBottom: 0 }}
                        editable={!isLocked}
                      />
                    </View>
                    <Text style={[styles.tableBodyCell, styles.flex2, { textAlign: 'center' }]}>
                      {trial.actualTime ? Math.abs(diff).toFixed(2) : '-'}
                    </Text>
                  </View>

                  <View style={styles.subInputsContainer}>
                    <View style={styles.row}>
                      <View style={{ flex: 1, marginRight: Spacing.xs }}>
                        <Input
                          label={t('data.activities.parachute-drop.stoppingTime')}
                          value={trial.stoppingTime}
                          onChangeText={(v) => updateTrial(trial.id, { stoppingTime: v })}
                          keyboardType="numeric"
                          onLightSurface
                          editable={!isLocked}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: Spacing.xs }}>
                        {isLocked ? (
                          <Input
                            label={t('data.activities.parachute-drop.bounceDetect')}
                            value={trial.didBounce}
                            editable={false}
                            onLightSurface
                          />
                        ) : (
                          <Select
                            label={t('data.activities.parachute-drop.bounceDetect')}
                            value={trial.didBounce}
                            options={[
                              t('common.yes', { defaultValue: 'Yes' }),
                              t('common.no', { defaultValue: 'No' })
                            ]}
                            onValueChange={(v) => updateTrial(trial.id, { didBounce: v })}
                          />
                        )}
                      </View>
                    </View>

                    {trial.didBounce === t('common.yes') && (
                      <Input
                        label={t('data.activities.parachute-drop.reboundTime')}
                        value={trial.reboundTime}
                        onChangeText={(v) => updateTrial(trial.id, { reboundTime: v })}
                        keyboardType="numeric"
                        onLightSurface
                        editable={!isLocked}
                      />
                    )}
                    
                    <Input
                      label={t('common.notes')}
                      value={trial.notes}
                      onChangeText={(v) => updateTrial(trial.id, { notes: v })}
                      multiline
                      numberOfLines={2}
                      onLightSurface
                      editable={!isLocked}
                    />

                    {/* Video Capture */}
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
                        title={t('activities.recordVideo')} 
                        onPress={() => recordVideo(trial.id)} 
                        variant="primary"
                        icon={<Ionicons name="videocam" size={18} color={colors.white} />}
                        disabled={isLocked}
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </Card>
          
          <View style={styles.wizardNavBoth}>
            <Button 
              title={t('common.previous')} 
              variant="outlined"
              onPress={() => setActiveTab('predictions')} 
              icon={<Ionicons name="arrow-back" size={16} color={colors.primary} />}
            />
            <Button 
              title={t('common.next')} 
              onPress={() => setActiveTab('calculations')} 
              iconRight={<Ionicons name="arrow-forward" size={16} color={colors.white} />}
              disabled={!experimentValid}
            />
          </View>
        </View>
      )}

      {activeTab === 'calculations' && (
        <ScrollView style={{ flex: 1 }}>
          {renderTimerBar()}
          <Card style={[styles.pageCard, { marginBottom: Spacing.lg }]}>
            <View style={styles.instructionsHeader}>
              <Ionicons name="calculator" size={24} color={colors.primary} />
              <Text style={styles.instructionsTitle}>{actT('shared.formulasTitle')}</Text>
            </View>
            {!isHighSchool ? (
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>{t('data.activities.parachute-drop.formulaSpeedPrimary')}</Text>
              </View>
            ) : (
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>{t('data.activities.parachute-drop.formulaVelocity')}</Text>
                <Text style={styles.formulaText}>{t('data.activities.parachute-drop.formulaAcceleration')}</Text>
                <Text style={styles.formulaText}>{t('data.activities.parachute-drop.formulaNetForce')}</Text>
                <Text style={styles.formulaText}>{t('data.activities.parachute-drop.formulaDragForce')}</Text>
                <Text style={styles.formulaText}>{t('data.activities.parachute-drop.formulaGForce')}</Text>
              </View>
            )}
          </Card>

          <Card style={styles.pageCard}>
            <View style={{ marginBottom: Spacing.md }}>
              <Text style={styles.tableTitle}>{t('data.activities.parachute-drop.calculationsTableTitle')}</Text>
              <CalcEncouragementNote />
              <Button 
                title={t('data.activities.parachute-drop.btnInstantCalc')} 
                onPress={handleInstantCalculate} 
                variant="outlined" 
                size="sm"
                disabled={isLocked}
                style={{ alignSelf: 'flex-start', marginTop: Spacing.xs }}
              />
            </View>

            {!isHighSchool ? (
              <>
                <View style={styles.tableRowHeader}>
                  <Text style={[styles.tableHeaderCell, styles.flex2]}>{t('data.activities.parachute-drop.headerDesign')}</Text>
                  <Text style={[styles.tableHeaderCell, styles.flex3]}>{t('data.activities.parachute-drop.headerSpeed')}</Text>
                </View>
                {data.trials.map((trial: TrialData) => {
                  const truePhys = calculateTruePhysics(trial);
                  const isCorrect = validate(trial.manualSpeed, truePhys.speed);
                  return (
                    <View key={`calc-${trial.id}`} style={styles.tableRow}>
                      <Text style={[styles.tableBodyCell, styles.flex2]}>{resolveParachuteTrialLabel(trial.label, t)}</Text>
                      <View style={styles.flex3}>
                        <Input
                          value={trial.manualSpeed}
                          onChangeText={(v) => updateTrial(trial.id, { manualSpeed: v })}
                          keyboardType="numeric"
                          onLightSurface
                          containerStyle={{ marginBottom: 0 }}
                          error={isCorrect === false ? t('data.activities.parachute-drop.statusIncorrect') : undefined}
                          editable={!isLocked}
                        />
                      </View>
                    </View>
                  );
                })}
              </>
            ) : (
              <>
                {data.trials.map((trial: TrialData) => {
                  const truePhys = calculateTruePhysics(trial);
                  return (
                    <View key={`calc-hs-${trial.id}`} style={styles.hsCalcBlock}>
                      <Text style={styles.hsCalcTitle}>{resolveParachuteTrialLabel(trial.label, t)}</Text>
                      <View style={styles.row}>
                        <View style={styles.flex1}>
                          <Input
                            label={t('data.activities.parachute-drop.headerVelocity')}
                            value={trial.manualVelocity}
                            onChangeText={(v) => updateTrial(trial.id, { manualVelocity: v })}
                            keyboardType="numeric"
                            onLightSurface
                            error={validate(trial.manualVelocity, truePhys.vel) === false ? t('data.activities.parachute-drop.statusIncorrect') : undefined}
                            editable={!isLocked}
                          />
                        </View>
                        <View style={{ width: Spacing.sm }} />
                        <View style={styles.flex1}>
                          <Input
                            label={t('data.activities.parachute-drop.headerAccel')}
                            value={trial.manualAcceleration}
                            onChangeText={(v) => updateTrial(trial.id, { manualAcceleration: v })}
                            keyboardType="numeric"
                            onLightSurface
                            error={validate(trial.manualAcceleration, truePhys.acc) === false ? t('data.activities.parachute-drop.statusIncorrect') : undefined}
                            editable={!isLocked}
                          />
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.flex1}>
                          <Input
                            label={t('data.activities.parachute-drop.headerNetForce')}
                            value={trial.manualNetForce}
                            onChangeText={(v) => updateTrial(trial.id, { manualNetForce: v })}
                            keyboardType="numeric"
                            onLightSurface
                            error={validate(trial.manualNetForce, truePhys.nf) === false ? t('data.activities.parachute-drop.statusIncorrect') : undefined}
                            editable={!isLocked}
                          />
                        </View>
                        <View style={{ width: Spacing.sm }} />
                        <View style={styles.flex1}>
                          <Input
                            label={t('data.activities.parachute-drop.headerDragForce')}
                            value={trial.manualDragForce}
                            onChangeText={(v) => updateTrial(trial.id, { manualDragForce: v })}
                            keyboardType="numeric"
                            onLightSurface
                            error={validate(trial.manualDragForce, truePhys.df) === false ? t('data.activities.parachute-drop.statusIncorrect') : undefined}
                            editable={!isLocked}
                          />
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.flex1}>
                          <Input
                            label={t('data.activities.parachute-drop.headerGForce')}
                            value={trial.manualGForce}
                            onChangeText={(v) => updateTrial(trial.id, { manualGForce: v })}
                            keyboardType="numeric"
                            onLightSurface
                            error={validate(trial.manualGForce, truePhys.gf) === false ? t('data.activities.parachute-drop.statusIncorrect') : undefined}
                            editable={!isLocked}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </Card>
          
          <View style={styles.wizardNavBoth}>
            <Button 
              title={t('common.previous')} 
              variant="outlined"
              onPress={() => setActiveTab('experiment')} 
              icon={<Ionicons name="arrow-back" size={16} color={colors.primary} />}
            />
            <Button 
              title={t('common.save')} 
              onPress={handleFinalSave} 
              icon={<Ionicons name="save" size={16} color={colors.white} />}
              disabled={!validateAllFields()}
              loading={isSubmitting}
            />
          </View>
        </ScrollView>
      )}

      {/* Timeout Modal */}
      <RNModal visible={showTimeoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="time" size={48} color={colors.danger} style={{ marginBottom: Spacing.md }} />
            <Text style={styles.modalTitle}>{t('data.activities.parachute-drop.timeUpTitle')}</Text>
            <Text style={styles.modalText}>{t('data.activities.parachute-drop.timeUpText')}</Text>
            <View style={styles.modalButtons}>
              <Button 
                title={t('data.activities.parachute-drop.btnStartOver')} 
                onPress={handleStartOver} 
                variant="outlined"
              />
              <Button 
                title={t('data.activities.parachute-drop.btnSaveResults')} 
                onPress={handleTimeoutSaveResults} 
                variant="primary"
                loading={isSubmitting}
              />
            </View>
          </View>
        </View>
      </RNModal>
    </View>
  );
}




