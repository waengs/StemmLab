import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal as RNModal, Vibration } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import { ActivityInstructionsList } from './ActivityInstructionsList';
import { ActivityIllustration } from './ActivityIllustration';
import { EquipmentChecklist } from './EquipmentChecklist';
import { ActivityTimerBar } from './ActivityTimerBar';
import { actT } from '../../utils/activityContent';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spacing, Typography, BorderRadius  } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import {
  EARTHQUAKE_INTENSITY_KEYS,
  EARTHQUAKE_PRESET_DESIGNS,
  designOptionsForTrial,
  getEarthquakeDesignLabels,
  getVibrationPattern,
  newExtraEarthquakeDesignId,
  resolveEarthquakeDesign,
  resolveEarthquakeIntensity,
  type EarthquakeIntensityKey,
} from '../../utils/earthquakeLabels';

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
  isSubmitting?: boolean;
}

const DEFAULT_TIME = 3600;

function useEarthquakeFormStyles() {
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
  illustration: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  vibrationControl: {
    backgroundColor: colors.primaryLight + '20',
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
    ...typography.body,
    fontWeight: '700',
    marginLeft: Spacing.sm,
  },
  vibrationControlDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: Spacing.md,
  },
  miniVibrateBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniVibrateBtnActive: {
    backgroundColor: colors.danger,
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
  }));
}

export function EarthquakeForm({
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const styles = useEarthquakeFormStyles();
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<'setup' | 'predictions' | 'experiment'>('setup');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [vibrationIntensity, setVibrationIntensity] = useState<EarthquakeIntensityKey>('medium');

  const equipmentString = t('data.activities.earthquake.equipment');
  const designLabels = useMemo(() => getEarthquakeDesignLabels(t), [t]);
  const presetDesignOptionLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const d of EARTHQUAKE_PRESET_DESIGNS) {
      labels[d] = designLabels[d];
    }
    return labels;
  }, [designLabels]);
  const equipmentList = useMemo(
    () => equipmentString.split(',').map((s) => s.trim()),
    [equipmentString]
  );
  const yesNoOptions = useMemo(() => [t('common.yes'), t('common.no')], [t]);
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
    if (!data.surprises?.trim()) return false;
    return true;
  };

  const predictionsValid = !!data.predictedBestDesign;
  const experimentValid = data.trials.every(t => t.outcomeMovement && t.wereYouRight);

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
          {['setup', 'predictions', 'experiment'].map((tab) => (
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'setup' && (
          <View>
            <Card style={styles.pageCard}>
              <ActivityInstructionsList
                activityId="earthquake"
                durationMinutes={60}
                textStyle={styles.instructionText}
                titleStyle={styles.sectionTitle}
              />

              <ActivityIllustration activityId="earthquake" style={styles.illustration} />
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
              <Text style={styles.sectionTitle}>{t('activities.predictionsTitle')}</Text>
              <Select
                label={t('data.activities.earthquake.predictBestDesignLabel')}
                value={data.predictedBestDesign}
                options={[...EARTHQUAKE_PRESET_DESIGNS]}
                optionLabels={presetDesignOptionLabels}
                onValueChange={(v) => updateData({ predictedBestDesign: v })}
                disabled={isLocked}
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
              <View style={styles.vibrationControl}>
                <View style={styles.vibrationControlHeader}>
                  <Ionicons name="pulse" size={24} color={isVibrating ? colors.danger : colors.primary} />
                  <Text style={styles.vibrationControlTitle}>{t('data.activities.earthquake.simulatorTitle')}</Text>
                </View>
                <Text style={styles.vibrationControlDesc}>{t('data.activities.earthquake.simulatorDesc')}</Text>
                
                <View style={{ marginBottom: Spacing.md }}>
                  <Text style={{...typography.bodySmall, fontWeight: '700', marginBottom: Spacing.xs, color: colors.text}}>
                    {t('data.activities.earthquake.intensityLevel', {
                      level: resolveEarthquakeIntensity(vibrationIntensity, t),
                    })}
                  </Text>
                  
                  <View style={{ position: 'relative', marginVertical: Spacing.sm }}>
                    <Slider
                      style={{width: '100%', height: 40, zIndex: 1}}
                      minimumValue={0}
                      maximumValue={3}
                      step={1}
                      value={EARTHQUAKE_INTENSITY_KEYS.indexOf(vibrationIntensity)}
                      onValueChange={(val) =>
                        setVibrationIntensity(EARTHQUAKE_INTENSITY_KEYS[Math.round(val)] ?? 'medium')
                      }
                      minimumTrackTintColor={colors.primaryDark}
                      maximumTrackTintColor={colors.textSecondary}
                      thumbTintColor={colors.primaryDark}
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
                            backgroundColor:
                              i <= EARTHQUAKE_INTENSITY_KEYS.indexOf(vibrationIntensity)
                                ? colors.primaryDark
                                : colors.textSecondary 
                          }} 
                        />
                      ))}
                    </View>
                  </View>

                  <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.xs}}>
                    <Text style={{...typography.caption, color: colors.textSecondary, width: 60, textAlign: 'left'}}>
                      {t('data.activities.earthquake.intensityLow')}
                    </Text>
                    <Text style={{...typography.caption, color: colors.textSecondary, width: 60, textAlign: 'right'}}>
                      {t('data.activities.earthquake.intensityExtreme')}
                    </Text>
                  </View>
                </View>

                <Button 
                  title={isVibrating ? t('data.activities.earthquake.stopEarthquake') : t('data.activities.earthquake.startEarthquake')} 
                  onPress={toggleVibration} 
                  variant={isVibrating ? "danger" : "primary"}
                  fullWidth
                />
              </View>
            </Card>

            <Card style={styles.pageCard}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md}}>
                <Text style={styles.sectionTitle}>{t('activities.trialsTitle')}</Text>
              </View>
              
              {data.trials.map((trial, index) => (
                <View key={trial.id} style={styles.trialBlock}>
                  <Text style={styles.trialTitle}>{t('data.activities.earthquake.designNumber', { n: index + 1 })}</Text>
                  
                  <Select
                    label={t('data.activities.earthquake.designDescription')}
                    value={trial.design}
                    options={designOptionsForTrial(trial.design)}
                    optionLabels={Object.fromEntries(
                      designOptionsForTrial(trial.design).map((d) => [d, resolveEarthquakeDesign(d, t)])
                    )}
                    onValueChange={(v) => updateTrial(trial.id, { design: v })}
                    disabled={isLocked}
                  />

                  <View style={{flexDirection: 'row', gap: Spacing.sm}}>
                    <View style={{flex: 1}}>
                      <Input
                        label={t('data.activities.earthquake.outcomeMovement')}
                        value={trial.outcomeMovement}
                        onChangeText={(v) => updateTrial(trial.id, { outcomeMovement: v })}
                        placeholder={t('data.activities.earthquake.outcomePlaceholder')}
                        editable={!isLocked}
                        onLightSurface
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <Select
                        label={t('activities.wereYouRight')}
                        value={trial.wereYouRight}
                        options={yesNoOptions}
                        onValueChange={(v) => updateTrial(trial.id, { wereYouRight: v })}
                        disabled={isLocked}
                      />
                    </View>
                  </View>
                </View>
              ))}
              
              {!isLocked && (
                <Button 
                  title={t('data.activities.earthquake.addDesign')} 
                  variant="ghost" 
                  onPress={() => {
                    const newId = (data.trials.length + 1).toString();
                    updateData({
                      trials: [
                        ...data.trials,
                        {
                          id: newId,
                          design: newExtraEarthquakeDesignId(data.trials.length + 1),
                          outcomeMovement: '',
                          wereYouRight: '',
                        },
                      ],
                    });
                  }} 
                  icon={<Ionicons name="add" size={16} color={colors.primary} />}
                />
              )}
            </Card>

            <Card style={styles.pageCard}>
              <Text style={styles.sectionTitle}>{actT('shared.reflectionTitle')}</Text>
              <Input
                label={t('data.activities.earthquake.surprisesLabel')}
                value={data.surprises}
                onChangeText={(v) => updateData({ surprises: v })}
                multiline
                numberOfLines={3}
                editable={!isLocked}
                onLightSurface
              />
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous')} variant="outlined" onPress={() => setActiveTab('predictions')} />
              <Button title={t('activities.complete', { defaultValue: 'Complete Activity' })} onPress={handleComplete} variant="primary" disabled={!experimentValid || !data.surprises?.trim()} loading={isSubmitting} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}


