import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import { recordGyroscopeMotion, isGyroscopeAvailable } from '../../utils/motionSensors';

interface GyroscopeSensorPanelProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onResultReady: (summary: string) => void;
  onSave: () => void;
}

const DURATION_SEC = 5;

export function GyroscopeSensorPanel({ notes, onNotesChange, onResultReady, onSave }: GyroscopeSensorPanelProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [step, setStep] = useState<'idle' | 'recording' | 'done'>('idle');
  const [recordRemaining, setRecordRemaining] = useState(0);
  const [liveReading, setLiveReading] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);

  const styles = useThemedStyles(({ colors: c, typography }) => ({
    container: {
      padding: Spacing.md,
      backgroundColor: c.background,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.lg,
    },
    title: { ...typography.h3, marginBottom: Spacing.sm },
    hint: { ...typography.bodySmall, color: c.textSecondary, marginBottom: Spacing.lg, lineHeight: 20 },
    recordingBox: {
      alignItems: 'center',
      padding: Spacing.xl,
      backgroundColor: c.secondary + '10',
      borderRadius: BorderRadius.md,
      borderWidth: 2,
      borderColor: c.secondary + '40',
    },
    recordingTitle: { ...typography.h3, color: c.secondary, marginTop: Spacing.sm },
    liveValue: { ...typography.h1, color: c.text, marginTop: Spacing.md },
    resultBox: {
      backgroundColor: c.secondary + '10',
      padding: Spacing.lg,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: c.secondary + '40',
    },
    doneRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
    doneText: { ...typography.h3, color: c.secondary },
    resultLine: { ...typography.body, fontWeight: '700', marginBottom: Spacing.xs },
  }));

  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => {
    stopRef.current?.();
  }, []);

  const runRecording = async () => {
    const available = await isGyroscopeAvailable();
    if (!available) {
      Alert.alert(t('sensors.gyroscopeUnavailableTitle'), t('sensors.gyroscopeUnavailableMsg'));
      return;
    }

    setStep('recording');
    setLiveReading(0);
    setResult(null);

    try {
      const session = await recordGyroscopeMotion(
        DURATION_SEC,
        (remaining) => setRecordRemaining(remaining),
        (radPerSec) => setLiveReading(radPerSec * (180 / Math.PI)) // Show deg/s roughly
      );
      stopRef.current = () => session.stop();

      const totalDegrees = await session.complete;
      stopRef.current = null;

      setResult(totalDegrees);
      const summary = `Max Tilt/Rotation: ${totalDegrees.toFixed(1)} degrees`;
      onResultReady(summary);
      setStep('done');
    } catch {
      setStep('idle');
      Alert.alert(t('sensors.gyroscopeErrorTitle'), t('sensors.gyroscopeErrorMsg'));
    }
  };

  if (step === 'done' && result !== null) {
    return (
      <View>
        <View style={styles.resultBox}>
          <View style={styles.doneRow}>
            <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
            <Text style={styles.doneText}>{t('sensors.gyroscopeMeasurementComplete')}</Text>
          </View>
          <Text style={styles.resultLine}>{t('sensors.gyroscopeTotalRotation', { val: result.toFixed(1) })}</Text>
        </View>
        <Button title={t('common.saveLog')} onPress={onSave} size="lg" fullWidth icon={<Ionicons name="save" size={18} color={colors.white} />} />
        <Button title={t('common.recordAgain')} onPress={() => setStep('idle')} variant="outlined" size="sm" style={{ marginTop: Spacing.sm }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {step === 'idle' && (
        <>
          <Text style={styles.title}>{t('sensors.gyroscopeMeasurement')}</Text>
          <Text style={styles.hint}>
            {t('sensors.gyroscopeHint', { val: DURATION_SEC })}
          </Text>
          <Button
            title={t('common.startMeasurement')}
            onPress={runRecording}
            size="lg"
            fullWidth
            icon={<Ionicons name="play" size={18} color={colors.white} />}
          />
        </>
      )}

      {step === 'recording' && (
        <View style={styles.recordingBox}>
          <Ionicons name="compass" size={32} color={colors.secondary} />
          <Text style={styles.recordingTitle}>{t('sensors.gyroscopeRecording', { val: recordRemaining })}</Text>
          <Text style={styles.liveValue}>{liveReading.toFixed(0)}°/s</Text>
        </View>
      )}
    </View>
  );
}
