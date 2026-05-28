import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal as RNModal, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { useRequireAuth } from '../../stores';

export interface SoundPollutionTrial {
  id: string;
  locationLabel?: string;
  action: string;
  prediction: string;
  outcomeDb: string;
  wereYouRight: string;
  coordinates?: { latitude: number, longitude: number };
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

export function SoundPollutionForm({ value, onChange, onSubmit }: Props) {
  const { t } = useTranslation();
  const { team } = useRequireAuth();
  
  const [activeTab, setActiveTab] = useState<'setup' | 'predictions' | 'experiment'>('setup');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
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
  const [modalActions, setModalActions] = useState<any[]>([]);

  const [locationLoaded, setLocationLoaded] = useState(false);
  
  const equipmentList = ['Mobile phone with STEMM Lab app (or external sound meter)'];
  const [checkedEquipment, setCheckedEquipment] = useState<Record<string, boolean>>({});
  const allEquipmentChecked = equipmentList.every(item => checkedEquipment[item]);

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getInitialData = (): SoundPollutionData => ({
    predictedLoudestAction: '',
    surprises: '',
    needEarMuffs: '',
    trials: []
  });

  const defaultData = getInitialData();
  const data: SoundPollutionData = {
    ...defaultData,
    ...(value || {}),
    trials: value?.trials?.length ? value.trials : defaultData.trials,
  };

  const updateData = (updates: Partial<SoundPollutionData>) => onChange({ ...data, ...updates });

  const isFormValid = () => {
    if (!data.predictedLoudestAction) return false;
    if (data.trials.length === 0) return false;
    for (const t of data.trials) {
      if (!t.action || !t.prediction || !t.outcomeDb || !t.wereYouRight) return false;
    }
    if (!data.surprises || !data.needEarMuffs) return false;
    return true;
  };

  const handleComplete = () => {
    if (!isFormValid()) {
      Alert.alert(
        t('activities.incompleteTitle', { defaultValue: 'Incomplete Data' }), 
        t('activities.incompleteMsg', { defaultValue: 'Please fill out all fields and record at least 1 trial on the map.' })
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

  const saveLocationSession = () => {
    if (modalActions.length === 0) {
      Alert.alert("Empty", "Please add at least one action.");
      return;
    }
    if (modalActions.some(a => !a.action || !a.outcomeDb)) {
      Alert.alert("Missing Info", "All actions must have a description and dB outcome.");
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
    const newTrials: SoundPollutionTrial[] = modalActions.map(a => ({
      id: a.id.startsWith('temp_') ? Date.now().toString() + Math.random() : a.id,
      locationLabel: modalLocationLabel || 'Unknown Location',
      action: a.action || '',
      prediction: a.prediction || '',
      outcomeDb: a.outcomeDb || '',
      wereYouRight: a.wereYouRight || '',
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
            <Text style={styles.modalTitle}>Record Location Data</Text>
            
            <Input
              label="Location Label"
              value={modalLocationLabel}
              onChangeText={setModalLocationLabel}
              placeholder="e.g. Library, Cafeteria"
            />

            <Text style={[styles.sectionTitle, { marginTop: Spacing.md, marginBottom: Spacing.sm }]}>Actions at this Location</Text>
            
            {modalActions.map((actionDraft, index) => (
              <View key={actionDraft.id} style={{ backgroundColor: Colors.background, padding: Spacing.md, borderRadius: 8, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
                  <Text style={{ fontWeight: '700', color: Colors.text }}>Action {index + 1}</Text>
                  <Button 
                    title="Remove (-)" 
                    variant="danger" 
                    size="sm" 
                    onPress={() => setModalActions(modalActions.filter(a => a.id !== actionDraft.id))}
                  />
                </View>

                <Input
                  label="Action Description"
                  value={actionDraft.action}
                  onChangeText={(v) => {
                    const newActions = [...modalActions];
                    newActions[index].action = v;
                    setModalActions(newActions);
                  }}
                  placeholder="e.g. Dropping a book"
                />

                <Input
                  label="Prediction (louder or softer than...)"
                  value={actionDraft.prediction}
                  onChangeText={(v) => {
                    const newActions = [...modalActions];
                    newActions[index].prediction = v;
                    setModalActions(newActions);
                  }}
                  placeholder="e.g. Softer than a vacuum"
                />

                <View style={{flexDirection: 'row', gap: Spacing.md}}>
                  <View style={{flex: 1}}>
                    <Input
                      label="Actual (dB)"
                      value={actionDraft.outcomeDb}
                      onChangeText={(v) => {
                        const newActions = [...modalActions];
                        newActions[index].outcomeDb = v;
                        setModalActions(newActions);
                      }}
                      keyboardType="numeric"
                      placeholder="e.g. 50"
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Select
                      label="Were you right?"
                      value={actionDraft.wereYouRight}
                      options={[
                        { label: 'Yes', value: 'Yes' },
                        { label: 'No', value: 'No' }
                      ]}
                      onSelect={(v) => {
                        const newActions = [...modalActions];
                        newActions[index].wereYouRight = v;
                        setModalActions(newActions);
                      }}
                    />
                  </View>
                </View>
              </View>
            ))}

            <Button 
              title="+ Add Another Action Here" 
              variant="outlined" 
              onPress={() => {
                setModalActions([...modalActions, { id: 'temp_' + Date.now(), action: '', prediction: '', outcomeDb: '', wereYouRight: '' }]);
              }}
              style={{ marginBottom: Spacing.lg }}
            />
            
            <View style={{flexDirection: 'column', gap: Spacing.md, marginTop: Spacing.md}}>
              <Button title="Save All to Location" onPress={saveLocationSession} />
              <Button title="Cancel" variant="ghost" onPress={() => setShowMarkerModal(false)} />
            </View>
          </ScrollView>
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
              
              <Image source={require('../../../assets/images/activity2illustration.jpeg')} style={styles.illustration} resizeMode="contain" />
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
            <Card style={[styles.pageCard, { padding: 0, overflow: 'hidden' }]}>
              <View style={{ padding: Spacing.md }}>
                <Text style={styles.sectionTitle}>Record Trials on Map</Text>
                <Text style={styles.instructionText}>Tap anywhere on the map to log a sound reading.</Text>
              </View>
              <View style={{ width: '100%', height: 350, backgroundColor: Colors.borderLight }}>
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
                          setModalActions([{ id: 'temp_' + Date.now(), action: '', prediction: '', outcomeDb: '', wereYouRight: '' }]);
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
                  <Text style={{color: Colors.textSecondary}}>Loading Map...</Text>
                )}
              </View>
              <View style={{ padding: Spacing.lg, backgroundColor: Colors.surface }}>
                <Button 
                  title="Record at Current Location"
                  icon={<Ionicons name="location" size={20} color={Colors.white} />}
                  onPress={async () => {
                    if (isLocked) return;
                    try {
                      let loc = await Location.getCurrentPositionAsync({});
                      setSelectedCoordinate({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                      setModalLocationLabel('');
                      setModalActions([{ id: 'temp_' + Date.now(), action: '', prediction: '', outcomeDb: '', wereYouRight: '' }]);
                      setShowMarkerModal(true);
                    } catch (e) {
                      Alert.alert("Location Error", "Could not fetch your exact location. Make sure GPS is enabled.");
                    }
                  }}
                />
              </View>

              {/* Recorded Locations List */}
              {data.trials.length > 0 && (
                <View style={{ padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight }}>
                  <Text style={[styles.sectionTitle, { fontSize: 18, marginBottom: Spacing.sm }]}>Recorded Locations</Text>
                  {Object.values(data.trials.reduce((acc, trial) => {
                    if (!trial.coordinates) return acc;
                    const key = `${trial.coordinates.latitude},${trial.coordinates.longitude}`;
                    if (!acc[key]) acc[key] = { label: trial.locationLabel || 'Unknown', coords: trial.coordinates, actions: [] };
                    acc[key].actions.push(trial);
                    return acc;
                  }, {} as Record<string, {label: string, coords: any, actions: SoundPollutionTrial[]}>)).map((group, idx) => (
                    <View key={idx} style={styles.trialListItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '700', color: Colors.text, fontSize: 16 }}>{group.label}</Text>
                        <Text style={{ color: Colors.textSecondary, fontSize: 13, marginBottom: 4 }}>{group.actions.length} actions recorded here</Text>
                        {group.actions.map((a, i) => (
                          <Text key={a.id} style={{ color: Colors.text, fontSize: 13 }}>• {a.action} ({a.outcomeDb} dB)</Text>
                        ))}
                      </View>
                      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                        <Button 
                          title="Edit" 
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
                          title="Del" 
                          variant="danger" 
                          size="sm" 
                          onPress={() => {
                            if (isLocked) return;
                            Alert.alert("Delete Location", "Remove this location and all its actions?", [
                              { text: "Cancel", style: "cancel" },
                              { text: "Delete", style: "destructive", onPress: () => {
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
  illustration: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
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
  markerModalContent: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  modalText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  trialListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  }
});
