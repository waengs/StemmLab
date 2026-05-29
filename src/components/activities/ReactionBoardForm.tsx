import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Modal as RNModal,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { ReactionBoardExperiment } from './ReactionBoardExperiment';

export interface ReactionBoardData {
  predictedReactionTime: string;
  predictedAccuracy: string;
  reactionTime: number | null;
  accuracy: number | null;
  notes: string;
}

interface Props {
  value: any;
  onChange: (value: any) => void;
  onSubmit?: () => void;
}

const DEFAULT_TIME = 900; // 15 mins for this activity

function getInitialData(): ReactionBoardData {
  return {
    predictedReactionTime: '',
    predictedAccuracy: '',
    reactionTime: null,
    accuracy: null,
    notes: '',
  };
}

export function ReactionBoardForm({ value, onChange, onSubmit }: Props) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'setup' | 'predictions' | 'experiment' | 'results'>('setup');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const equipmentList = [
    t('data.activities.reaction-board.equipmentPhone', { defaultValue: 'Mobile phone with STEMM Lab app' }),
    t('data.activities.reaction-board.equipmentSpace', { defaultValue: 'Clear working space' }),
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
  const data: ReactionBoardData = {
    ...defaultData,
    ...(value as Partial<ReactionBoardData>),
  };

  const startTimerOnInteraction = () => {
    if (!isTimerRunning && !isLocked && timeLeft > 0) {
      setIsTimerRunning(true);
    }
  };

  const updateData = (updates: Partial<ReactionBoardData>) => {
    if (isLocked) return;
    startTimerOnInteraction();
    onChange({ ...data, ...updates });
  };

  const isFormValid = () => {
    return data.predictedReactionTime && data.predictedAccuracy && data.reactionTime !== null && data.accuracy !== null;
  };

  const handleComplete = () => {
    if (!isFormValid()) {
      Alert.alert(
        t('activities.incompleteTitle', { defaultValue: 'Incomplete Data' }),
        t('activities.incompleteMsg', { defaultValue: 'Please complete all phases of the experiment first.' })
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

  const tabs = ['setup', 'predictions', 'experiment', 'results'] as const;

  return (
    <View style={styles.container}>
      <RNModal visible={showTimeoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('data.activities.reaction-board.timeUpTitle', { defaultValue: 'Time is up!' })}
            </Text>
            <Text style={styles.modalText}>
              {t('data.activities.reaction-board.timeUpText', {
                defaultValue: 'Your 15 minutes are up. The form is now locked, but you can still review your data.',
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
                {t(`data.activities.reaction-board.tabs.${tab}`, {
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
                {t('data.activities.reaction-board.timerTitle', { defaultValue: 'Activity Timer (15 min)' })}
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
              <Text style={styles.instructionText}>1. Phase 1: Tap the screen as soon as the hidden button appears.</Text>
              <Text style={styles.instructionText}>2. Phase 2: Repeat using your non-dominant hand.</Text>
              <Text style={styles.instructionText}>3. Phase 3: Trace a moving shape on the screen to measure your coordination.</Text>
            </Card>

            <Button title={t('common.next', { defaultValue: 'Next' })} onPress={() => setActiveTab('predictions')} disabled={!allEquipmentChecked} />
          </View>
        )}

        {activeTab === 'predictions' && (
          <View>
            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>
                {t('data.activities.reaction-board.predictionsTitle', { defaultValue: 'Questions Before the Experiment' })}
              </Text>

              <Input
                label={t('data.activities.reaction-board.predictReactionTitle', { defaultValue: 'Predict your reaction time (in ms)' })}
                value={data.predictedReactionTime}
                onChangeText={(v) => updateData({ predictedReactionTime: v })}
                keyboardType="numeric"
                editable={!isLocked}
                placeholder="e.g., 250"
              />

              <Input
                label={t('data.activities.reaction-board.predictAccuracyTitle', { defaultValue: 'Predict your tracing accuracy (%)' })}
                value={data.predictedAccuracy}
                onChangeText={(v) => updateData({ predictedAccuracy: v })}
                keyboardType="numeric"
                editable={!isLocked}
                placeholder="e.g., 85"
              />
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => setActiveTab('setup')} />
              <Button title={t('common.next', { defaultValue: 'Next' })} onPress={() => setActiveTab('experiment')} />
            </View>
          </View>
        )}

        {activeTab === 'experiment' && (
          <View>
            <Card style={styles.pageCard}>
              <ReactionBoardExperiment
                onComplete={(res) => {
                  updateData({ reactionTime: res.reactionTime, accuracy: res.accuracy });
                  setActiveTab('results');
                }}
              />
            </Card>
            
            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous', { defaultValue: 'Previous' })} variant="outlined" onPress={() => setActiveTab('predictions')} />
              <Button 
                title={t('common.next', { defaultValue: 'Next' })} 
                onPress={() => setActiveTab('results')} 
                disabled={data.reactionTime === null} 
              />
            </View>
          </View>
        )}

        {activeTab === 'results' && (
          <View>
            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>
                {t('data.activities.reaction-board.resultsTitle', { defaultValue: 'Results' })}
              </Text>

              <View style={styles.tableRowHeader}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Metric</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Predicted</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Actual</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Reaction Time</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{data.predictedReactionTime || '—'} ms</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{data.reactionTime !== null ? `${data.reactionTime} ms` : '—'}</Text>
              </View>
              
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Tracing Accuracy</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{data.predictedAccuracy || '—'}%</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{data.accuracy !== null ? `${data.accuracy}%` : '—'}</Text>
              </View>

              <Text style={styles.subSectionTitle}>Reflection Notes</Text>
              <Input
                label={t('common.notes', { defaultValue: 'Any surprises? Were you right?' })}
                value={data.notes}
                onChangeText={(v) => updateData({ notes: v })}
                multiline
                numberOfLines={3}
                editable={!isLocked}
                placeholder="Write your thoughts..."
              />
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.xl },
  modalContent: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  modalTitle: { ...Typography.h2, marginBottom: Spacing.sm },
  modalText: { ...Typography.body, marginBottom: Spacing.lg, color: Colors.textSecondary },
});
