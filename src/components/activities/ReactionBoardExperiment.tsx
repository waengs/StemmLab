import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, PanResponder, Alert } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius } from '../../theme';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import * as Haptics from 'expo-haptics';

interface ReactionBoardExperimentProps {
  onComplete: (data: { reactionTime: number; accuracy: number }) => void;
}

type Phase = 1 | 2 | 3 | 4;

export function ReactionBoardExperiment({ onComplete }: ReactionBoardExperimentProps) {
  const { t } = useTranslation();
  const exp = 'data.activities.reaction-board.experiment';
  const { colors } = useTheme();

  const styles = useThemedStyles(({ colors, typography }) => ({
    container: { padding: Spacing.md, alignItems: 'center' },
    phaseIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
    dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
    dotActive: { backgroundColor: colors.primary },
    line: { width: 28, height: 3, backgroundColor: colors.border },
    lineActive: { backgroundColor: colors.primary },
    phaseTitle: { ...typography.h3, marginBottom: Spacing.lg, color: colors.text, textAlign: 'center' },
    gameContainer: { width: '100%', alignItems: 'center' },
    instructions: {
      ...typography.body,
      textAlign: 'center',
      marginBottom: Spacing.xl,
      color: colors.textSecondary,
      minHeight: 48,
    },
    reactionBox: {
      width: 250,
      height: 250,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reactionBoxWaiting: { backgroundColor: colors.danger, borderColor: colors.danger },
    reactionBoxReady: { backgroundColor: colors.secondary, borderColor: colors.secondary },
    tracingArea: {
      width: 200,
      height: 200,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      overflow: 'hidden',
    },
    target: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      position: 'absolute',
    },
    finishContainer: { marginTop: Spacing.xl },
  }));

  const [phase, setPhase] = useState<Phase>(1);

  const [tapStatus, setTapStatus] = useState<'idle' | 'waiting' | 'ready' | 'finished'>('idle');
  const [dominantTime, setDominantTime] = useState<number | null>(null);
  const [nonDominantTime, setNonDominantTime] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  const [tracingStatus, setTracingStatus] = useState<'idle' | 'waiting' | 'playing' | 'finished'>('idle');
  const [tracingAccuracy, setTracingAccuracy] = useState<number | null>(null);
  const [dominantTracingAccuracy, setDominantTracingAccuracy] = useState<number | null>(null);
  const [nonDominantTracingAccuracy, setNonDominantTracingAccuracy] = useState<number | null>(null);

  const targetAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scoreRef = useRef(0);
  const totalFramesRef = useRef(0);
  const touchPos = useRef({ x: 0, y: 0 }).current;

  const TRACK_SIZE = 200;
  const TARGET_SIZE = 40;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      targetAnim.removeAllListeners();
    };
  }, [targetAnim]);

  const phaseTitle =
    phase === 1
      ? t(`${exp}.phase1Title`)
      : phase === 2
        ? t(`${exp}.phase2Title`)
        : phase === 3
          ? t(`${exp}.phase3Title`)
          : t(`${exp}.phase4Title`);

  const startTapReaction = () => {
    setTapStatus('waiting');
    const delay = Math.floor(Math.random() * 3000) + 2000;

    timerRef.current = setTimeout(() => {
      setTapStatus('ready');
      startTimeRef.current = Date.now();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, delay);
  };

  const handleTap = () => {
    if (tapStatus === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setTapStatus('idle');
      Alert.alert(t(`${exp}.tooEarlyTitle`), t(`${exp}.tooEarlyMsg`));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (tapStatus === 'ready') {
      const rt = Date.now() - startTimeRef.current;
      setTapStatus('finished');
      if (phase === 1) {
        setDominantTime(rt);
      } else {
        setNonDominantTime(rt);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const resetTracing = () => {
    targetAnim.stopAnimation();
    targetAnim.removeAllListeners();
    targetAnim.setValue({ x: 0, y: 0 });
    setTracingStatus('idle');
    setTracingAccuracy(null);
  };

  const startTracing = () => {
    setTracingStatus('waiting');
    scoreRef.current = 0;
    totalFramesRef.current = 0;
  };

  const tracingStatusRef = useRef(tracingStatus);
  tracingStatusRef.current = tracingStatus;

  const beginAnimation = () => {
    setTracingStatus('playing');

    targetAnim.addListener(({ x, y }) => {
      totalFramesRef.current += 1;
      const dx = x + TARGET_SIZE / 2 - touchPos.x;
      const dy = y + TARGET_SIZE / 2 - touchPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 20) {
        scoreRef.current += 1;
      } else if (dist <= 70) {
        // partial score if close
        scoreRef.current += (70 - dist) / 50;
      }
    });

    Animated.sequence([
      Animated.timing(targetAnim, {
        toValue: { x: TRACK_SIZE - TARGET_SIZE, y: 0 },
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(targetAnim, {
        toValue: { x: TRACK_SIZE - TARGET_SIZE, y: TRACK_SIZE - TARGET_SIZE },
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(targetAnim, {
        toValue: { x: 0, y: TRACK_SIZE - TARGET_SIZE },
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(targetAnim, {
        toValue: { x: 0, y: 0 },
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start(() => {
      targetAnim.removeAllListeners();
      const accuracy =
        totalFramesRef.current > 0
          ? Math.round((scoreRef.current / totalFramesRef.current) * 100)
          : 0;
      setTracingAccuracy(accuracy);
      if (phase === 3) {
        setDominantTracingAccuracy(accuracy);
      } else {
        setNonDominantTracingAccuracy(accuracy);
      }
      setTracingStatus('finished');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      touchPos.x = evt.nativeEvent.locationX;
      touchPos.y = evt.nativeEvent.locationY;
      if (tracingStatusRef.current === 'waiting') {
        const dx = touchPos.x - TARGET_SIZE / 2;
        const dy = touchPos.y - TARGET_SIZE / 2;
        if (Math.sqrt(dx * dx + dy * dy) <= TARGET_SIZE) {
          beginAnimation();
        }
      }
    },
    onPanResponderMove: (evt) => {
      touchPos.x = evt.nativeEvent.locationX;
      touchPos.y = evt.nativeEvent.locationY;
    },
    onPanResponderRelease: () => {
      touchPos.x = -1000;
      touchPos.y = -1000;
    },
  });

  const handleFinishExperiment = () => {
    const avgReaction = Math.round(((dominantTime || 0) + (nonDominantTime || 0)) / 2);
    const avgAccuracy = Math.round(
      ((dominantTracingAccuracy || 0) + (nonDominantTracingAccuracy || 0)) / 2
    );
    onComplete({
      reactionTime: avgReaction,
      accuracy: avgAccuracy,
    });
  };

  const advanceFromTap = () => {
    setTapStatus('idle');
    setPhase(phase === 1 ? 2 : 3);
  };

  const advanceFromTracing = () => {
    resetTracing();
    setPhase(4);
  };

  const tapMs = phase === 1 ? dominantTime : nonDominantTime;
  const isTapPhase = phase === 1 || phase === 2;

  const tapIdleHint =
    phase === 1 ? t(`${exp}.tapIdle`) : t(`${exp}.tapIdleNonDominant`);

  const traceIdleHint =
    phase === 3 ? t(`${exp}.traceIdleDominant`) : t(`${exp}.traceIdleNonDominant`);

  return (
    <View style={styles.container}>
      <View style={styles.phaseIndicator}>
        {[1, 2, 3, 4].map((step, index) => (
          <React.Fragment key={step}>
            {index > 0 && <View style={[styles.line, phase >= step && styles.lineActive]} />}
            <View style={[styles.dot, phase >= step && styles.dotActive]} />
          </React.Fragment>
        ))}
      </View>
      <Text style={styles.phaseTitle}>{phaseTitle}</Text>

      {isTapPhase ? (
        <View style={styles.gameContainer}>
          <Text style={styles.instructions}>
            {tapStatus === 'idle' && tapIdleHint}
            {tapStatus === 'waiting' && t(`${exp}.tapWaiting`)}
            {tapStatus === 'ready' && t(`${exp}.tapReady`)}
            {tapStatus === 'finished' && tapMs != null && t(`${exp}.tapFinished`, { ms: tapMs })}
          </Text>

          <Pressable
            style={[
              styles.reactionBox,
              tapStatus === 'waiting' && styles.reactionBoxWaiting,
              tapStatus === 'ready' && styles.reactionBoxReady,
            ]}
            onPress={tapStatus === 'idle' || tapStatus === 'finished' ? undefined : handleTap}
          >
            {tapStatus === 'idle' && (
              <Button title={t(`${exp}.startTest`)} onPress={startTapReaction} size="lg" />
            )}
            {tapStatus === 'finished' && (
              <Button title={t(`${exp}.nextPhase`)} onPress={advanceFromTap} />
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.gameContainer}>
          <Text style={styles.instructions}>
            {tracingStatus === 'idle' && traceIdleHint}
            {tracingStatus === 'playing' && t(`${exp}.tracePlaying`)}
            {tracingStatus === 'finished' &&
              tracingAccuracy != null &&
              t(`${exp}.traceFinished`, { accuracy: tracingAccuracy })}
          </Text>

          {tracingStatus === 'idle' ? (
            <Button title={t(`${exp}.startTracing`)} onPress={startTracing} size="lg" />
          ) : (tracingStatus === 'playing' || tracingStatus === 'waiting') ? (
            <View style={styles.tracingArea} {...panResponder.panHandlers}>
              {tracingStatus === 'waiting' && (
                <Text style={{ position: 'absolute', top: 80, width: '100%', textAlign: 'center', color: colors.textSecondary }}>
                  {t(`${exp}.touchToStart`, { defaultValue: 'Touch the circle to start' })}
                </Text>
              )}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.target,
                  {
                    transform: [{ translateX: targetAnim.x }, { translateY: targetAnim.y }],
                  },
                ]}
              />
            </View>
          ) : (
            <View style={styles.finishContainer}>
              <Button
                title={phase === 3 ? t(`${exp}.nextPhase`) : t(`${exp}.saveResults`)}
                onPress={phase === 3 ? advanceFromTracing : handleFinishExperiment}
                size="lg"
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
