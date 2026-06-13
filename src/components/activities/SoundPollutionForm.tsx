import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal as RNModal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActivityInstructionsList } from './ActivityInstructionsList';
import { ActivityIllustration } from './ActivityIllustration';
import { EquipmentChecklist } from './EquipmentChecklist';
import { ActivityTimerBar } from './ActivityTimerBar';
import { actT } from '../../utils/activityContent';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SoundMeterPanel } from '../sensors/SoundMeterPanel';
import { Spacing, Typography, BorderRadius  } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useRequireAuth } from '../../stores';
import { SoundPollutionResults } from './SoundPollutionResults';

export interface SoundPollutionTrial {
  id: string;
  locationLabel?: string;
  action: string;
  outcomeDb: string;
  coordinates?: { latitude: number; longitude: number };
  /** Legacy fields from older saves — no longer collected in the UI. */
  prediction?: string;
  wereYouRight?: string;
}

export interface SoundPollutionPrediction {
  id: string;
  action: string;
  predictedDb: string;
}

export interface SoundPollutionData {
  predictedLoudestAction?: string;
  predictions?: SoundPollutionPrediction[];
  trials: SoundPollutionTrial[];
  surprises: string;
  /** @deprecated Removed from UI; may exist on old saves. */
  needEarMuffs?: string;
  checkedEquipment?: Record<string, boolean>;
}

interface Props {
  value: any;
  onChange: (value: any) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

const DEFAULT_TIME = 3600;
const MIN_SOUND_TRIALS = 2;

type LocationActionDraft = {
  id: string;
  action: string;
  outcomeDb: string;
};

const generateLeafletMap = (lat: number, lng: number, markers: any[]) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html { margin: 0; padding: 0; height: 100vh; width: 100vw; overflow: hidden; }
    #map { height: 100vh; width: 100vw; background-color: #eee; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${lat}, ${lng}], 18);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© CARTO'
    }).addTo(map);

    // Current location marker (blue)
    L.circleMarker([${lat}, ${lng}], {
      color: '#3388ff', fillColor: '#3388ff', fillOpacity: 0.5, radius: 8
    }).addTo(map).bindPopup("You are here");

    // Existing markers
    const trials = ${JSON.stringify(markers)};
    const grouped = {};
    trials.forEach(t => {
      if (!t.coordinates) return;
      const key = t.coordinates.latitude + ',' + t.coordinates.longitude;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    });

    Object.keys(grouped).forEach(key => {
      const group = grouped[key];
      const coords = group[0].coordinates;
      const label = group[0].locationLabel || 'Unknown Location';
      
      const maxDb = Math.max(...group.map(t => parseFloat(t.outcomeDb || '0')));
      const color = maxDb > 70 ? 'red' : (maxDb < 50 ? 'green' : 'orange');

      let popupHtml = "<b>" + label + "</b><br/><ul style='margin: 5px 0; padding-left: 20px; font-size: 12px;'>";
      group.forEach(t => {
         popupHtml += "<li>" + t.action + " - <b>" + t.outcomeDb + " dB</b></li>";
      });
      popupHtml += "</ul><div style='text-align: center; color: #666; font-size: 10px; margin-top: 5px;'>Tap pin to add another action</div>";

      L.circleMarker([coords.latitude, coords.longitude], {
        color: color, fillColor: color, fillOpacity: 0.8, radius: 12
      }).addTo(map)
      .bindPopup(popupHtml)
      .on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'mapClickExisting',
          lat: coords.latitude,
          lng: coords.longitude,
          label: label
        }));
      });
    });

    // Handle map clicks for NEW locations
    map.on('click', function(e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'mapClick',
        lat: e.latlng.lat,
        lng: e.latlng.lng
      }));
    });
  </script>
</body>
</html>
`;

function useSoundPollutionFormStyles() {
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
  illustration: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
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
    gap: Spacing.md,
    marginTop: Spacing.xl,
    paddingTop: Spacing.sm,
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
  markerModalContent: {
    backgroundColor: colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: Spacing.lg,
  },
  modalText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  trialListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  }));
}

export function SoundPollutionForm({
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const styles = useSoundPollutionFormStyles();
  const { colors } = useTheme();

  const { t } = useTranslation();
  const { team } = useRequireAuth();
  
  const scrollViewRef = useRef<ScrollView>(null);
  const initialTab = (value as any)?.__activeTab || 'setup';
  const [activeTab, setActiveTabState] = useState<'setup' | 'predictions' | 'experiment' | 'results'>(initialTab);
  
  const timerEndTs = (value as any)?.__timerEndTs;
  const initialTimeLeft = timerEndTs 
    ? Math.max(0, Math.floor((timerEndTs - Date.now()) / 1000))
    : DEFAULT_TIME;
    
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [isTimerRunning, setIsTimerRunning] = useState(initialTab !== 'setup' && initialTimeLeft > 0);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const [mapRegion, setMapRegion] = useState({
    latitude: -33.8688,
    longitude: 151.2093,
    latitudeDelta: 0.0005,
    longitudeDelta: 0.0005,
  });
  const [locationPermission, setLocationPermission] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState<{ latitude: number, longitude: number } | null>(null);
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  
  // Multi-action modal state
  const [modalLocationLabel, setModalLocationLabel] = useState('');
  const [modalActions, setModalActions] = useState<LocationActionDraft[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [measuringActionIndex, setMeasuringActionIndex] = useState<number | null>(null);
  const tempDb = useRef<string>('');

  const [locationLoaded, setLocationLoaded] = useState(false);
  
  const equipmentList = useMemo(
    () => [t('data.activities.sound-pollution.equipmentPhone')],
    [t]
  );
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        try {
          let loc = await Location.getCurrentPositionAsync({});
          setMapRegion({
            ...mapRegion,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } catch (e) {
          console.log("Could not get current location", e);
        } finally {
          setLocationLoaded(true);
        }
      } else {
        setLocationLoaded(true); // render map anyway if denied
      }
    })();
  }, []);

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

  const getInitialData = (): SoundPollutionData => ({
    predictedLoudestAction: '',
    surprises: '',
    trials: [],
    predictions: [
      { id: 'pred_1', action: '', predictedDb: '' },
      { id: 'pred_2', action: '', predictedDb: '' },
    ]
  });

  const defaultData = getInitialData();
  const data: SoundPollutionData = {
    ...defaultData,
    ...(value || {}),
    trials: value?.trials?.length ? value.trials : defaultData.trials,
  };

  const updateData = (updates: Partial<SoundPollutionData>) => onChange({ ...data, ...updates });

  const checkedEquipment = data.checkedEquipment || {};
  const setCheckedEquipment = (updater: any) => {
    if (typeof updater === 'function') {
      updateData({ checkedEquipment: updater(checkedEquipment) });
    } else {
      updateData({ checkedEquipment: updater });
    }
  };
  const allEquipmentChecked = equipmentList.length > 0 && equipmentList.every((item: string) => checkedEquipment[item]);
  
  const setActiveTab = (tab: 'setup' | 'predictions' | 'experiment' | 'results') => {
    setActiveTabState(tab);
    let updates: any = { __activeTab: tab };
    if (tab !== 'setup' && !(data as any).__timerEndTs) {
      updates.__timerEndTs = Date.now() + DEFAULT_TIME * 1000;
    }
    onChange({ ...data, ...updates });
  };

  const isFormValid = () => {
    if (!data.predictedLoudestAction?.trim()) return false;
    if (data.trials.length < MIN_SOUND_TRIALS) return false;
    for (const trial of data.trials) {
      if (!trial.action?.trim() || !trial.outcomeDb?.trim()) return false;
    }
    if (!data.surprises?.trim()) return false;
    return true;
  };

  const predictionsValid = (data.predictions || []).length > 0 && (data.predictions || []).every(p => p.action?.trim() && p.predictedDb?.trim()) && !!data.predictedLoudestAction?.trim();
  const experimentValid = data.trials.length >= MIN_SOUND_TRIALS && data.trials.every(t => t.action?.trim() && t.outcomeDb?.trim());

  const getIncompleteMessage = () => {
    if (data.trials.length < MIN_SOUND_TRIALS) {
      return t('data.activities.sound-pollution.minTrialsMsg');
    }
    return t('activities.incompleteMapMsg');
  };

  const handleComplete = () => {
    if (!isFormValid()) {
      Alert.alert(t('activities.incompleteTitle', { defaultValue: 'Almost there!' }), getIncompleteMessage());
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

  const saveLocationSession = () => {
    if (modalActions.length === 0) {
      Alert.alert(t('activities.emptyActionsTitle'), t('activities.emptyActionsMsg'));
      return;
    }
    if (modalActions.some(a => !a.action || !a.outcomeDb)) {
      Alert.alert(t('activities.missingInfoTitle'), t('activities.missingInfoMsg'));
      return;
    }

    // Remove all old trials at this exact coordinate
    const otherTrials = data.trials.filter(t => 
      !(t.coordinates && 
        selectedCoordinate &&
        t.coordinates.latitude === selectedCoordinate.latitude && 
        t.coordinates.longitude === selectedCoordinate.longitude)
    );

    // Create new trials from the modal session
    const newTrials: SoundPollutionTrial[] = modalActions.map((a) => ({
      id: a.id.startsWith('temp_') ? `${Date.now()}${Math.random()}` : a.id,
      locationLabel: modalLocationLabel || t('activities.unknownLocation'),
      action: a.action || '',
      outcomeDb: a.outcomeDb || '',
      coordinates: selectedCoordinate!,
    }));

    updateData({ trials: [...otherTrials, ...newTrials] });
    setShowMarkerModal(false);
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

      {/* Marker Modal */}
      <RNModal visible={showMarkerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
            <Text style={styles.modalTitle}>{t('activities.recordLocationData')}</Text>
            
            <Input
              label={t('activities.locationLabel')}
              value={modalLocationLabel}
              onChangeText={setModalLocationLabel}
              placeholder={t('activities.locationPlaceholder')}
            />

            <Text style={[styles.sectionTitle, { marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
              {t('activities.actionsAtLocation')}
            </Text>
            
            {modalActions.map((actionDraft, index) => (
              <View key={actionDraft.id} style={{ backgroundColor: colors.background, padding: Spacing.md, borderRadius: 8, marginBottom: Spacing.md, borderWidth: 1, borderColor: colors.borderLight }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>
                    {t('activities.actionNumber', { n: index + 1 })}
                  </Text>
                  <Button 
                    title={t('activities.removeAction')}
                    variant="danger" 
                    size="sm" 
                    onPress={() => setModalActions(modalActions.filter(a => a.id !== actionDraft.id))}
                  />
                </View>

                <Select
                  label={t('activities.actionDescription')}
                  value={actionDraft.action}
                  onValueChange={(v) => {
                    const newActions = [...modalActions];
                    newActions[index] = { ...newActions[index], action: v };
                    setModalActions(newActions);
                  }}
                  options={(data.predictions || []).map(p => p.action).filter(Boolean)}
                  placeholder={t('activities.actionPlaceholder')}
                />

                <Input
                  label={t('activities.actualDb')}
                  value={actionDraft.outcomeDb}
                  onChangeText={(v) => {
                    const newActions = [...modalActions];
                    newActions[index].outcomeDb = v;
                    setModalActions(newActions);
                  }}
                  keyboardType="numeric"
                  placeholder={t('activities.actualDbPlaceholder')}
                />
                <Button
                  title={t('activities.measure')}
                  size="sm"
                  icon={<Ionicons name="mic" size={16} color={colors.primary} />}
                  variant="outlined"
                  style={{ marginTop: Spacing.xs }}
                  onPress={() => setMeasuringActionIndex(index)}
                />
              </View>
            ))}

            <Button 
              title={t('activities.addAnotherAction')}
              variant="outlined" 
              onPress={() => {
                setModalActions([...modalActions, { id: `temp_${Date.now()}`, action: '', outcomeDb: '' }]);
              }}
              style={{ marginBottom: Spacing.lg }}
            />
            
            <View style={{flexDirection: 'column', gap: Spacing.md, marginTop: Spacing.md}}>
              <Button title={t('activities.saveAllToLocation')} onPress={saveLocationSession} />
              <Button title={t('common.cancel')} variant="ghost" onPress={() => setShowMarkerModal(false)} />
            </View>
          </ScrollView>
        </View>
        </View>
      </RNModal>

      <RNModal visible={measuringActionIndex !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.markerModalContent}>
            <Text style={styles.sectionTitle}>{t('activities.measureSound')}</Text>
            <SoundMeterPanel
              notes=""
              onNotesChange={() => {}}
              onResultReady={(res) => {
                tempDb.current = res.replace(' dB', '');
              }}
              onSave={() => {
                if (measuringActionIndex !== null && tempDb.current) {
                  const newActions = [...modalActions];
                  newActions[measuringActionIndex].outcomeDb = tempDb.current;
                  setModalActions(newActions);
                }
                setMeasuringActionIndex(null);
                tempDb.current = '';
              }}
            />
            <Button title={t('common.cancel')} variant="ghost" onPress={() => setMeasuringActionIndex(null)} />
          </View>
        </View>
      </RNModal>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {['setup', 'predictions', 'experiment', 'results'].map((tab) => (
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
                activityId="sound-pollution"
                durationMinutes={60}
                textStyle={styles.instructionText}
                titleStyle={styles.sectionTitle}
              />

              <ActivityIllustration activityId="sound-pollution" style={styles.illustration} />
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
              <Text style={styles.instructionText}>{t('data.activities.sound-pollution.predictMultipleHint', { defaultValue: 'Add some actions and predict how loud they will be in decibels (dB).' })}</Text>
              
              <View style={{ height: Spacing.md }} />
              
              {(data.predictions || []).map((pred, index) => (
                <View key={pred.id} style={{ backgroundColor: colors.background, padding: Spacing.md, borderRadius: 8, marginBottom: Spacing.md, borderWidth: 1, borderColor: colors.borderLight }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>
                      {t('activities.predictionNumber', { defaultValue: 'Prediction {{n}}', n: index + 1 })}
                    </Text>
                    {!isLocked && (data.predictions || []).length > 2 && (
                      <Button 
                        title={t('common.delete')}
                        variant="danger" 
                        size="sm" 
                        onPress={() => {
                          const newPreds = (data.predictions || []).filter(p => p.id !== pred.id);
                          updateData({ predictions: newPreds });
                        }}
                      />
                    )}
                  </View>
                  
                  <Input
                    label={t('activities.actionDescription')}
                    value={pred.action}
                    onChangeText={(v) => {
                      const newPreds = [...(data.predictions || [])];
                      newPreds[index] = { ...newPreds[index], action: v };
                      updateData({ predictions: newPreds });
                    }}
                    placeholder={t('activities.actionPlaceholder')}
                    editable={!isLocked}
                    onLightSurface
                  />

                  <Input
                    label={t('activities.predictedDb', { defaultValue: 'Predicted dB' })}
                    value={pred.predictedDb}
                    onChangeText={(v) => {
                      const newPreds = [...(data.predictions || [])];
                      newPreds[index] = { ...newPreds[index], predictedDb: v };
                      updateData({ predictions: newPreds });
                    }}
                    keyboardType="numeric"
                    placeholder={t('activities.predictedDbPlaceholder', { defaultValue: 'e.g. 80' })}
                    editable={!isLocked}
                    onLightSurface
                  />
                </View>
              ))}

              {!isLocked && (
                <Button 
                  title={t('activities.addPrediction', { defaultValue: 'Add Prediction' })}
                  variant="outlined" 
                  onPress={() => {
                    const newPreds = [...(data.predictions || []), { id: `pred_${Date.now()}`, action: '', predictedDb: '' }];
                    updateData({ predictions: newPreds });
                  }}
                  style={{ marginTop: Spacing.sm }}
                />
              )}
              
              <View style={{ height: Spacing.xl }} />

              <Select
                label={t('data.activities.sound-pollution.predictLoudestLabel')}
                value={data.predictedLoudestAction || ''}
                onValueChange={(v) => updateData({ predictedLoudestAction: v })}
                options={(data.predictions || []).map(p => p.action).filter(Boolean)}
                placeholder={t('data.activities.sound-pollution.predictLoudestPlaceholder')}
                disabled={isLocked || (data.predictions || []).filter(p => p.action?.trim()).length === 0}
                onLightSurface
              />
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous')} variant="outlined" onPress={() => setActiveTab('setup')} />
              <Button 
                title={t('common.next')} 
                onPress={() => {
                  if (!predictionsValid) {
                    Alert.alert(t('activities.incompleteTitle', { defaultValue: 'Almost there!' }), t('activities.incompleteMsg', { defaultValue: 'It looks like some required fields haven\'t been filled out yet. Please double-check the tabs to make sure everything is complete before submitting.' }));
                    return;
                  }
                  setActiveTab('experiment');
                }} 
              />
            </View>
          </View>
        )}

        {activeTab === 'experiment' && (
          <View>
            {renderTimerBar()}
            <Card style={[styles.pageCard, { padding: 0, overflow: 'hidden' }]}>
              <View style={{ padding: Spacing.md }}>
                <Text style={styles.sectionTitle}>{t('activities.trialsMapTitle')}</Text>
                <Text style={styles.instructionText}>{actT('shared.mapTapHint')}</Text>
                <Text style={[styles.instructionText, { marginTop: Spacing.sm, fontWeight: '600' }]}>
                  {t('data.activities.sound-pollution.minTrialsHint', {
                    count: MIN_SOUND_TRIALS,
                    current: data.trials.length,
                  })}
                </Text>
              </View>
              <View style={{ width: '100%', height: 350, backgroundColor: colors.borderLight }}>
                {locationLoaded ? (
                  <WebView
                    source={{ 
                      html: generateLeafletMap(mapRegion.latitude, mapRegion.longitude, data.trials),
                      baseUrl: 'https://openstreetmap.org'
                    }}
                    style={{ flex: 1, backgroundColor: 'transparent' }}
                    userAgent="StemmLabApp/1.0"
                    scrollEnabled={false}
                    originWhitelist={['*']}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    onMessage={(event) => {
                      try {
                        const msg = JSON.parse(event.nativeEvent.data);
                        if (msg.type === 'mapClick' && !isLocked) {
                          setSelectedCoordinate({ latitude: msg.lat, longitude: msg.lng });
                          setModalLocationLabel('');
                          setModalActions([{ id: `temp_${Date.now()}`, action: '', outcomeDb: '' }]);
                          setShowMarkerModal(true);
                        } else if (msg.type === 'mapClickExisting' && !isLocked) {
                          // Allow editing/adding actions to an existing grouped pin
                          setSelectedCoordinate({ latitude: msg.lat, longitude: msg.lng });
                          setModalLocationLabel(msg.label);
                          const existingTrials = data.trials.filter(t => t.coordinates && t.coordinates.latitude === msg.lat && t.coordinates.longitude === msg.lng);
                          setModalActions(existingTrials.map(t => ({...t})));
                          setShowMarkerModal(true);
                        }
                      } catch (e) {}
                    }}
                  />
                ) : (
                  <Text style={{color: colors.textSecondary}}>{t('activities.loadingMap')}</Text>
                )}
              </View>
              <View style={{ padding: Spacing.lg, backgroundColor: colors.surface }}>
                <Button 
                  title={
                    isLocating
                      ? t('data.activities.sound-pollution.locating')
                      : t('data.activities.sound-pollution.recordAtLocation')
                  }
                  icon={!isLocating && <Ionicons name="location" size={20} color={colors.white} />}
                  loading={isLocating}
                  disabled={!locationLoaded || isLocked}
                  onPress={async () => {
                    if (isLocked) return;
                    setIsLocating(true);
                    try {
                      let { status } = await Location.requestForegroundPermissionsAsync();
                      if (status !== 'granted') {
                        Alert.alert(t('activities.permissionDeniedTitle'), t('activities.permissionDeniedMsg'));
                        setIsLocating(false);
                        return;
                      }
                      let loc = await Location.getCurrentPositionAsync({});
                      setSelectedCoordinate({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                      setModalLocationLabel('');
                      setModalActions([{ id: `temp_${Date.now()}`, action: '', outcomeDb: '' }]);
                      setShowMarkerModal(true);
                    } catch (e) {
                      Alert.alert(t('activities.locationErrorTitle'), t('activities.locationErrorMsg'));
                    } finally {
                      setIsLocating(false);
                    }
                  }}
                />
              </View>

              {/* Recorded Locations List */}
              {data.trials.length > 0 && (
                <View style={{ padding: Spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
                  <Text style={[styles.sectionTitle, { fontSize: 18, marginBottom: Spacing.sm }]}>
                    {t('activities.recordedLocations')}
                  </Text>
                  {Object.values(data.trials.reduce((acc, trial) => {
                    if (!trial.coordinates) return acc;
                    const key = `${trial.coordinates.latitude},${trial.coordinates.longitude}`;
                    if (!acc[key]) acc[key] = { label: trial.locationLabel || t('activities.unknownLocation'), coords: trial.coordinates, actions: [] };
                    acc[key].actions.push(trial);
                    return acc;
                  }, {} as Record<string, {label: string, coords: any, actions: SoundPollutionTrial[]}>)).map((group, idx) => (
                    <View key={idx} style={styles.trialListItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '700', color: colors.text, fontSize: 16 }}>{group.label}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 4 }}>
                          {t('activities.actionsRecordedHere', { count: group.actions.length })}
                        </Text>
                        {group.actions.map((a, i) => (
                          <Text key={a.id} style={{ color: colors.text, fontSize: 13 }}>• {a.action} ({a.outcomeDb} dB)</Text>
                        ))}
                      </View>
                      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                        <Button 
                          title={t('activities.edit')} 
                          variant="outlined" 
                          size="sm" 
                          onPress={() => {
                            if (isLocked) return;
                            setSelectedCoordinate(group.coords);
                            setModalLocationLabel(group.label);
                            setModalActions(group.actions.map(a => ({...a})));
                            setShowMarkerModal(true);
                          }}
                        />
                        <Button 
                          title={t('activities.del')} 
                          variant="danger" 
                          size="sm" 
                          onPress={() => {
                            if (isLocked) return;
                            Alert.alert(t('activities.deleteLocationTitle'), t('activities.deleteLocationMsg'), [
                              { text: t('common.cancel'), style: 'cancel' },
                              { text: t('common.delete'), style: 'destructive', onPress: () => {
                                updateData({ trials: data.trials.filter(t => !(t.coordinates && t.coordinates.latitude === group.coords.latitude && t.coordinates.longitude === group.coords.longitude)) });
                              }}
                            ])
                          }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Card>

            <View style={styles.wizardNavBoth}>
              <Button title={t('common.previous')} variant="outlined" onPress={() => setActiveTab('predictions')} />
              <Button 
                title={t('common.next')} 
                onPress={() => {
                  if (!experimentValid) {
                    Alert.alert(t('activities.incompleteTitle', { defaultValue: 'Almost there!' }), getIncompleteMessage());
                    return;
                  }
                  setActiveTab('results');
                }} 
              />
            </View>
          </View>
        )}

        {activeTab === 'results' && (
          <View>
            {renderTimerBar()}
            <SoundPollutionResults results={[{ data }]} hideReflection={true} />
            
            <Card style={[styles.pageCard, { marginTop: Spacing.md }]}>
              <Text style={styles.sectionTitle}>{actT('shared.reflectionTitle')}</Text>
              <Input
                label={t('data.activities.sound-pollution.surprisesLabel')}
                value={data.surprises}
                onChangeText={(v) => updateData({ surprises: v })}
                multiline
                numberOfLines={3}
                editable={!isLocked}
                onLightSurface
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
