import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TrialVideoPlayer } from './TrialVideoPlayer';
import { VibrationSensorPanel } from './VibrationSensorPanel';
import { ReactionTestPanel } from './ReactionTestPanel';
import { SoundMeterPanel } from './SoundMeterPanel';
import { BatterySensorPanel } from './BatterySensorPanel';
import { LocationSensorPanel } from './LocationSensorPanel';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme';
import { SENSORS } from '../../types';
import { isCloudinaryConfigured } from '../../services/cloudinary';
import { getSensorChipLabel } from '../../utils/sensorChip';
import { Chip } from '../ui/Chip';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SensorModalProps {
  sensorId: string | null;
  isRecording: boolean;
  sensorValue: string;
  onClose: () => void;
  onStartMeasurement: () => void;
  onValueChange: (value: string) => void;
  onResultReady: (value: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function SensorModal({
  sensorId,
  isRecording,
  sensorValue,
  onClose,
  onStartMeasurement,
  onValueChange,
  onResultReady,
  notes,
  onNotesChange,
  onSave,
  isSaving = false,
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
        desc: { ...typography.body, color: colors.textSecondary, marginBottom: Spacing.sm },
        chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.xl },
        measurement: {
          backgroundColor: colors.primary,
          borderRadius: BorderRadius.lg,
          padding: Spacing.xxl,
          alignItems: 'center',
          marginBottom: Spacing.lg,
        },
        measurementValue: { fontSize: 28, fontWeight: '700', color: colors.white },
        localHint: {
          ...typography.caption,
          color: colors.textMuted,
          marginTop: -Spacing.md,
          marginBottom: Spacing.lg,
        },
      }),
    [colors, typography]
  );

  return (
    <Modal visible={!!sensorId} transparent animationType="slide" onRequestClose={isSaving ? undefined : onClose}>
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
                <Pressable onPress={onClose} hitSlop={12} android_ripple={{ color: 'transparent' }} disabled={isSaving}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </Pressable>
              </View>

              <Text style={styles.desc}>
                {t(`data.sensors.${sensor.id}.desc`, { defaultValue: sensor.description })}
              </Text>
              <View style={styles.chipRow}>
                <Chip label={getSensorChipLabel(sensor.id, t)} size="sm" />
              </View>

              {sensor.id === 'slow-mo' && !isCloudinaryConfigured() && (
                <Text style={styles.localHint}>
                  {t('sensors.savedLocallyHint', {
                    defaultValue: 'Videos save on this device. Cloud upload will work once Cloudinary is configured.',
                  })}
                </Text>
              )}

              {sensor.id === 'battery' ? (
                <BatterySensorPanel
                  notes={notes}
                  onNotesChange={onNotesChange}
                  onResultReady={onResultReady}
                  onSave={onSave}
                />
              ) : sensor.id === 'sound-meter' ? (
                <SoundMeterPanel
                  notes={notes}
                  onNotesChange={onNotesChange}
                  onResultReady={onResultReady}
                  onSave={onSave}
                />
              ) : sensor.id === 'vibration' ? (
                <VibrationSensorPanel
                  notes={notes}
                  onNotesChange={onNotesChange}
                  onResultReady={onResultReady}
                  onSave={onSave}
                />
              ) : sensor.id === 'reaction-timer' ? (
                <ReactionTestPanel
                  notes={notes}
                  onNotesChange={onNotesChange}
                  onResultReady={onResultReady}
                  onSave={onSave}
                />
              ) : sensor.id === 'location' ? (
                <LocationSensorPanel
                  notes={notes}
                  onNotesChange={onNotesChange}
                  onResultReady={onResultReady}
                  onSave={onSave}
                />
              ) : !isRecording ? (
                <Button
                  title={t('sensors.startMeasurement')}
                  onPress={onStartMeasurement}
                  size="lg"
                  fullWidth
                  icon={<Ionicons name="play" size={18} color={colors.white} />}
                />
              ) : (
                <View>
                  {sensorValue === 'LOADING...' ? (
                    <View style={[styles.measurement, { backgroundColor: '#E2E8F0' }]}>
                      <Text style={[styles.measurementValue, { color: colors.textSecondary, fontSize: 18 }]}>
                        {t('sensors.initializingSensor')}
                      </Text>
                    </View>
                  ) : sensor.id === 'slow-mo' ? (
                    <View style={{ marginBottom: Spacing.lg }}>
                      <TrialVideoPlayer videoUri={sensorValue} />
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
                    loading={isSaving}
                    disabled={isSaving}
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
