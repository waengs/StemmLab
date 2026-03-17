import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView, Modal as RNModal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { useRequireAuth } from '../../stores';
import { TrialVideoPlayer } from '../sensors/TrialVideoPlayer';

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

const STIFFNESS_DATA = [
  { material: 'Thin printer paper', thickness: '0.1', k: '0.05', notes: 'Bends very easily' },
  { material: 'Standard card stock', thickness: '0.25', k: '0.2', notes: 'Moderate bend' },
  { material: 'Thin cardboard', thickness: '0.5', k: '0.5', notes: 'Much harder to bend' },
  { material: 'Corrugated cardboard', thickness: '3', k: '2–3', notes: 'Very stiff, almost no bend' },
];

export function HandFanForm({ value, onChange, onSubmit }: Props) {
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
  
  const equipmentList = [
    'Paper and cardboard',
    'Scissors',
    'Mobile phone',
    'Sticky Tape',
    'STEMM Mobile App',
    'Protractor'
  ];
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



  const recordVideo = async (trialId: string) => {
    if (isLocked) return;
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(t('common.cameraPermissionMsg', { defaultValue: 'Camera permission is required' }));
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
          {['setup', 'predictions', 'experiment', ...(isHighSchool ? ['calculations'] : [])].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab, !isTimerRunning && activeTab !== tab && { opacity: 0.5 }]}
              onPress={() => {
                if (!isTimerRunning) {
                  Alert.alert("Timer Required", "Please start the timer to navigate to other sections.");
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TIMER (Visible on all tabs) */}
        <View style={{ marginBottom: Spacing.lg }}>
          <View style={styles.stickyTimer}>
            <View style={{flex: 1}}>
              <Text style={styles.timerTitle}>{t('activities.timerTitle', { defaultValue: 'Activity Timer (60 Min)' })}</Text>
              <Text style={[styles.timerDisplay, timeLeft <= 300 && {color: Colors.danger}]}>{formatTime(timeLeft)}</Text>
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
                    {checkedEquipment[item] && <Ionicons name="checkmark" size={16} color={Colors.white} />}
                  </View>
                  <Text style={styles.checklistText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </Card>

            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>{t('activities.instructionsTitle', { defaultValue: 'Instructions' })}</Text>
              <Text style={styles.instructionText}>1. Stand paper upright on a table.</Text>
              <Text style={styles.instructionText}>2. Fan air from the distance specified in your current trial.</Text>
              <Text style={styles.instructionText}>3. Observe and record movement.</Text>
              <Text style={styles.instructionText}>4. Pause the video in slow motion and record the bend angle using the screen and a protractor.</Text>
              <Text style={styles.instructionText}>5. Repeat this process for all 4 preset fan designs (Paper Wide, Paper Narrow, Cardboard Wide, Cardboard Narrow).</Text>
              <Text style={styles.instructionText}>6. For each design, test the 3 different fan distances (15cm, 30cm, 45cm). Keep the target material as Paper for all trials.</Text>
              <Image 
                source={require('../../../assets/images/activity3illustration.jpeg')} 
                style={styles.illustration}
                resizeMode="contain"
              />
            </Card>

            <Button 
              title={t('common.next', { defaultValue: 'Next' })} 
              onPress={() => setActiveTab('predictions')} 
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
                label="Predict which fan material is going to perform the best"
                value={data.predictedMaterial}
                options={['Paper', 'Cardboard', 'Other']}
                onValueChange={(v) => updateData({ predictedMaterial: v })}
                disabled={isLocked}
              />
              
              <Select
                label="Predict which fan design is going to perform the best"
                value={data.predictedDesign}
                options={[
                  'Paper, Wide Fold',
                  'Paper, Narrow Fold',
                  'Cardboard, Wide Fold',
                  'Cardboard, Narrow Fold'
                ]}
                onValueChange={(v) => updateData({ predictedDesign: v })}
                disabled={isLocked}
              />
              
              <Select
                label="Predict which fan distance is going to perform the best"
                value={data.predictedDistance || ''}
                options={['15cm', '30cm', '45cm']}
                onValueChange={(v) => updateData({ predictedDistance: v })}
                disabled={isLocked}
              />
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => setActiveTab('setup')} />
              <Button title={t('common.next', { defaultValue: 'Next' })} onPress={() => setActiveTab('experiment')} />
            </View>
          </View>
        )}

        {/* EXPERIMENT TAB */}
        {activeTab === 'experiment' && (
          <View>
            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>{t('activities.trialsTitle', { defaultValue: 'Record Trials' })}</Text>
              
              {data.trials.map((trial, index) => (
                <View key={trial.id} style={styles.trialBlock}>
                  <Text style={styles.trialTitle}>Trial {index + 1}</Text>
                  
                  <Input
                    label="Fan Design"
                    value={trial.design}
                    onChangeText={(v) => updateTrial(trial.id, { design: v })}
                    editable={!isLocked}
                    onLightSurface
                  />
                  
                  <Select
                    label="Fan Material"
                    value={trial.fanMaterial}
                    options={['Paper', 'Cardboard']}
                    onValueChange={(v) => updateTrial(trial.id, { fanMaterial: v })}
                    disabled={isLocked}
                  />

                  <Select
                    label="Target Vertical Material"
                    value={trial.targetMaterial}
                    options={['Paper', 'Cardboard']}
                    onValueChange={(v) => updateTrial(trial.id, { targetMaterial: v })}
                    disabled={isLocked}
                  />
                  
                  <Select
                    label="Fan Distance"
                    value={trial.distance}
                    options={['15cm', '30cm', '45cm']}
                    onValueChange={(v) => updateTrial(trial.id, { distance: v })}
                    disabled={isLocked}
                  />

                  <Input
                    label="Max Bend Angle (degrees)"
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
                          title="Retake Video" 
                          onPress={() => recordVideo(trial.id)} 
                          variant="outlined"
                          size="sm"
                          style={{ marginTop: Spacing.sm }}
                          icon={<Ionicons name="camera-reverse" size={16} color={Colors.primary} />}
                        />
                      )}
                    </View>
                  ) : (
                    <Button 
                      title="Record Slow-Mo Video" 
                      onPress={() => recordVideo(trial.id)} 
                      variant="primary"
                      icon={<Ionicons name="videocam" size={18} color={Colors.white} />}
                      disabled={isLocked}
                      style={{ marginTop: Spacing.sm }}
                    />
                  )}
                </View>
              ))}

            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => setActiveTab('predictions')} />
              {isHighSchool ? (
                <Button title={t('common.next', { defaultValue: 'Next' })} onPress={() => setActiveTab('calculations')} />
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
                <Ionicons name="calculator" size={24} color={Colors.primary} />
                <Text style={styles.instructionsTitle}>{t('activities.formulasTitle', { defaultValue: 'Helpful Formulas' })}</Text>
              </View>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}><Text style={{fontWeight: '700'}}>Force (N) =</Text> k × Max Bend Angle (°)</Text>
              </View>
            </Card>

            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>{t('activities.stiffnessTitle', { defaultValue: 'Material Stiffness Reference' })}</Text>
              
              <View style={{ marginTop: Spacing.sm }}>
                <View style={styles.tableRowHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Material</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>k</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Notes</Text>
                </View>
                {STIFFNESS_DATA.map((row, i) => (
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
                <Text style={styles.tableTitle}>Calculate Force</Text>
                {!isLocked && (
                  <Button 
                    title="Instant Calc (-20 pts)" 
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
                    <Text style={styles.calcTitle}>Trial {i + 1}: {trial.design} ({trial.targetMaterial})</Text>
                    <Text style={styles.calcText}>Max Bend: {trial.maxBendAngle || '0'}°</Text>
                    <Input
                      label="Calculated Force (N)"
                      value={trial.manualForce}
                      onChangeText={(v) => updateTrial(trial.id, { manualForce: v })}
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
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
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
    borderBottomColor: Colors.primary,
  },
  tabText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '700',
  },
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
  timerTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  timerDisplay: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
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
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checklistText: {
    ...Typography.body,
    flex: 1,
  },
  instructionText: {
    ...Typography.body,
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
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  trialTitle: {
    ...Typography.h3,
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
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableCell: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    paddingRight: Spacing.sm,
  },
  tableHeaderCell: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.text,
    paddingRight: Spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tableTitle: {
    ...Typography.h3,
  },
  calcBlock: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  calcTitle: {
    ...Typography.label,
    marginBottom: Spacing.xs,
  },
  calcText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.danger,
    marginBottom: Spacing.sm,
  },
  modalText: {
    ...Typography.body,
    color: Colors.textSecondary,
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
    ...Typography.h3,
    color: Colors.primary,
  },
  formulaBox: {
    backgroundColor: Colors.primary + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  formulaText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
});
