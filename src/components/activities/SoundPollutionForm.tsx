import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal as RNModal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { useRequireAuth } from '../../stores';

export interface SoundPollutionTrial {
  id: string;
  action: string;
  predictionComparison: string;
  predictionTarget: string;
  outcomeDb: string;
  wereYouRight: string;
  location: string;
}

export interface SoundPollutionData {
  predictedLoudestAction: string;
  trials: SoundPollutionTrial[];
  surprises: string;
  needEarMuffs: string;
}

interface Props {
  value: any;
  onChange: (value: any) => void;
  onSubmit?: () => void;
}

const DEFAULT_TIME = 3600;

export function SoundPollutionForm({ value, onChange, onSubmit }: Props) {
  const { t } = useTranslation();
  const { team } = useRequireAuth();
  
  const [activeTab, setActiveTab] = useState<'setup' | 'predictions' | 'experiment'>('setup');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const equipmentList = ['Mobile phone with STEMM Lab app (or external sound meter)'];
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getInitialData = (): SoundPollutionData => ({
    predictedLoudestAction: '',
    surprises: '',
    needEarMuffs: '',
    trials: [
      { id: '1', action: 'Dropping a book on the table', predictionComparison: '', predictionTarget: '', outcomeDb: '', wereYouRight: '', location: '' },
      { id: '2', action: 'Normal talking', predictionComparison: '', predictionTarget: '', outcomeDb: '', wereYouRight: '', location: '' },
      { id: '3', action: 'Stamping feet', predictionComparison: '', predictionTarget: '', outcomeDb: '', wereYouRight: '', location: '' }
    ]
  });

  const defaultData = getInitialData();
  const data: SoundPollutionData = {
    ...defaultData,
    ...(value || {}),
    trials: value?.trials?.length ? value.trials : defaultData.trials,
  };

  const updateData = (updates: Partial<SoundPollutionData>) => onChange({ ...data, ...updates });

  const updateTrial = (id: string, updates: Partial<SoundPollutionTrial>) => {
    const newTrials = data.trials.map(t => t.id === id ? { ...t, ...updates } : t);
    updateData({ trials: newTrials });
  };

  const isFormValid = () => {
    if (!data.predictedLoudestAction) return false;
    for (const t of data.trials) {
      if (!t.action || !t.predictionComparison || !t.outcomeDb || !t.wereYouRight) return false;
    }
    if (!data.surprises || !data.needEarMuffs) return false;
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
              <Text style={styles.instructionText}>1. Measure noise from different actions (e.g., dropping objects, talking, walking, stamping feet).</Text>
              <Text style={styles.instructionText}>2. Record sound levels (in decibels) and locations for each action.</Text>
              <Text style={styles.instructionText}>3. Map out the loud and quiet zones in your area.</Text>
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
                label="Predict which action will create the loudest sound:"
                value={data.predictedLoudestAction}
                onChangeText={(v) => updateData({ predictedLoudestAction: v })}
                placeholder="e.g. Dropping a book"
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
              <Text style={styles.sectionTitle}>Record Trials</Text>
              
              {data.trials.map((trial, index) => (
                <View key={trial.id} style={styles.trialBlock}>
                  <Text style={styles.trialTitle}>Action {index + 1}</Text>
                  
                  <Input
                    label="Action Description"
                    value={trial.action}
                    onChangeText={(v) => updateTrial(trial.id, { action: v })}
                    editable={!isLocked}
                    onLightSurface
                  />

                  <Input
                    label="Location"
                    value={trial.location}
                    onChangeText={(v) => updateTrial(trial.id, { location: v })}
                    placeholder="e.g. Near the window"
                    editable={!isLocked}
                    onLightSurface
                  />
                  
                  <View style={{flexDirection: 'row', gap: Spacing.sm}}>
                    <View style={{flex: 1}}>
                      <Select
                        label="Prediction"
                        value={trial.predictionComparison}
                        options={['Louder than', 'Softer than', 'Similar to']}
                        onValueChange={(v) => updateTrial(trial.id, { predictionComparison: v })}
                        disabled={isLocked}
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <Input
                        label="Target Action"
                        value={trial.predictionTarget}
                        onChangeText={(v) => updateTrial(trial.id, { predictionTarget: v })}
                        placeholder="e.g. Action 1"
                        editable={!isLocked}
                        onLightSurface
                      />
                    </View>
                  </View>

                  <View style={{flexDirection: 'row', gap: Spacing.sm}}>
                    <View style={{flex: 1}}>
                      <Input
                        label="Outcome (dB)"
                        value={trial.outcomeDb}
                        onChangeText={(v) => updateTrial(trial.id, { outcomeDb: v })}
                        keyboardType="numeric"
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
                  title="Add Action" 
                  variant="ghost" 
                  onPress={() => {
                    const newId = (data.trials.length + 1).toString();
                    updateData({ trials: [...data.trials, { id: newId, action: `Action ${newId}`, predictionComparison: '', predictionTarget: '', outcomeDb: '', wereYouRight: '', location: '' }] });
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
              <Select
                label="Should we wear ear muffs in your classroom?"
                value={data.needEarMuffs}
                options={['Yes, definitely', 'Maybe sometimes', 'No, it is safe']}
                onValueChange={(v) => updateData({ needEarMuffs: v })}
                disabled={isLocked}
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
