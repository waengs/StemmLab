import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { SENSORS } from '../../types';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SensorModalProps {
  sensorId: string | null;
  isRecording: boolean;
  sensorValue: string;
  onClose: () => void;
  onStartMeasurement: () => void;
  onValueChange: (value: string) => void;
  onSave: () => void;
}

export function SensorModal({
  sensorId,
  isRecording,
  sensorValue,
  onClose,
  onStartMeasurement,
  onValueChange,
  onSave,
}: SensorModalProps) {
  const { t } = useTranslation();
  const sensor = sensorId ? SENSORS[sensorId as keyof typeof SENSORS] : null;

  return (
    <Modal visible={!!sensorId} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {sensor && (
            <>
              <View style={styles.header}>
                <View style={styles.iconRow}>
                  <Ionicons name={sensor.icon as IoniconsName} size={24} color={Colors.primary} />
                  <Text style={styles.title}>
                    {t(`data.sensors.${sensor.id}.name`, { defaultValue: sensor.name })}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={12}>
                  <Ionicons name="close" size={24} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.desc}>
                {t(`data.sensors.${sensor.id}.desc`, { defaultValue: sensor.description })}
              </Text>

              {!isRecording ? (
                <Button
                  title={t('sensors.startMeasurement')}
                  onPress={onStartMeasurement}
                  size="lg"
                  fullWidth
                  icon={<Ionicons name="play" size={18} color={Colors.white} />}
                />
              ) : (
                <View>
                  <View style={styles.measurement}>
                    <Text style={styles.measurementValue}>{sensorValue}</Text>
                  </View>
                  <Input
                    label={t('common.notes')}
                    value={sensorValue}
                    onChangeText={onValueChange}
                    multiline
                    numberOfLines={2}
                    placeholder={t('sensors.notesPlaceholder')}
                  />
                  <Button
                    title={t('sensors.saveLog')}
                    onPress={onSave}
                    size="lg"
                    fullWidth
                    icon={<Ionicons name="save" size={18} color={Colors.white} />}
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.white,
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
  title: { ...Typography.h2 },
  desc: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  measurement: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  measurementValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
  },
});
