import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal as RNModal, Vibration, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';

export interface EarthquakeTrial {
  id: string;
  design: string;
  outcomeMovement: string;
  wereYouRight: string;
}

export interface EarthquakeData {
  predictedBestDesign: string;
  trials: EarthquakeTrial[];
  surprises: string;
}

interface Props {
  value: any;
  onChange: (value: any) => void;
  onSubmit?: () => void;
}

const DEFAULT_TIME = 3600;

const getVibrationPattern = (intensity: string) => {
  // Pattern: [pause, vibrate, pause, vibrate, ...] in milliseconds
  switch (intensity) {
    case 'Low':
      return [0, 200, 200]; // Short pulses
    case 'Medium':
      return [0, 500, 200]; // Medium pulses
    case 'High':
      return [0, 2000, 100]; // Long pulses
    case 'Extreme':
      return [0, 5000, 50]; // Almost continuous
    default:
      return [0, 500, 200];
  }
};

export function EarthquakeForm({ value, onChange, onSubmit }: Props) {
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<'setup' | 'predictions' | 'experiment'>('setup');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [vibrationIntensity, setVibrationIntensity] = useState('Medium');
  const intensities = ['Low', 'Medium', 'High', 'Extreme'];
  
  const equipmentList = [
    'Cardboard, paper, scissors, sticky tape, plastic/paper cups',
    'Mobile phone with STEMM Lab app (vibration simulation)'
  ];
  const [checkedEquipment, setCheckedEquipment] = useState<Record<string, boolean>>({});
  const allEquipmentChecked = equipmentList.every(item => checkedEquipment[item]);

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

  useEffect(() => {
    // Ensure vibration stops if component unmounts
    return () => {
      Vibration.cancel();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getInitialData = (): EarthquakeData => ({
    predictedBestDesign: '',
    surprises: '',
    trials: [
      { id: '1', design: '4 folds + 4 pillars', outcomeMovement: '', wereYouRight: '' },
      { id: '2', design: '10 folds + 4 pillars', outcomeMovement: '', wereYouRight: '' },
      { id: '3', design: '3 folds and 6 pillars', outcomeMovement: '', wereYouRight: '' }
    ]
  });

  const defaultData = getInitialData();
  const data: EarthquakeData = {
    ...defaultData,
    ...(value || {}),
    trials: value?.trials?.length ? value.trials : defaultData.trials,
  };

  const updateData = (updates: Partial<EarthquakeData>) => onChange({ ...data, ...updates });

  const updateTrial = (id: string, updates: Partial<EarthquakeTrial>) => {
    const newTrials = data.trials.map(t => t.id === id ? { ...t, ...updates } : t);
    updateData({ trials: newTrials });
  };

  const isFormValid = () => {
    if (!data.predictedBestDesign) return false;
    for (const t of data.trials) {
      if (!t.design || !t.outcomeMovement || !t.wereYouRight) return false;
    }
    if (!data.surprises) return false;
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

  const toggleVibration = () => {
    if (isVibrating) {
      Vibration.cancel();
      setIsVibrating(false);
    } else {
      Vibration.vibrate(getVibrationPattern(vibrationIntensity), true); // loop
      setIsVibrating(true);
    }
  };

  // Restart vibration with new pattern if intensity changes while vibrating
  useEffect(() => {
    if (isVibrating) {
      Vibration.cancel();
      Vibration.vibrate(getVibrationPattern(vibrationIntensity), true);
    }
  }, [vibrationIntensity]);

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
          {['setup', 'predictions', 'experiment'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab, !isTimerRunning && activeTab !== tab && { opacity: 0.5 }]}
              onPress={() => {
                if (!isTimerRunning && tab !== 'setup') {
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
              
              <Text style={styles.instructionText}>1. Build an anti-vibration layer by folding paper/cardboard.</Text>
              <Text style={styles.instructionText}>2. Place a flat cardboard platform on top.</Text>
              <Text style={styles.instructionText}>3. Place the phone in the centre and use the Earthquake Simulator below to activate the phone's vibration motor.</Text>
              <Text style={styles.instructionText}>4. Modify the structure to reduce phone movement (e.g. more pillars, more folds).</Text>

              <Image source={require('../../../assets/images/activity4illustration.jpeg')} style={styles.illustration} resizeMode="contain" />
            </Card>

            <Card style={styles.pageCard}>
              <View style={styles.vibrationControl}>
                <View style={styles.vibrationControlHeader}>
                  <Ionicons name="pulse" size={24} color={isVibrating ? Colors.danger : Colors.primary} />
                  <Text style={styles.vibrationControlTitle}>Earthquake Simulator</Text>
                </View>
                <Text style={styles.vibrationControlDesc}>Use this to vibrate the phone during your experiment.</Text>
                
                <View style={{ marginBottom: Spacing.md }}>
                  <Text style={{...Typography.bodySmall, fontWeight: '700', marginBottom: Spacing.xs, color: Colors.text}}>Intensity Level: {vibrationIntensity}</Text>
                  
                  <View style={{ position: 'relative', marginVertical: Spacing.sm }}>
                    <Slider
                      style={{width: '100%', height: 40, zIndex: 1}}
                      minimumValue={0}
                      maximumValue={3}
                      step={1}
                      value={intensities.indexOf(vibrationIntensity)}
                      onValueChange={(val) => setVibrationIntensity(intensities[val])}
                      minimumTrackTintColor={Colors.primaryDark}
                      maximumTrackTintColor={Colors.textSecondary}
                      thumbTintColor={Colors.primaryDark}
                    />
                    
                    {/* Tick Marks (Dots) placed on top of slider track */}
                    <View style={{ position: 'absolute', width: '100%', height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, zIndex: 2 }} pointerEvents="none">
                      {[0, 1, 2, 3].map(i => (
                        <View 
                          key={i} 
                          style={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: 4, 
                            backgroundColor: i <= intensities.indexOf(vibrationIntensity) ? Colors.primaryDark : Colors.textSecondary 
                          }} 
                        />
                      ))}
                    </View>
                  </View>

                  <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.xs}}>
                    <Text style={{...Typography.caption, color: Colors.textSecondary, width: 60, textAlign: 'left'}}>Low</Text>
                    <Text style={{...Typography.caption, color: Colors.textSecondary, width: 60, textAlign: 'right'}}>Extreme</Text>
                  </View>
                </View>

                <Button 
                  title={isVibrating ? "Stop Earthquake" : "Start Earthquake"} 
                  onPress={toggleVibration} 
                  variant={isVibrating ? "danger" : "primary"}
                  fullWidth
                />
              </View>
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
              <Text style={styles.sectionTitle}>Make Your Predictions</Text>
              <Input
                label="Predict which fold design makes the phone move the least:"
                value={data.predictedBestDesign}
                onChangeText={(v) => updateData({ predictedBestDesign: v })}
                placeholder="e.g. 10 folds with 4 pillars"
                editable={!isLocked}
                onLightSurface
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
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md}}>
                <Text style={styles.sectionTitle}>Record Trials</Text>
                <TouchableOpacity onPress={toggleVibration} style={[styles.miniVibrateBtn, isVibrating && styles.miniVibrateBtnActive]}>
                  <Ionicons name="pulse" size={20} color={isVibrating ? Colors.white : Colors.primary} />
                </TouchableOpacity>
              </View>
              
              {data.trials.map((trial, index) => (
                <View key={trial.id} style={styles.trialBlock}>
                  <Text style={styles.trialTitle}>Design {index + 1}</Text>
                  
                  <Input
                    label="Design Description"
                    value={trial.design}
                    onChangeText={(v) => updateTrial(trial.id, { design: v })}
                    placeholder="e.g. 4 folds + 4 pillars"
                    editable={!isLocked}
                    onLightSurface
                  />

                  <View style={{flexDirection: 'row', gap: Spacing.sm}}>
                    <View style={{flex: 1}}>
                      <Input
                        label="Outcome (Movement)"
                        value={trial.outcomeMovement}
                        onChangeText={(v) => updateTrial(trial.id, { outcomeMovement: v })}
                        placeholder="e.g. +/- 1cm or 4cm"
                        editable={!isLocked}
                        onLightSurface
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <Select
                        label="Were you right?"
                        value={trial.wereYouRight}
                        options={['Yes', 'No']}
                        onValueChange={(v) => updateTrial(trial.id, { wereYouRight: v })}
                        disabled={isLocked}
                      />
                    </View>
                  </View>
                </View>
              ))}
              
              {!isLocked && (
                <Button 
                  title="Add Design" 
                  variant="ghost" 
                  onPress={() => {
                    const newId = (data.trials.length + 1).toString();
                    updateData({ trials: [...data.trials, { id: newId, design: `Design ${newId}`, outcomeMovement: '', wereYouRight: '' }] });
                  }} 
                  icon={<Ionicons name="add" size={16} color={Colors.primary} />}
                />
              )}
            </Card>

            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>Reflection</Text>
              <Input
                label="Any surprises?"
                value={data.surprises}
                onChangeText={(v) => updateData({ surprises: v })}
                multiline
                numberOfLines={3}
                editable={!isLocked}
                onLightSurface
              />
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => setActiveTab('predictions')} />
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
  illustration: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  vibrationControl: {
    backgroundColor: Colors.primaryLight + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  vibrationControlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  vibrationControlTitle: {
    ...Typography.body,
    fontWeight: '700',
    marginLeft: Spacing.sm,
  },
  vibrationControlDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  miniVibrateBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniVibrateBtnActive: {
    backgroundColor: Colors.danger,
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
});
