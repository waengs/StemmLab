import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Switch, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import { recordMotion, isMotionSensorAvailable, type MotionRecordingResult } from '../../utils/motionSensors';
import {
  playCountdownBeep,
  playStartBeep,
  playFinishDone,
  playShakyAlert,
  sleep,
  PRE_COUNTDOWN_SEC,
  DEFAULT_RECORD_SEC,
  MIN_RECORD_SEC,
  MAX_RECORD_SEC,
} from '../../utils/recordingSounds';

interface VibrationSensorPanelProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onResultReady: (summary: string) => void;
  onSave: () => void;
}

function LiveMeter({ value, isShaky, feedbackOn }: { value: string | null; isShaky: boolean; feedbackOn: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const meterStyles = useThemedStyles(({ colors: c, typography }) => ({
    wrap: { width: '100%', marginTop: Spacing.md },
    label: { ...typography.bodySmall, fontWeight: '600', marginBottom: Spacing.xs, textAlign: 'center' },
    track: { height: 10, backgroundColor: c.border, borderRadius: BorderRadius.full, overflow: 'hidden' },
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
    alertText: { ...typography.caption, color: c.danger, fontWeight: '700' },
  }));

  if (value === null) return null;
  const fill = Math.min(100, (parseFloat(value) / 15) * 100);
  const barColor = isShaky ? colors.danger : colors.secondary;

  return (
    <View style={meterStyles.wrap}>
      <Text style={meterStyles.label}>{t('sensors.vibrationLiveMeter', { value })}</Text>
      <View style={meterStyles.track}>
        <View style={[meterStyles.fill, { width: `${fill}%`, backgroundColor: barColor }]} />
      </View>
      {feedbackOn && isShaky && (
        <View style={meterStyles.alertBox}>
          <Ionicons name="warning" size={18} color={colors.danger} />
          <Text style={meterStyles.alertText}>{t('sensors.vibrationTooShaky')}</Text>
        </View>
      )}
    </View>
  );
}

export function VibrationSensorPanel({ notes, onNotesChange, onResultReady, onSave }: VibrationSensorPanelProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [recordDurationSec, setRecordDurationSec] = useState(DEFAULT_RECORD_SEC);
  const [feedbackOn, setFeedbackOn] = useState(false);
  const [step, setStep] = useState<'idle' | 'countdown' | 'recording' | 'done'>('idle');
  const [countdown, setCountdown] = useState(0);
  const [recordRemaining, setRecordRemaining] = useState(0);
  const [liveReading, setLiveReading] = useState<string | null>(null);
  const [isShaky, setIsShaky] = useState(false);
  const [result, setResult] = useState<MotionRecordingResult | null>(null);

  const styles = useThemedStyles(({ colors: c, typography }) => ({
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.lg,
      padding: Spacing.md,
      backgroundColor: c.background,
      borderRadius: BorderRadius.md,
    },
    toggleText: { flex: 1, paddingRight: Spacing.md },
    toggleLabel: { ...typography.label, marginBottom: 2 },
    toggleHint: { ...typography.caption, color: c.textSecondary },
    durationBlock: {
      marginBottom: Spacing.lg,
      padding: Spacing.md,
      backgroundColor: c.background,
      borderRadius: BorderRadius.md,
    },
    durationLabel: { ...typography.label, marginBottom: Spacing.sm },
    durationValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.lg,
      marginBottom: Spacing.xs,
    },
    durationStepBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    durationValue: { ...typography.h3, minWidth: 72, textAlign: 'center' },
    durationSlider: { width: '100%', height: 40 },
    durationRange: { ...typography.caption, color: c.textMuted, textAlign: 'center' },
    hint: { ...typography.bodySmall, color: c.textSecondary, marginBottom: Spacing.lg, lineHeight: 20 },
    countdownBox: { alignItems: 'center', paddingVertical: Spacing.xxxl },
    countdownLabel: { ...typography.body, color: c.textSecondary },
    countdownNumber: { fontSize: 64, fontWeight: '800', color: c.primary, marginTop: Spacing.sm },
    recordingBox: {
      alignItems: 'center',
      padding: Spacing.xl,
      backgroundColor: c.danger + '10',
      borderRadius: BorderRadius.md,
      borderWidth: 2,
      borderColor: c.danger + '40',
    },
    recordingShaky: { backgroundColor: c.danger + '25', borderColor: c.danger },
    recordingTitle: { ...typography.h3, color: c.danger, marginTop: Spacing.sm },
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
    resultSub: { ...typography.bodySmall, color: c.textSecondary },
  }));

  const stopRef = useRef<(() => void) | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => () => {
    cancelledRef.current = true;
    stopRef.current?.();
  }, []);

  const formatSummary = (r: MotionRecordingResult, feedback: boolean) => {
    const state = feedback ? t('sensors.vibrationFeedbackOn') : t('sensors.vibrationFeedbackOff');
    return `${t('sensors.vibrationAvg', { value: r.vibrationAvg })} | ${t('sensors.vibrationSmoothness', { value: r.smoothness })} | ${t('sensors.vibrationRom', { value: r.rangeOfMotion })} | ${r.movementTime}s | ${t('sensors.vibrationFeedbackState', { state })}`;
  };

  const runRecording = async () => {
    const available = await isMotionSensorAvailable();
    if (!available) {
      Alert.alert(
        t('sensors.vibrationSensorUnavailableTitle'),
        t('sensors.vibrationSensorUnavailableMsg')
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
    setRecordRemaining(recordDurationSec);

    try {
      const session = await recordMotion(
        recordDurationSec,
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
      Alert.alert(
        t('activities.recordingFailedTitle', { defaultValue: 'Recording failed' }),
        t('activities.recordingFailedMsg', {
          defaultValue: 'Could not read from the sensor. Try again on a physical device.',
        })
      );
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
            <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
            <Text style={styles.doneText}>{t('sensors.vibrationDone')}</Text>
          </View>
          <Text style={styles.resultLine}>{t('sensors.vibrationAvg', { value: result.vibrationAvg })}</Text>
          <Text style={styles.resultSub}>{t('sensors.vibrationSmoothness', { value: result.smoothness })}</Text>
          <Text style={styles.resultSub}>{t('sensors.vibrationRom', { value: result.rangeOfMotion })}</Text>
          <Text style={styles.resultSub}>
            {t('sensors.vibrationFeedbackState', {
              state: feedbackOn ? t('sensors.vibrationFeedbackOn') : t('sensors.vibrationFeedbackOff'),
            })}
          </Text>
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
          icon={<Ionicons name="save" size={18} color={colors.white} />}
        />
        <Button title={t('activities.recordAgain')} onPress={handleRetry} variant="outlined" size="sm" style={{ marginTop: Spacing.sm }} />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleLabel}>{t('sensors.vibrationLiveFeedback')}</Text>
          <Text style={styles.toggleHint}>
            {feedbackOn ? t('sensors.vibrationFeedbackOnHint') : t('sensors.vibrationFeedbackOffHint')}
          </Text>
        </View>
        <Switch
          value={feedbackOn}
          onValueChange={setFeedbackOn}
          disabled={step === 'countdown' || step === 'recording'}
          trackColor={{ false: colors.border, true: colors.primary + '80' }}
          thumbColor={feedbackOn ? colors.primary : colors.textSecondary}
        />
      </View>

      {step === 'idle' && (
        <>
          <View style={styles.durationBlock}>
            <Text style={styles.durationLabel}>
              {t('sensors.vibrationDurationLabel', { defaultValue: 'Recording length' })}
            </Text>
            <View style={styles.durationValueRow}>
              <Pressable
                onPress={() => setRecordDurationSec((s) => Math.max(MIN_RECORD_SEC, s - 1))}
                style={styles.durationStepBtn}
                hitSlop={8}
              >
                <Ionicons name="remove" size={22} color={colors.primary} />
              </Pressable>
              <Text style={styles.durationValue}>
                {t('sensors.vibrationDurationSeconds', {
                  defaultValue: '{{count}} sec',
                  count: recordDurationSec,
                })}
              </Text>
              <Pressable
                onPress={() => setRecordDurationSec((s) => Math.min(MAX_RECORD_SEC, s + 1))}
                style={styles.durationStepBtn}
                hitSlop={8}
              >
                <Ionicons name="add" size={22} color={colors.primary} />
              </Pressable>
            </View>
            <Slider
              style={styles.durationSlider}
              minimumValue={MIN_RECORD_SEC}
              maximumValue={MAX_RECORD_SEC}
              step={1}
              value={recordDurationSec}
              onValueChange={(v) => setRecordDurationSec(Math.round(v))}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primaryDark}
            />
            <Text style={styles.durationRange}>
              {MIN_RECORD_SEC}–{MAX_RECORD_SEC} {t('sensors.vibrationDurationUnit', { defaultValue: 'sec' })}
            </Text>
          </View>
          <Text style={styles.hint}>
            {t('sensors.vibrationIdleHint', {
              defaultValue:
                'Hold the phone and tap Start. Countdown 3-2-1, then {{seconds}} seconds of recording. Done plays when finished.',
              seconds: recordDurationSec,
            })}
          </Text>
          <Button
            title={t('sensors.startMeasurement')}
            onPress={runRecording}
            size="lg"
            fullWidth
            icon={<Ionicons name="play" size={18} color={colors.white} />}
          />
        </>
      )}

      {step === 'countdown' && (
        <View style={styles.countdownBox}>
          <Text style={styles.countdownLabel}>{t('sensors.vibrationGetReady')}</Text>
          <Text style={styles.countdownNumber}>{countdown}</Text>
        </View>
      )}

      {step === 'recording' && (
        <View style={[styles.recordingBox, feedbackOn && isShaky && styles.recordingShaky]}>
          <Ionicons name="radio-button-on" size={24} color={colors.danger} />
          <Text style={styles.recordingTitle}>
            {t('sensors.vibrationRecording', { seconds: recordRemaining })}
          </Text>
          <LiveMeter value={liveReading} isShaky={isShaky} feedbackOn={feedbackOn} />
        </View>
      )}
    </View>
  );
}
