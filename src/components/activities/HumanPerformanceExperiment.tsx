import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spacing, Typography, BorderRadius  } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
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
import { MOVEMENT_IDS, getMovementLabel } from '../../utils/humanPerformanceMovements';

type RecordingPhase = 'baseline' | 'feedback';
type RecordingStep = 'intro' | 'prompt' | 'countdown' | 'recording' | 'review';

interface Props {
  trials: MovementTrial[];
  disabled: boolean;
  onUpdateTrial: (id: MovementId, updates: Partial<MovementTrial>) => void;
  onAllComplete: () => void;
}

function getFirstIncompleteIndex(trials: MovementTrial[], phase: RecordingPhase): number {
  const field = phase === 'baseline' ? 'vibrationAvg' : 'vibrationAvgWithFeedback';
  return MOVEMENT_IDS.findIndex((id) => !trials.find((t) => t.id === id)?.[field]);
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

function LiveVibrationMeter({
  value,
  isShaky,
  withFeedback,
}: {
  value: string | null;
  isShaky: boolean;
  withFeedback: boolean;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const meterStyles = useThemedStyles(({ colors: c, typography }) => ({
    wrap: { width: '100%', marginTop: Spacing.md },
    label: { ...typography.bodySmall, marginBottom: Spacing.sm, fontWeight: '600', textAlign: 'center' },
    track: { height: 12, backgroundColor: c.border, borderRadius: BorderRadius.full, overflow: 'hidden' },
    fill: { height: '100%' },
    alertBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
      marginTop: Spacing.sm,
      padding: Spacing.sm,
      backgroundColor: c.danger + '20',
      borderRadius: BorderRadius.sm,
    },
    alertText: { ...typography.label, color: c.danger, fontWeight: '800' },
    okText: { ...typography.caption, color: c.secondary, marginTop: Spacing.sm, fontWeight: '600', textAlign: 'center' },
  }));

  if (value === null) return null;
  const num = parseFloat(value) || 0;
  const fill = Math.min(100, (num / 15) * 100);
  const barColor = isShaky ? colors.danger : colors.secondary;

  return (
    <View style={meterStyles.wrap}>
      <Text style={meterStyles.label}>
        {t('data.activities.human-performance.experiment.liveVibration', { value })}
      </Text>
      <View style={meterStyles.track}>
        <View style={[meterStyles.fill, { width: `${fill}%`, backgroundColor: barColor }]} />
      </View>
      {withFeedback && isShaky && (
        <View style={meterStyles.alertBox}>
          <Ionicons name="warning" size={22} color={colors.danger} />
          <Text style={meterStyles.alertText}>
            {t('data.activities.human-performance.experiment.tooShaky')}
          </Text>
        </View>
      )}
      {withFeedback && !isShaky && (
        <Text style={meterStyles.okText}>{t('data.activities.human-performance.experiment.smoothOk')}</Text>
      )}
    </View>
  );
}

function useHumanPerformanceExperimentStyles() {
  return useThemedStyles(({ colors, typography }) => ({
  card: { padding: Spacing.xl, marginBottom: Spacing.md },
  sectionTitle: { ...typography.h2, marginBottom: Spacing.md },
  phaseBadge: { backgroundColor: colors.primary + '12', padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  phaseText: { ...typography.label, color: colors.primary, marginBottom: Spacing.xs },
  progressText: { ...typography.caption, color: colors.textSecondary },
  progressList: { marginBottom: Spacing.lg },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm },
  progressRowActive: { backgroundColor: colors.primary + '10' },
  progressLabel: { ...typography.body, flex: 1, color: colors.textSecondary },
  progressLabelActive: { fontWeight: '700', color: colors.text },
  progressStatus: { ...typography.caption, color: colors.textSecondary },
  introBox: { marginBottom: Spacing.lg },
  introTitle: { ...typography.h3, marginBottom: Spacing.sm },
  introText: { ...typography.body, color: colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },
  currentMovementBox: { alignItems: 'center', padding: Spacing.lg, backgroundColor: colors.background, borderRadius: BorderRadius.md, marginBottom: Spacing.lg },
  currentMovementShaky: { backgroundColor: colors.danger + '15', borderWidth: 2, borderColor: colors.danger },
  currentLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: Spacing.xs },
  currentMovement: { ...typography.h1, color: colors.primary },
  currentHint: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
  promptBox: { marginBottom: Spacing.md },
  promptText: { ...typography.body, color: colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 22 },
  bigBtn: { paddingVertical: Spacing.lg },
  countdownBox: { alignItems: 'center', padding: Spacing.xxxl, marginBottom: Spacing.md },
  countdownLabel: { ...typography.body, color: colors.textSecondary, marginBottom: Spacing.sm },
  countdownNumber: { fontSize: 72, fontWeight: '800', color: colors.primary, fontVariant: ['tabular-nums'] },
  countdownHint: { ...typography.h3, marginTop: Spacing.md, color: colors.text },
  recordingBox: { alignItems: 'center', padding: Spacing.xl, backgroundColor: colors.danger + '10', borderRadius: BorderRadius.md, marginBottom: Spacing.md, borderWidth: 2, borderColor: colors.danger + '40', width: '100%' },
  recordingBoxShaky: { backgroundColor: colors.danger + '25', borderColor: colors.danger, borderWidth: 3 },
  recordingTitle: { ...typography.h2, color: colors.danger, marginTop: Spacing.sm },
  recordingMovement: { ...typography.body, marginTop: Spacing.xs, fontWeight: '600' },
  reviewBox: { padding: Spacing.lg, backgroundColor: colors.secondary + '10', borderRadius: BorderRadius.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: colors.secondary + '40' },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  doneText: { ...typography.h3, color: colors.secondary },
  resultText: { ...typography.body, fontWeight: '700', marginBottom: Spacing.xs },
  resultSubtext: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 2 },
  actionRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  actionBtn: { flex: 1, paddingVertical: Spacing.md },
  }));
}

export function HumanPerformanceExperiment({
trials, disabled, onUpdateTrial, onAllComplete }: Props) {
  const { t } = useTranslation();
  const styles = useHumanPerformanceExperimentStyles();
  const { colors } = useTheme();

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

  const currentMovementId = MOVEMENT_IDS[movementIndex];
  const currentMovementLabel = getMovementLabel(currentMovementId, t);
  const withFeedback = phase === 'feedback';
  const exp = 'data.activities.human-performance.experiment';

  const isRecorded = (id: MovementId, p: RecordingPhase) => {
    const trial = trials.find((t) => t.id === id);
    return p === 'baseline' ? !!trial?.vibrationAvg : !!trial?.vibrationAvgWithFeedback;
  };

  const progressDone = MOVEMENT_IDS.filter((id) => isRecorded(id, phase)).length;

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
        onUpdateTrial(currentMovementId, {
          vibrationAvg: result.vibrationAvg,
          speedAvg: result.speedAvg,
          smoothness: result.smoothness,
          rangeOfMotion: result.rangeOfMotion,
          movementTime: result.movementTime,
        });
      } else {
        onUpdateTrial(currentMovementId, { vibrationAvgWithFeedback: result.vibrationAvg });
      }
      setLastResult({
        vibrationAvg: result.vibrationAvg,
        smoothness: result.smoothness,
        rangeOfMotion: result.rangeOfMotion,
      });
      setStep('review');
    },
    [currentMovementId, onUpdateTrial, phase]
  );

  const runRecording = async () => {
    const available = await isMotionSensorAvailable();
    if (!available) {
      Alert.alert(
        t(`${exp}.sensorUnavailableTitle`),
        t(`${exp}.sensorUnavailableText`)
      );
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
      Alert.alert(
        t(`${exp}.recordingFailedTitle`),
        t(`${exp}.recordingFailedText`)
      );
    }
  };

  const handleNext = () => {
    setLastResult(null);
    const nextIndex = movementIndex + 1;
    if (nextIndex < MOVEMENT_IDS.length) {
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

  const phaseLabel =
    phase === 'baseline' ? t(`${exp}.round1Phase`) : t(`${exp}.round2Phase`);

  return (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>{t('data.activities.human-performance.sensorTitle')}</Text>

      <View style={styles.phaseBadge}>
        <Text style={styles.phaseText}>{phaseLabel}</Text>
        <Text style={styles.progressText}>
          {t(`${exp}.progressRecorded`, { done: progressDone, total: MOVEMENT_IDS.length })}
        </Text>
      </View>

      <View style={styles.progressList}>
        {MOVEMENT_IDS.map((id) => {
          const round1 = isRecorded(id, 'baseline');
          const round2 = isRecorded(id, 'feedback');
          const isCurrent = id === currentMovementId;
          const done = round1 && round2;
          const label = getMovementLabel(id, t);
          return (
            <View key={id} style={[styles.progressRow, isCurrent && styles.progressRowActive]}>
              <Ionicons
                name={done ? 'checkmark-circle' : round1 || round2 ? 'ellipse' : 'ellipse-outline'}
                size={20}
                color={done ? colors.secondary : isCurrent ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.progressLabel, isCurrent && styles.progressLabelActive]}>{label}</Text>
              <Text style={styles.progressStatus}>
                {done
                  ? t(`${exp}.statusDone`)
                  : round1 && !round2
                    ? t(`${exp}.statusRound1`)
                    : round2
                      ? t(`${exp}.statusRound2`)
                      : isCurrent
                        ? t(`${exp}.statusCurrent`)
                        : t(`${exp}.statusEmpty`)}
              </Text>
            </View>
          );
        })}
      </View>

      {step === 'intro' && (
        <View style={styles.introBox}>
          {phase === 'baseline' ? (
            <>
              <Text style={styles.introTitle}>{t(`${exp}.round1IntroTitle`)}</Text>
              <Text style={styles.introText}>{t(`${exp}.round1IntroText`)}</Text>
            </>
          ) : (
            <>
              <Text style={styles.introTitle}>{t(`${exp}.round2IntroTitle`)}</Text>
              <Text style={styles.introText}>{t(`${exp}.round2IntroText`)}</Text>
            </>
          )}
          <Button
            title={t(`${exp}.startNow`)}
            onPress={() => setStep('prompt')}
            size="lg"
            fullWidth
            style={styles.bigBtn}
            disabled={disabled}
          />
        </View>
      )}

      {step !== 'intro' && (
        <>
          <View style={[styles.currentMovementBox, withFeedback && step === 'recording' && isShaky && styles.currentMovementShaky]}>
            <Text style={styles.currentLabel}>{t(`${exp}.currentMovement`)}</Text>
            <Text style={styles.currentMovement}>{currentMovementLabel}</Text>
            {withFeedback && step !== 'recording' && (
              <Text style={styles.currentHint}>{t(`${exp}.currentHint`)}</Text>
            )}
          </View>

          {step === 'prompt' && (
            <View style={styles.promptBox}>
              <Text style={styles.promptText}>{t(`${exp}.promptText`)}</Text>
              <Button
                title={t(`${exp}.startNow`)}
                onPress={() => { if (!disabled) runRecording(); }}
                size="lg"
                fullWidth
                style={styles.bigBtn}
                disabled={disabled}
                icon={<Ionicons name="mic" size={22} color={colors.white} />}
              />
            </View>
          )}

          {step === 'countdown' && (
            <View style={styles.countdownBox}>
              <Text style={styles.countdownLabel}>{t(`${exp}.getReady`)}</Text>
              <Text style={styles.countdownNumber}>{countdown}</Text>
              <Text style={styles.countdownHint}>
                {t(`${exp}.perform`, { movement: currentMovementLabel })}
              </Text>
            </View>
          )}

          {step === 'recording' && (
            <View style={[styles.recordingBox, withFeedback && isShaky && styles.recordingBoxShaky]}>
              <Ionicons name="radio-button-on" size={28} color={isShaky && withFeedback ? colors.danger : colors.danger} />
              <Text style={styles.recordingTitle}>
                {t(`${exp}.recording`, { seconds: recordRemaining })}
              </Text>
              <Text style={styles.recordingMovement}>{currentMovementLabel}</Text>
              <LiveVibrationMeter value={liveReading} isShaky={isShaky} withFeedback={withFeedback} />
            </View>
          )}

          {step === 'review' && lastResult && (
            <View style={styles.reviewBox}>
              <View style={styles.doneRow}>
                <Ionicons name="checkmark-circle" size={28} color={colors.secondary} />
                <Text style={styles.doneText}>{t(`${exp}.done`)}</Text>
              </View>
              <Text style={styles.resultText}>
                {t(`${exp}.avgVibration`, { value: lastResult.vibrationAvg })}
              </Text>
              {phase === 'baseline' && (
                <>
                  <Text style={styles.resultSubtext}>
                    {t(`${exp}.smoothness`, { value: lastResult.smoothness })}
                  </Text>
                  <Text style={styles.resultSubtext}>
                    {t(`${exp}.rangeOfMotion`, { value: lastResult.rangeOfMotion })}
                  </Text>
                </>
              )}

              {!disabled && (
                <View style={styles.actionRow}>
                  <Button
                    title={t(`${exp}.retry`)}
                    onPress={() => { setLastResult(null); setStep('prompt'); }}
                    variant="outlined"
                    size="lg"
                    style={styles.actionBtn}
                  />
                  <Button title={t('common.next')} onPress={handleNext} size="lg" style={styles.actionBtn} icon={<Ionicons name="arrow-forward" size={20} color={colors.white} />} />
                </View>
              )}
            </View>
          )}
        </>
      )}
    </Card>
  );
}

