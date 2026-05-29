import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { recordMotion, isMotionSensorAvailable, type MotionRecordingResult } from '../../utils/motionSensors';
import {
  playCountdownBeep,
  playStartBeep,
  playFinishDone,
  playShakyAlert,
  sleep,
  PRE_COUNTDOWN_SEC,
  RECORD_SEC,
} from '../../utils/recordingSounds';

interface VibrationSensorPanelProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onResultReady: (summary: string) => void;
  onSave: () => void;
}

function LiveMeter({ value, isShaky, feedbackOn }: { value: string | null; isShaky: boolean; feedbackOn: boolean }) {
  if (value === null) return null;
  const fill = Math.min(100, (parseFloat(value) / 15) * 100);
  const barColor = isShaky ? Colors.danger : Colors.secondary;

  return (
    <View style={meterStyles.wrap}>
      <Text style={meterStyles.label}>Live: {value} cm</Text>
      <View style={meterStyles.track}>
        <View style={[meterStyles.fill, { width: `${fill}%`, backgroundColor: barColor }]} />
      </View>
      {feedbackOn && isShaky && (
        <View style={meterStyles.alertBox}>
          <Ionicons name="warning" size={18} color={Colors.danger} />
          <Text style={meterStyles.alertText}>TOO SHAKY — SLOW DOWN</Text>
        </View>
      )}
    </View>
  );
}

export function VibrationSensorPanel({ notes, onNotesChange, onResultReady, onSave }: VibrationSensorPanelProps) {
  const { t } = useTranslation();
  const [feedbackOn, setFeedbackOn] = useState(false);
  const [step, setStep] = useState<'idle' | 'countdown' | 'recording' | 'done'>('idle');
  const [countdown, setCountdown] = useState(0);
  const [recordRemaining, setRecordRemaining] = useState(0);
  const [liveReading, setLiveReading] = useState<string | null>(null);
  const [isShaky, setIsShaky] = useState(false);
  const [result, setResult] = useState<MotionRecordingResult | null>(null);

  const stopRef = useRef<(() => void) | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => () => {
    cancelledRef.current = true;
    stopRef.current?.();
  }, []);

  const formatSummary = (r: MotionRecordingResult, feedback: boolean) =>
    `Vibration: ${r.vibrationAvg} cm | Smoothness: ${r.smoothness}/10 | ROM: ${r.rangeOfMotion} cm | Time: ${r.movementTime}s | Feedback: ${feedback ? 'on' : 'off'}`;

  const runRecording = async () => {
    const available = await isMotionSensorAvailable();
    if (!available) {
      Alert.alert(
        'Sensor Unavailable',
        'This device does not have an accelerometer. Use a physical phone with the STEMM Lab app.'
      );
      return;
    }

    cancelledRef.current = false;
    setStep('countdown');
    setLiveReading(null);
    setIsShaky(false);
    setResult(null);

    for (let i = PRE_COUNTDOWN_SEC; i >= 1; i--) {
      if (cancelledRef.current) return;
      setCountdown(i);
      await playCountdownBeep(i);
      await sleep(1000);
    }

    if (cancelledRef.current) return;

    await playStartBeep();
    setStep('recording');
    setRecordRemaining(RECORD_SEC);

    try {
      const session = await recordMotion(
        RECORD_SEC,
        feedbackOn,
        (remaining) => setRecordRemaining(remaining),
        (vibrationCm, shaky) => {
          setLiveReading(vibrationCm.toFixed(1));
          setIsShaky(shaky);
        },
        feedbackOn ? () => { playShakyAlert(); } : undefined
      );
      stopRef.current = () => session.stop();

      const recordingResult = await session.complete;
      stopRef.current = null;

      if (cancelledRef.current) return;

      setIsShaky(false);
      await playFinishDone();
      setResult(recordingResult);
      const summary = formatSummary(recordingResult, feedbackOn);
      onResultReady(summary);
      setStep('done');
    } catch {
      setStep('idle');
      Alert.alert('Recording Failed', 'Could not read from the accelerometer. Try again on a physical device.');
    }
  };

  const handleRetry = () => {
    setStep('idle');
    setResult(null);
    setLiveReading(null);
    onResultReady('');
  };

  if (step === 'done' && result) {
    return (
      <View>
        <View style={styles.resultBox}>
          <View style={styles.doneRow}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.secondary} />
            <Text style={styles.doneText}>Done!</Text>
          </View>
          <Text style={styles.resultLine}>Avg vibration: {result.vibrationAvg} cm</Text>
          <Text style={styles.resultSub}>Smoothness: {result.smoothness}/10</Text>
          <Text style={styles.resultSub}>Range of motion: {result.rangeOfMotion} cm</Text>
          <Text style={styles.resultSub}>Feedback: {feedbackOn ? 'On' : 'Off'}</Text>
        </View>
        <Input
          label={t('common.notes')}
          value={notes}
          onChangeText={onNotesChange}
          multiline
          numberOfLines={2}
          placeholder={t('sensors.notesPlaceholder')}
        />
        <Button
          title={t('sensors.saveLog')}
          onPress={onSave}
          size="lg"
          fullWidth
          style={{ marginTop: Spacing.md }}
          icon={<Ionicons name="save" size={18} color={Colors.white} />}
        />
        <Button title="Record again" onPress={handleRetry} variant="outlined" size="sm" style={{ marginTop: Spacing.sm }} />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleLabel}>Live feedback</Text>
          <Text style={styles.toggleHint}>
            {feedbackOn ? 'Screen + voice say "Slow" when shaky' : 'Silent recording only'}
          </Text>
        </View>
        <Switch
          value={feedbackOn}
          onValueChange={setFeedbackOn}
          disabled={step === 'countdown' || step === 'recording'}
          trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
          thumbColor={feedbackOn ? Colors.primary : Colors.textSecondary}
        />
      </View>

      {step === 'idle' && (
        <>
          <Text style={styles.hint}>
            Hold the phone and tap Start. Countdown 3-2-1, then 10 seconds of recording. Done plays when finished.
          </Text>
          <Button
            title={t('sensors.startMeasurement')}
            onPress={runRecording}
            size="lg"
            fullWidth
            icon={<Ionicons name="play" size={18} color={Colors.white} />}
          />
        </>
      )}

      {step === 'countdown' && (
        <View style={styles.countdownBox}>
          <Text style={styles.countdownLabel}>Get ready…</Text>
          <Text style={styles.countdownNumber}>{countdown}</Text>
        </View>
      )}

      {step === 'recording' && (
        <View style={[styles.recordingBox, feedbackOn && isShaky && styles.recordingShaky]}>
          <Ionicons name="radio-button-on" size={24} color={Colors.danger} />
          <Text style={styles.recordingTitle}>Recording… {recordRemaining}s</Text>
          <LiveMeter value={liveReading} isShaky={isShaky} feedbackOn={feedbackOn} />
        </View>
      )}
    </View>
  );
}

const meterStyles = StyleSheet.create({
  wrap: { width: '100%', marginTop: Spacing.md },
  label: { ...Typography.bodySmall, fontWeight: '600', marginBottom: Spacing.xs, textAlign: 'center' },
  track: { height: 10, backgroundColor: Colors.border, borderRadius: BorderRadius.full, overflow: 'hidden' },
  fill: { height: '100%' },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.danger + '20',
    borderRadius: BorderRadius.sm,
  },
  alertText: { ...Typography.caption, color: Colors.danger, fontWeight: '700' },
});

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  toggleText: { flex: 1, paddingRight: Spacing.md },
  toggleLabel: { ...Typography.label, marginBottom: 2 },
  toggleHint: { ...Typography.caption, color: Colors.textSecondary },
  hint: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 20 },
  countdownBox: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  countdownLabel: { ...Typography.body, color: Colors.textSecondary },
  countdownNumber: { fontSize: 64, fontWeight: '800', color: Colors.primary, marginTop: Spacing.sm },
  recordingBox: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.danger + '10',
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.danger + '40',
  },
  recordingShaky: { backgroundColor: Colors.danger + '25', borderColor: Colors.danger },
  recordingTitle: { ...Typography.h3, color: Colors.danger, marginTop: Spacing.sm },
  resultBox: {
    backgroundColor: Colors.secondary + '10',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
  },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  doneText: { ...Typography.h3, color: Colors.secondary },
  resultLine: { ...Typography.body, fontWeight: '700', marginBottom: Spacing.xs },
  resultSub: { ...Typography.bodySmall, color: Colors.textSecondary },
});
