import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { WebView } from 'react-native-webview';
import { TrialVideoPlayer } from './TrialVideoPlayer';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme';
import { SENSORS } from '../../types';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SensorModalProps {
  sensorId: string | null;
  isRecording: boolean;
  sensorValue: string;
  onClose: () => void;
  onStartMeasurement: () => void;
  onValueChange: (value: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
}

export function SensorModal({
  sensorId,
  isRecording,
  sensorValue,
  onClose,
  onStartMeasurement,
  onValueChange,
  notes,
  onNotesChange,
  onSave,
}: SensorModalProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const sensor = sensorId ? SENSORS[sensorId as keyof typeof SENSORS] : null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'flex-end',
        },
        content: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: BorderRadius.xl,
          borderTopRightRadius: BorderRadius.xl,
          padding: Spacing.xxl,
          paddingBottom: 40,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Spacing.lg,
        },
        iconRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          flex: 1,
        },
        title: { ...typography.h2 },
        desc: { ...typography.body, color: colors.textSecondary, marginBottom: Spacing.xl },
        measurement: {
          backgroundColor: colors.primary,
          borderRadius: BorderRadius.lg,
          padding: Spacing.xxl,
          alignItems: 'center',
          marginBottom: Spacing.lg,
        },
        measurementValue: { fontSize: 28, fontWeight: '700', color: colors.white },
      }),
    [colors, typography]
  );

  return (
    <Modal visible={!!sensorId} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {sensor && (
            <>
              <View style={styles.header}>
                <View style={styles.iconRow}>
                  <Ionicons name={sensor.icon as IoniconsName} size={24} color={colors.primary} />
                  <Text style={styles.title}>
                    {t(`data.sensors.${sensor.id}.name`, { defaultValue: sensor.name })}
                  </Text>
                </View>
                <Pressable onPress={onClose} hitSlop={12} android_ripple={{ color: 'transparent' }}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </Pressable>
              </View>

              <Text style={styles.desc}>
                {t(`data.sensors.${sensor.id}.desc`, { defaultValue: sensor.description })}
              </Text>

              {!isRecording ? (
                <View />
              ) : (
                <View>
                  {sensorValue === 'LOADING...' && sensor.id === 'location' ? (
                    <View style={{ width: '100%', height: 250, borderRadius: BorderRadius.lg, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg }}>
                      <Ionicons name="navigate-outline" size={32} color={colors.textMuted} style={{marginBottom: Spacing.sm}} />
                      <Text style={{color: colors.textSecondary, fontWeight: '600'}}>Acquiring GPS Signal...</Text>
                      <Text style={{color: colors.textMuted, fontSize: 12, marginTop: 4}}>This may take a moment</Text>
                    </View>
                  ) : sensorValue === 'LOADING...' ? (
                    <View style={[styles.measurement, { backgroundColor: '#E2E8F0' }]}>
                      <Text style={[styles.measurementValue, { color: colors.textSecondary, fontSize: 18 }]}>Initializing sensor...</Text>
                    </View>
                  ) : sensor.id === 'slow-mo' ? (
                    <View style={{ marginBottom: Spacing.lg }}>
                      <TrialVideoPlayer videoUri={sensorValue} />
                    </View>
                  ) : sensor.id === 'location' && sensorValue.includes(',') ? (
                    <View style={{ width: '100%', height: 250, borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.lg, backgroundColor: '#E2E8F0' }}>
                      <WebView 
                        source={{ 
                          html: `
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
                                var map = L.map('map').setView([${sensorValue}], 18);
                                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                                  maxZoom: 19,
                                  attribution: '© CARTO'
                                }).addTo(map);

                                L.circleMarker([${sensorValue}], {
                                  color: '#3388ff', fillColor: '#3388ff', fillOpacity: 0.5, radius: 8
                                }).addTo(map).bindPopup("Your Location");
                              </script>
                            </body>
                            </html>
                          `,
                          baseUrl: 'https://openstreetmap.org'
                        }}
                        style={{ flex: 1, backgroundColor: 'transparent' }}
                        userAgent="StemmLabApp/1.0"
                        originWhitelist={['*']}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                      />
                    </View>
                  ) : (
                    <View style={styles.measurement}>
                      <Text style={styles.measurementValue}>{sensorValue}</Text>
                    </View>
                  )}
                  <Input
                    label={t('common.notes')}
                    value={sensor.id === 'slow-mo' ? notes : sensorValue}
                    onChangeText={sensor.id === 'slow-mo' ? onNotesChange : onValueChange}
                    multiline
                    numberOfLines={2}
                    placeholder={t('sensors.notesPlaceholder')}
                  />
                  <Button
                    title={t('sensors.saveLog')}
                    onPress={onSave}
                    size="lg"
                    fullWidth
                    icon={<Ionicons name="save" size={18} color={colors.white} />}
                  />
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
