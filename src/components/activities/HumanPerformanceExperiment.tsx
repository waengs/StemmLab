import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { recordMotion, isMotionSensorAvailable } from '../../utils/motionSensors';
import {
  playCountdownBeep,
  playStartBeep,
  playFinishDone,
  playShakyAlert,
  sleep,
  PRE_COUNTDOWN_SEC,
  RECORD_SEC,
} from '../../utils/recordingSounds';
import type { MovementId, MovementTrial } from './HumanPerformanceForm';

type RecordingPhase = 'baseline' | 'feedback';
type RecordingStep = 'intro' | 'prompt' | 'countdown' | 'recording' | 'review';

interface Props {
  trials: MovementTrial[];
  disabled: boolean;
  onUpdateTrial: (id: MovementId, updates: Partial<MovementTrial>) => void;
  onAllComplete: () => void;
}

const MOVEMENTS: { id: MovementId; label: string }[] = [
  { id: 'circle', label: 'Circle' },
  { id: 'figure8', label: 'Figure of 8' },
  { id: 'upDown', label: 'Up and down' },
  { id: 'sideToSide', label: 'Side to side' },
];

function getFirstIncompleteIndex(trials: MovementTrial[], phase: RecordingPhase): number {
  const field = phase === 'baseline' ? 'vibrationAvg' : 'vibrationAvgWithFeedback';
  return MOVEMENTS.findIndex((m) => !trials.find((t) => t.id === m.id)?.[field]);
}

function getInitialState(trials: MovementTrial[]) {
  const baselineIdx = getFirstIncompleteIndex(trials, 'baseline');
  if (baselineIdx >= 0) {
    const showIntro = !trials.some((t) => t.vibrationAvg);
    return { phase: 'baseline' as RecordingPhase, movementIndex: baselineIdx, step: (showIntro ? 'intro' : 'prompt') as RecordingStep };
  }
  const feedbackIdx = getFirstIncompleteIndex(trials, 'feedback');
  if (feedbackIdx >= 0) {
    const showIntro = !trials.some((t) => t.vibrationAvgWithFeedback);
    return { phase: 'feedback' as RecordingPhase, movementIndex: feedbackIdx, step: (showIntro ? 'intro' : 'prompt') as RecordingStep };
  }
  return { phase: 'feedback' as RecordingPhase, movementIndex: 0, step: 'prompt' as RecordingStep };
}

function LiveVibrationMeter({ value, isShaky, withFeedback }: { value: string | null; isShaky: boolean; withFeedback: boolean }) {
  if (value === null) return null;
  const num = parseFloat(value) || 0;
  const fill = Math.min(100, (num / 15) * 100);
  const barColor = isShaky ? Colors.danger : Colors.secondary;

  return (
    <View style={meterStyles.wrap}>
      <Text style={meterStyles.label}>Live vibration: {value} cm</Text>
      <View style={meterStyles.track}>
        <View style={[meterStyles.fill, { width: `${fill}%`, backgroundColor: barColor }]} />
      </View>
      {withFeedback && isShaky && (
        <View style={meterStyles.alertBox}>
          <Ionicons name="warning" size={22} color={Colors.danger} />
          <Text style={meterStyles.alertText}>TOO SHAKY — SLOW DOWN</Text>
        </View>
      )}
      {withFeedback && !isShaky && (
        <Text style={meterStyles.okText}>Smooth — keep going</Text>
      )}
    </View>
  );
}

export function HumanPerformanceExperiment({ trials, disabled, onUpdateTrial, onAllComplete }: Props) {
  const initial = getInitialState(trials);
  const [phase, setPhase] = useState<RecordingPhase>(initial.phase);
  const [movementIndex, setMovementIndex] = useState(initial.movementIndex);
  const [step, setStep] = useState<RecordingStep>(initial.step);
  const [countdown, setCountdown] = useState(0);
  const [recordRemaining, setRecordRemaining] = useState(0);
  const [liveReading, setLiveReading] = useState<string | null>(null);
  const [isShaky, setIsShaky] = useState(false);
  const [lastResult, setLastResult] = useState<{ vibrationAvg: string; smoothness: string; rangeOfMotion: string } | null>(null);

  const stopRef = useRef<(() => void) | null>(null);
  const cancelledRef = useRef(false);

  const currentMovement = MOVEMENTS[movementIndex];
  const withFeedback = phase === 'feedback';

  const isRecorded = (id: MovementId, p: RecordingPhase) => {
    const trial = trials.find((t) => t.id === id);
    return p === 'baseline' ? !!trial?.vibrationAvg : !!trial?.vibrationAvgWithFeedback;
  };

  const progressDone = MOVEMENTS.filter((m) => isRecorded(m.id, phase)).length;

  useEffect(() => () => {
    cancelledRef.current = true;
    stopRef.current?.();
  }, []);

  const saveResult = useCallback(
    (result: {
      vibrationAvg: string;
      speedAvg: string;
      smoothness: string;
      rangeOfMotion: string;
      movementTime: string;
    }) => {
      if (phase === 'baseline') {
        onUpdateTrial(currentMovement.id, {
          vibrationAvg: result.vibrationAvg,
          speedAvg: result.speedAvg,
          smoothness: result.smoothness,
          rangeOfMotion: result.rangeOfMotion,
          movementTime: result.movementTime,
        });
      } else {
        onUpdateTrial(currentMovement.id, { vibrationAvgWithFeedback: result.vibrationAvg });
      }
      setLastResult({
        vibrationAvg: result.vibrationAvg,
        smoothness: result.smoothness,
        rangeOfMotion: result.rangeOfMotion,
      });
      setStep('review');
    },
    [currentMovement.id, onUpdateTrial, phase]
  );

  const runRecording = async () => {
    const available = await isMotionSensorAvailable();
    if (!available) {
      Alert.alert('Sensor Unavailable', 'Use a physical phone with the STEMM Lab app.');
      setStep('prompt');
      return;
    }

    cancelledRef.current = false;
    setStep('countdown');
    setLiveReading(null);
    setIsShaky(false);

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
        withFeedback,
        (remaining) => setRecordRemaining(remaining),
        (vibrationCm, shaky) => {
          setLiveReading(vibrationCm.toFixed(1));
          setIsShaky(shaky);
        },
        withFeedback ? () => { playShakyAlert(); } : undefined
      );
      stopRef.current = () => session.stop();

      const result = await session.complete;
      stopRef.current = null;

      if (cancelledRef.current) return;

      setIsShaky(false);
      await playFinishDone();
      saveResult(result);
    } catch {
      setStep('prompt');
      Alert.alert('Recording Failed', 'Could not read from the accelerometer. Try again on a physical device.');
    }
  };

  const handleNext = () => {
    setLastResult(null);
    const nextIndex = movementIndex + 1;
    if (nextIndex < MOVEMENTS.length) {
      setMovementIndex(nextIndex);
      setStep('prompt');
      return;
    }

    if (phase === 'baseline') {
      setPhase('feedback');
      setMovementIndex(0);
      setStep('intro');
      return;
    }

    onAllComplete();
  };

  const phaseLabel = phase === 'baseline' ? 'Round 1: Silent recording' : 'Round 2: Live feedback on';

  return (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>Vibration + Speed Sensor</Text>

      <View style={styles.phaseBadge}>
        <Text style={styles.phaseText}>{phaseLabel}</Text>
        <Text style={styles.progressText}>{progressDone}/{MOVEMENTS.length} recorded this round</Text>
      </View>

      <View style={styles.progressList}>
        {MOVEMENTS.map((m) => {
          const round1 = isRecorded(m.id, 'baseline');
          const round2 = isRecorded(m.id, 'feedback');
          const isCurrent = m.id === currentMovement.id;
          const done = round1 && round2;
          return (
            <View key={m.id} style={[styles.progressRow, isCurrent && styles.progressRowActive]}>
              <Ionicons
                name={done ? 'checkmark-circle' : round1 || round2 ? 'ellipse' : 'ellipse-outline'}
                size={20}
                color={done ? Colors.secondary : isCurrent ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.progressLabel, isCurrent && styles.progressLabelActive]}>{m.label}</Text>
              <Text style={styles.progressStatus}>
                {done ? 'Done' : round1 && !round2 ? 'Round 1 ✓' : round2 ? 'Round 2 ✓' : isCurrent ? 'Current' : '—'}
              </Text>
            </View>
          );
        })}
      </View>

      {step === 'intro' && (
        <View style={styles.introBox}>
          {phase === 'baseline' ? (
            <>
              <Text style={styles.introTitle}>Round 1 — Silent recording</Text>
              <Text style={styles.introText}>
                The phone measures movement quietly. Perform each movement slowly for 10 seconds after the countdown.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.introTitle}>Round 2 — Live feedback</Text>
              <Text style={styles.introText}>
                Same movements again. If you are too shaky, the screen turns red with a warning and the phone says
                &quot;Slow&quot; — so you can adjust even if you cannot feel a buzz.
              </Text>
            </>
          )}
          <Button title="Start now?" onPress={() => setStep('prompt')} size="lg" fullWidth style={styles.bigBtn} disabled={disabled} />
        </View>
      )}

      {step !== 'intro' && (
        <>
          <View style={[styles.currentMovementBox, withFeedback && step === 'recording' && isShaky && styles.currentMovementShaky]}>
            <Text style={styles.currentLabel}>Current movement</Text>
            <Text style={styles.currentMovement}>{currentMovement.label}</Text>
            {withFeedback && step !== 'recording' && (
              <Text style={styles.currentHint}>Watch the screen — red + &quot;Slow&quot; means ease up.</Text>
            )}
          </View>

          {step === 'prompt' && (
            <View style={styles.promptBox}>
              <Text style={styles.promptText}>
                Tap Start now. Countdown 3, 2, 1, then Go. Recording lasts 10 seconds — Done plays when finished.
              </Text>
              <Button
                title="Start now?"
                onPress={() => { if (!disabled) runRecording(); }}
                size="lg"
                fullWidth
                style={styles.bigBtn}
                disabled={disabled}
                icon={<Ionicons name="mic" size={22} color={Colors.white} />}
              />
            </View>
          )}

          {step === 'countdown' && (
            <View style={styles.countdownBox}>
              <Text style={styles.countdownLabel}>Get ready…</Text>
              <Text style={styles.countdownNumber}>{countdown}</Text>
              <Text style={styles.countdownHint}>Perform: {currentMovement.label}</Text>
            </View>
          )}

          {step === 'recording' && (
            <View style={[styles.recordingBox, withFeedback && isShaky && styles.recordingBoxShaky]}>
              <Ionicons name="radio-button-on" size={28} color={isShaky && withFeedback ? Colors.danger : Colors.danger} />
              <Text style={styles.recordingTitle}>Recording… {recordRemaining}s</Text>
              <Text style={styles.recordingMovement}>{currentMovement.label}</Text>
              <LiveVibrationMeter value={liveReading} isShaky={isShaky} withFeedback={withFeedback} />
            </View>
          )}

          {step === 'review' && lastResult && (
            <View style={styles.reviewBox}>
              <View style={styles.doneRow}>
                <Ionicons name="checkmark-circle" size={28} color={Colors.secondary} />
                <Text style={styles.doneText}>Done!</Text>
              </View>
              <Text style={styles.resultText}>Avg vibration: {lastResult.vibrationAvg} cm</Text>
              {phase === 'baseline' && (
                <>
                  <Text style={styles.resultSubtext}>Smoothness: {lastResult.smoothness}/10</Text>
                  <Text style={styles.resultSubtext}>Range of motion: {lastResult.rangeOfMotion} cm</Text>
                </>
              )}

              {!disabled && (
                <View style={styles.actionRow}>
                  <Button title="Retry" onPress={() => { setLastResult(null); setStep('prompt'); }} variant="outlined" size="lg" style={styles.actionBtn} />
                  <Button title="Next" onPress={handleNext} size="lg" style={styles.actionBtn} icon={<Ionicons name="arrow-forward" size={20} color={Colors.white} />} />
                </View>
              )}
            </View>
          )}
        </>
      )}
    </Card>
  );
}

const meterStyles = StyleSheet.create({
  wrap: { width: '100%', marginTop: Spacing.md, alignItems: 'center' },
  label: { ...Typography.bodySmall, marginBottom: Spacing.sm, fontWeight: '600' },
  track: {
    width: '100%',
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: BorderRadius.full },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: Colors.danger + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.danger,
    width: '100%',
    justifyContent: 'center',
  },
  alertText: { ...Typography.label, color: Colors.danger, fontWeight: '800' },
  okText: { ...Typography.caption, color: Colors.secondary, marginTop: Spacing.sm, fontWeight: '600' },
});

const styles = StyleSheet.create({
  card: { padding: Spacing.xl, marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h2, marginBottom: Spacing.md },
  phaseBadge: { backgroundColor: Colors.primary + '12', padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  phaseText: { ...Typography.label, color: Colors.primary, marginBottom: Spacing.xs },
  progressText: { ...Typography.caption, color: Colors.textSecondary },
  progressList: { marginBottom: Spacing.lg },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm },
  progressRowActive: { backgroundColor: Colors.primary + '10' },
  progressLabel: { ...Typography.body, flex: 1, color: Colors.textSecondary },
  progressLabelActive: { fontWeight: '700', color: Colors.text },
  progressStatus: { ...Typography.caption, color: Colors.textSecondary },
  introBox: { marginBottom: Spacing.lg },
  introTitle: { ...Typography.h3, marginBottom: Spacing.sm },
  introText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },
  currentMovementBox: { alignItems: 'center', padding: Spacing.lg, backgroundColor: Colors.background, borderRadius: BorderRadius.md, marginBottom: Spacing.lg },
  currentMovementShaky: { backgroundColor: Colors.danger + '15', borderWidth: 2, borderColor: Colors.danger },
  currentLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.xs },
  currentMovement: { ...Typography.h1, color: Colors.primary },
  currentHint: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
  promptBox: { marginBottom: Spacing.md },
  promptText: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 22 },
  bigBtn: { paddingVertical: Spacing.lg },
  countdownBox: { alignItems: 'center', padding: Spacing.xxxl, marginBottom: Spacing.md },
  countdownLabel: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.sm },
  countdownNumber: { fontSize: 72, fontWeight: '800', color: Colors.primary, fontVariant: ['tabular-nums'] },
  countdownHint: { ...Typography.h3, marginTop: Spacing.md, color: Colors.text },
  recordingBox: { alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.danger + '10', borderRadius: BorderRadius.md, marginBottom: Spacing.md, borderWidth: 2, borderColor: Colors.danger + '40', width: '100%' },
  recordingBoxShaky: { backgroundColor: Colors.danger + '25', borderColor: Colors.danger, borderWidth: 3 },
  recordingTitle: { ...Typography.h2, color: Colors.danger, marginTop: Spacing.sm },
  recordingMovement: { ...Typography.body, marginTop: Spacing.xs, fontWeight: '600' },
  reviewBox: { padding: Spacing.lg, backgroundColor: Colors.secondary + '10', borderRadius: BorderRadius.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.secondary + '40' },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  doneText: { ...Typography.h3, color: Colors.secondary },
  resultText: { ...Typography.body, fontWeight: '700', marginBottom: Spacing.xs },
  resultSubtext: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 2 },
  actionRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  actionBtn: { flex: 1, paddingVertical: Spacing.md },
});
