import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Spacing, Typography, BorderRadius  } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { recordBreathing, isBreathingSensorAvailable, BREATH_RECORD_SEC } from '../../utils/breathingSensor';
import {
  playCountdownBeep,
  playStartBeep,
  playFinishDone,
  sleep,
  PRE_COUNTDOWN_SEC,
} from '../../utils/recordingSounds';
import type { BreathingConditionId, BreathingTrial } from './BreathingPaceForm';

type Step = 'intro' | 'exercise' | 'prompt' | 'countdown' | 'recording' | 'review';

interface ConditionConfig {
  id: BreathingConditionId;
  label: string;
  needsExercise: boolean;
  exerciseTitle?: string;
  exerciseText?: string;
  exerciseTimerSec?: number;
}

interface Props {
  trials: BreathingTrial[];
  disabled: boolean;
  onUpdateTrial: (id: BreathingConditionId, updates: Partial<BreathingTrial>) => void;
  onAllComplete: () => void;
}

const CONDITIONS: ConditionConfig[] = [
  {
    id: 'atRest',
    label: 'Breathing at Rest',
    needsExercise: false,
  },
  {
    id: 'afterJog',
    label: 'After Jog',
    needsExercise: true,
    exerciseTitle: 'Jog on the spot',
    exerciseText: 'Jog in place for 1 minute. When finished, lie on your back and place the phone gently on your chest.',
    exerciseTimerSec: 60,
  },
  {
    id: 'afterStarJump',
    label: 'After Star Jumps',
    needsExercise: true,
    exerciseTitle: '100 star jumps',
    exerciseText: 'Do 100 star jumps. When finished, lie on your back and place the phone gently on your chest.',
  },
];

function getFirstIncompleteIndex(trials: BreathingTrial[]): number {
  return CONDITIONS.findIndex((condition) => !trials.find((trial) => trial.id === condition.id)?.recordingDuration);
}

function LiveBreathMeter({ value }: { value: string | null }) {
  const meterStyles = useThemedStyles(({ colors, typography }) => ({
    wrap: { width: '100%', marginTop: Spacing.md },
    label: { ...typography.bodySmall, fontWeight: '600', marginBottom: Spacing.xs, textAlign: 'center' },
    track: { height: 10, backgroundColor: colors.border, borderRadius: BorderRadius.full, overflow: 'hidden' },
    fill: { height: '100%', backgroundColor: colors.primary },
  }));

  if (value === null) return null;
  const fill = Math.min(100, (parseFloat(value) / 8) * 100);

  return (
    <View style={meterStyles.wrap}>
      <Text style={meterStyles.label}>Chest movement: {value} cm</Text>
      <View style={meterStyles.track}>
        <View style={[meterStyles.fill, { width: `${fill}%` }]} />
      </View>
    </View>
  );
}

function useBreathingPaceExperimentStyles() {
  return useThemedStyles(({ colors, typography }) => ({
  card: { padding: Spacing.lg, marginBottom: Spacing.md },
  phaseTitle: { ...typography.h3, color: colors.primary, marginBottom: Spacing.xs },
  progressText: { ...typography.caption, color: colors.textSecondary, marginBottom: Spacing.md },
  progressList: { gap: Spacing.xs, marginBottom: Spacing.lg },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressLabel: { ...typography.bodySmall },
  stepBox: { gap: Spacing.md },
  stepText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  exerciseTitle: { ...typography.h3 },
  exerciseTimer: { ...typography.h2, color: colors.primary, textAlign: 'center' },
  countdownBox: { alignItems: 'center', paddingVertical: Spacing.xl },
  countdownLabel: { ...typography.body, color: colors.textSecondary },
  countdownNumber: { fontSize: 64, fontWeight: '800', color: colors.primary, marginTop: Spacing.sm },
  recordingBox: { alignItems: 'center', padding: Spacing.lg, backgroundColor: colors.primary + '08', borderRadius: BorderRadius.md },
  recordingTitle: { ...typography.h3, marginTop: Spacing.sm },
  recordingHint: { ...typography.bodySmall, color: colors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.sm },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginTop: Spacing.lg },
  counterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnPrimary: { backgroundColor: colors.primary },
  counterDisplay: { alignItems: 'center', minWidth: 100 },
  counterNumber: { fontSize: 36, fontWeight: '800', color: colors.primary },
  counterLabel: { ...typography.caption, color: colors.textSecondary },
  reviewBox: { gap: Spacing.sm },
  reviewTitle: { ...typography.h3, color: colors.secondary },
  reviewLine: { ...typography.body, fontWeight: '700' },
  reviewSub: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: Spacing.sm },
  reviewActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
  doneTitle: { ...typography.h3, marginBottom: Spacing.md, textAlign: 'center' },
  }));
}

export function BreathingPaceExperiment({
trials, disabled, onUpdateTrial, onAllComplete }: Props) {
  const { t } = useTranslation();
  const styles = useBreathingPaceExperimentStyles();
  const { colors } = useTheme();

  const initialIndex = Math.max(0, getFirstIncompleteIndex(trials));
  const [conditionIndex, setConditionIndex] = useState(initialIndex);
  const [step, setStep] = useState<Step>(() => {
    const condition = CONDITIONS[initialIndex];
    if (!condition) return 'prompt';
    if (condition.needsExercise && !trials.find((trial) => trial.id === condition.id)?.recordingDuration) {
      return 'intro';
    }
    return trials.some((trial) => trial.recordingDuration) ? 'prompt' : 'intro';
  });
  const [countdown, setCountdown] = useState(0);
  const [recordRemaining, setRecordRemaining] = useState(0);
  const [liveReading, setLiveReading] = useState<string | null>(null);
  const [manualBreathCount, setManualBreathCount] = useState(0);
  const [lastResult, setLastResult] = useState<{
    breathsPerMinute: string;
    sensorBreathCount: string;
    movementAvg: string;
    movementPeak: string;
    recordingDuration: string;
  } | null>(null);
  const [exerciseRemaining, setExerciseRemaining] = useState<number | null>(null);

  const stopRef = useRef<(() => void) | null>(null);
  const cancelledRef = useRef(false);

  const currentCondition = CONDITIONS[conditionIndex];

  const isRecorded = (id: BreathingConditionId) => !!trials.find((trial) => trial.id === id)?.recordingDuration;

  useEffect(() => () => {
    cancelledRef.current = true;
    stopRef.current?.();
  }, []);

  useEffect(() => {
    if (exerciseRemaining === null || exerciseRemaining <= 0) return undefined;
    const timer = setInterval(() => {
      setExerciseRemaining((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exerciseRemaining]);

  const saveResult = useCallback(
    (manualCount: number, sensorResult: {
      breathsPerMinute: string;
      sensorBreathCount: string;
      movementAvg: string;
      movementPeak: string;
      recordingDuration: string;
    }) => {
      onUpdateTrial(currentCondition.id, {
        breathCount: String(manualCount),
        breathsPerMinute: String(manualCount),
        sensorBreathCount: sensorResult.sensorBreathCount,
        movementAvg: sensorResult.movementAvg,
        movementPeak: sensorResult.movementPeak,
        recordingDuration: sensorResult.recordingDuration,
      });
    },
    [currentCondition.id, onUpdateTrial]
  );

  const runRecording = async () => {
    const available = await isBreathingSensorAvailable();
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
    setManualBreathCount(0);
    setLastResult(null);

    for (let i = PRE_COUNTDOWN_SEC; i >= 1; i -= 1) {
      if (cancelledRef.current) return;
      setCountdown(i);
      await playCountdownBeep(i);
      await sleep(1000);
    }

    if (cancelledRef.current) return;

    await playStartBeep();
    setStep('recording');
    setRecordRemaining(BREATH_RECORD_SEC);

    try {
      const session = await recordBreathing(
        BREATH_RECORD_SEC,
        (remaining) => setRecordRemaining(remaining),
        (movementCm) => setLiveReading(movementCm.toFixed(1))
      );
      stopRef.current = () => session.stop();

      const recordingResult = await session.complete;
      stopRef.current = null;

      if (cancelledRef.current) return;

      await playFinishDone();
      setLastResult(recordingResult);
      setStep('review');
    } catch {
      setStep('prompt');
      Alert.alert('Recording Failed', 'Could not read chest movement from the accelerometer. Try again on a physical device.');
    }
  };

  const handleConfirmReview = () => {
    if (!lastResult) return;
    if (manualBreathCount <= 0) {
      Alert.alert('Count your breaths', 'Enter how many breaths you counted during the 1-minute recording.');
      return;
    }
    saveResult(manualBreathCount, lastResult);

    const nextIndex = conditionIndex + 1;
    if (nextIndex < CONDITIONS.length) {
      setConditionIndex(nextIndex);
      setStep(CONDITIONS[nextIndex].needsExercise ? 'intro' : 'prompt');
      setManualBreathCount(0);
      setLastResult(null);
      setLiveReading(null);
      setExerciseRemaining(null);
      return;
    }

    onAllComplete();
  };

  if (!currentCondition) {
    return (
      <Card style={styles.card}>
        <Text style={styles.doneTitle}>All recordings complete!</Text>
        <Button title="View Results" onPress={onAllComplete} size="lg" />
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.phaseTitle}>{currentCondition.label}</Text>
      <Text style={styles.progressText}>
        Recordings complete: {CONDITIONS.filter((condition) => isRecorded(condition.id)).length}/{CONDITIONS.length}
      </Text>

      <View style={styles.progressList}>
        {CONDITIONS.map((condition) => (
          <View key={condition.id} style={styles.progressRow}>
            <Ionicons
              name={isRecorded(condition.id) ? 'checkmark-circle' : condition.id === currentCondition.id ? 'ellipse' : 'ellipse-outline'}
              size={18}
              color={isRecorded(condition.id) ? colors.secondary : colors.primary}
            />
            <Text style={styles.progressLabel}>{condition.label}</Text>
          </View>
        ))}
      </View>

      {step === 'intro' && (
        <View style={styles.stepBox}>
          <Text style={styles.stepText}>
            Place the phone gently on your chest. Lie on a flat surface or mat. Keep still and breathe normally for the
            1-minute recording.
          </Text>
          {currentCondition.needsExercise ? (
            <Button title="Next: Exercise" onPress={() => setStep('exercise')} size="lg" disabled={disabled} />
          ) : (
            <Button title="Start now?" onPress={() => setStep('prompt')} size="lg" disabled={disabled} />
          )}
        </View>
      )}

      {step === 'exercise' && (
        <View style={styles.stepBox}>
          <Text style={styles.exerciseTitle}>{currentCondition.exerciseTitle}</Text>
          <Text style={styles.stepText}>{currentCondition.exerciseText}</Text>
          {currentCondition.exerciseTimerSec ? (
            <>
              <Text style={styles.exerciseTimer}>{exerciseRemaining ?? currentCondition.exerciseTimerSec}s</Text>
              {exerciseRemaining === null && (
                <Button title="Start 1-minute jog" onPress={() => setExerciseRemaining(currentCondition.exerciseTimerSec!)} size="lg" />
              )}
              {exerciseRemaining === 0 && (
                <Button title="Ready to record breathing" onPress={() => setStep('prompt')} size="lg" />
              )}
            </>
          ) : (
            <Button title="I finished 100 star jumps" onPress={() => setStep('prompt')} size="lg" disabled={disabled} />
          )}
        </View>
      )}

      {step === 'prompt' && (
        <View style={styles.stepBox}>
          <Text style={styles.stepText}>
            Lie on your back. Place the phone gently on your chest. Tap + each time you breathe in during the 1-minute
            recording.
          </Text>
          <Button title="Start recording" onPress={runRecording} size="lg" disabled={disabled} icon={<Ionicons name="mic" size={18} color={colors.white} />} />
        </View>
      )}

      {step === 'countdown' && (
        <View style={styles.countdownBox}>
          <Text style={styles.countdownLabel}>Get ready…</Text>
          <Text style={styles.countdownNumber}>{countdown}</Text>
        </View>
      )}

      {step === 'recording' && (
        <View style={styles.recordingBox}>
          <Ionicons name="heart" size={24} color={colors.primary} />
          <Text style={styles.recordingTitle}>Recording… {recordRemaining}s</Text>
          <Text style={styles.recordingHint}>Count each breath and tap + below</Text>
          <LiveBreathMeter value={liveReading} />
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setManualBreathCount((count) => Math.max(0, count - 1))}
            >
              <Ionicons name="remove" size={28} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.counterDisplay}>
              <Text style={styles.counterNumber}>{manualBreathCount}</Text>
              <Text style={styles.counterLabel}>breaths counted</Text>
            </View>
            <TouchableOpacity style={[styles.counterBtn, styles.counterBtnPrimary]} onPress={() => setManualBreathCount((count) => count + 1)}>
              <Ionicons name="add" size={28} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 'review' && lastResult && (
        <View style={styles.reviewBox}>
          <Text style={styles.reviewTitle}>Recording complete</Text>
          <Text style={styles.reviewLine}>Sensor estimate: {lastResult.breathsPerMinute} breaths/min</Text>
          <Text style={styles.reviewSub}>Movement avg: {lastResult.movementAvg} cm | peak: {lastResult.movementPeak} cm</Text>
          <Input
            label="Breaths you counted (1 minute)"
            value={manualBreathCount > 0 ? String(manualBreathCount) : ''}
            onChangeText={(value) => setManualBreathCount(Math.max(0, parseInt(value, 10) || 0))}
            keyboardType="numeric"
            onLightSurface
          />
          <View style={styles.reviewActions}>
            <Button title="Retry" onPress={() => setStep('prompt')} variant="outlined" size="sm" />
            <Button title={t('common.next')} onPress={handleConfirmReview} size="sm" />
          </View>
        </View>
      )}
    </Card>
  );
}

