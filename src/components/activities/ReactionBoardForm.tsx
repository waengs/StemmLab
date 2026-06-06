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
import { ActivityInstructionsList } from './ActivityInstructionsList';
import { ActivityIllustration } from './ActivityIllustration';
import { EquipmentChecklist } from './EquipmentChecklist';
import { ActivityTimerBar } from './ActivityTimerBar';
import { actT } from '../../utils/activityContent';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spacing, Typography, BorderRadius  } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
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
  isSubmitting?: boolean;
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

function useReactionBoardFormStyles() {
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
  tableCell: { ...typography.bodySmall },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.xl },
  modalContent: { backgroundColor: colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  modalTitle: { ...typography.h2, marginBottom: Spacing.sm },
  modalText: { ...typography.body, marginBottom: Spacing.lg, color: colors.textSecondary },
  }));
}

export function ReactionBoardForm({
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const styles = useReactionBoardFormStyles();
  const { colors } = useTheme();

  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'setup' | 'predictions' | 'experiment' | 'results'>('setup');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const equipmentList = [
    t('data.activities.reaction-board.equipmentPhone', { defaultValue: 'Mobile phone with Stemm Lab app' }),
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

  const defaultData = getInitialData();
  const data: ReactionBoardData = {
    ...defaultData,
    ...(value as Partial<ReactionBoardData>),
  };

  const updateData = (updates: Partial<ReactionBoardData>) => {
    if (isLocked) return;
    onChange({ ...data, ...updates });
  };

  const isFormValid = () => {
    return !!data.predictedReactionTime?.trim() && !!data.predictedAccuracy?.trim() && data.reactionTime !== null && data.accuracy !== null;
  };

  const predictionsValid = !!data.predictedReactionTime?.trim() && !!data.predictedAccuracy?.trim();

  const handleComplete = () => {
    if (!isFormValid()) {
      Alert.alert(
        t('activities.incompleteTitle', { defaultValue: 'Incomplete Data' }),
        t('data.activities.reaction-board.incompleteExperimentMsg')
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
  const timerTitle = t('data.activities.reaction-board.timerTitle', { defaultValue: 'Activity Timer (15 min)' });
  const showTimerControls = activeTab !== 'setup' || isTimerRunning;

  const promptResetTimer = () => {
    Alert.alert(t('activities.resetTimerTitle'), t('activities.resetTimerMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('activities.startOver'), style: 'destructive', onPress: handleStartOver },
    ]);
  };

  const renderTimerBar = () => (
    <ActivityTimerBar
      durationMinutes={15}
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
                  Alert.alert(t('activities.timerRequiredTitle'), t('activities.timerRequiredMsg'));
                  return;
                }
                setActiveTab(tab);
              }}
              disabled={!isTimerRunning && activeTab !== tab}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {t(`data.activities.reaction-board.tabs.${tab}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'setup' && (
          <View>
            <Card style={styles.pageCard}>
              <ActivityInstructionsList
                activityId="reaction-board"
                durationMinutes={15}
                textStyle={styles.instructionText}
                titleStyle={styles.sectionTitle}
              />
              <ActivityIllustration activityId="reaction-board" style={styles.illustration} />
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
              onPress={() => {
                setIsTimerRunning(true);
                setActiveTab('predictions');
              }}
              disabled={!allEquipmentChecked}
            />
          </View>
        )}

        {activeTab === 'predictions' && (
          <View>
            {renderTimerBar()}
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
                placeholder={t('data.activities.reaction-board.predictReactionPlaceholder')}
              />

              <Input
                label={t('data.activities.reaction-board.predictAccuracyTitle', { defaultValue: 'Predict your tracing accuracy (%)' })}
                value={data.predictedAccuracy}
                onChangeText={(v) => updateData({ predictedAccuracy: v })}
                keyboardType="numeric"
                editable={!isLocked}
                placeholder={t('data.activities.reaction-board.predictAccuracyPlaceholder')}
              />
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous')} variant="outlined" onPress={() => setActiveTab('setup')} />
              <Button title={t('common.next')} onPress={() => setActiveTab('experiment')} disabled={!predictionsValid} />
            </View>
          </View>
        )}

        {activeTab === 'experiment' && (
          <View>
            {renderTimerBar()}
            <Card style={styles.pageCard}>
              <ReactionBoardExperiment
                onComplete={(res) => {
                  updateData({ reactionTime: res.reactionTime, accuracy: res.accuracy });
                  setActiveTab('results');
                }}
              />
            </Card>
            
            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous')} variant="outlined" onPress={() => setActiveTab('predictions')} />
              <Button 
                title={t('common.next')} 
                onPress={() => setActiveTab('results')} 
                disabled={data.reactionTime === null || data.accuracy === null} 
              />
            </View>
          </View>
        )}

        {activeTab === 'results' && (
          <View>
            {renderTimerBar()}
            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>
                {t('data.activities.reaction-board.resultsTitle', { defaultValue: 'Results' })}
              </Text>

              <View style={styles.tableRowHeader}>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {t('data.activities.reaction-board.resultsTable.metric')}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                  {t('data.activities.reaction-board.resultsTable.predicted')}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                  {t('data.activities.reaction-board.resultsTable.actual')}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {t('data.activities.reaction-board.resultsTable.reactionTime')}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{data.predictedReactionTime || '—'} ms</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{data.reactionTime !== null ? `${data.reactionTime} ms` : '—'}</Text>
              </View>
              
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {t('data.activities.reaction-board.resultsTable.tracingAccuracy')}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{data.predictedAccuracy || '—'}%</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{data.accuracy !== null ? `${data.accuracy}%` : '—'}</Text>
              </View>

              <Text style={styles.subSectionTitle}>{actT('shared.reflectionNotes')}</Text>
              <Input
                label={t('common.notes', { defaultValue: 'Any surprises? Were you right?' })}
                value={data.notes}
                onChangeText={(v) => updateData({ notes: v })}
                multiline
                numberOfLines={3}
                editable={!isLocked}
                placeholder={t('data.activities.reaction-board.resultsTable.notesPlaceholder')}
              />
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous')} variant="outlined" onPress={() => setActiveTab('experiment')} />
              <Button title={t('activities.complete', { defaultValue: 'Complete Activity' })} onPress={handleComplete} variant="primary" loading={isSubmitting} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}


