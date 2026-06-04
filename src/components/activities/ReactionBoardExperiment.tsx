import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, PanResponder, Dimensions, Alert } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import * as Haptics from 'expo-haptics';

interface ReactionBoardExperimentProps {
  onComplete: (data: { reactionTime: number; accuracy: number }) => void;
}

export function ReactionBoardExperiment({ onComplete }: ReactionBoardExperimentProps) {
  const { t } = useTranslation();
  const exp = 'data.activities.reaction-board.experiment';

  const styles = useThemedStyles(({ colors, typography }) => ({
    container: { padding: Spacing.md, alignItems: 'center' },
    phaseIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
    dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
    dotActive: { backgroundColor: colors.primary },
    line: { width: 40, height: 3, backgroundColor: colors.border },
    lineActive: { backgroundColor: colors.primary },
    phaseTitle: { ...typography.h3, marginBottom: Spacing.lg, color: colors.text },
    gameContainer: { width: '100%', alignItems: 'center' },
    instructions: {
      ...typography.body,
      textAlign: 'center',
      marginBottom: Spacing.xl,
      color: colors.textSecondary,
      height: 48,
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

  const [phase, setPhase] = useState<1 | 2 | 3>(1);

  const [tapStatus, setTapStatus] = useState<'idle' | 'waiting' | 'ready' | 'finished'>('idle');
  const [dominantTime, setDominantTime] = useState<number | null>(null);
  const [nonDominantTime, setNonDominantTime] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const [tracingStatus, setTracingStatus] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [tracingAccuracy, setTracingAccuracy] = useState<number | null>(null);

  const targetAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scoreRef = useRef(0);
  const totalFramesRef = useRef(0);
  const touchPos = useRef({ x: 0, y: 0 }).current;
  const animListenerId = useRef<string | null>(null);

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
        : t(`${exp}.phase3Title`);

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

  const startTracing = () => {
    setTracingStatus('playing');
    scoreRef.current = 0;
    totalFramesRef.current = 0;

    animListenerId.current = targetAnim.addListener(({ x, y }) => {
      totalFramesRef.current += 1;
      const dx = x + TARGET_SIZE / 2 - touchPos.x;
      const dy = y + TARGET_SIZE / 2 - touchPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 50) {
        scoreRef.current += 1;
      }
    });

    Animated.loop(
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
      ])
    ).start();

    setTimeout(() => {
      Animated.timing(targetAnim).stop();
      targetAnim.removeAllListeners();
      const accuracy =
        totalFramesRef.current > 0
          ? Math.round((scoreRef.current / totalFramesRef.current) * 100)
          : 0;
      setTracingAccuracy(accuracy);
      setTracingStatus('finished');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 6000);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      touchPos.x = evt.nativeEvent.locationX;
      touchPos.y = evt.nativeEvent.locationY;
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
    onComplete({
      reactionTime: avgReaction,
      accuracy: tracingAccuracy || 0,
    });
  };

  const tapMs = phase === 1 ? dominantTime : nonDominantTime;

  return (
    <View style={styles.container}>
      <View style={styles.phaseIndicator}>
        <View style={[styles.dot, phase >= 1 && styles.dotActive]} />
        <View style={[styles.line, phase >= 2 && styles.lineActive]} />
        <View style={[styles.dot, phase >= 2 && styles.dotActive]} />
        <View style={[styles.line, phase >= 3 && styles.lineActive]} />
        <View style={[styles.dot, phase >= 3 && styles.dotActive]} />
      </View>
      <Text style={styles.phaseTitle}>{phaseTitle}</Text>

      {phase === 1 || phase === 2 ? (
        <View style={styles.gameContainer}>
          <Text style={styles.instructions}>
            {tapStatus === 'idle' && t(`${exp}.tapIdle`)}
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
              <Button
                title={phase === 1 ? t(`${exp}.nextPhase`) : t(`${exp}.goToTracing`)}
                onPress={() => {
                  setTapStatus('idle');
                  setPhase(phase === 1 ? 2 : 3);
                }}
              />
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.gameContainer}>
          <Text style={styles.instructions}>
            {tracingStatus === 'idle' && t(`${exp}.traceIdle`)}
            {tracingStatus === 'playing' && t(`${exp}.tracePlaying`)}
            {tracingStatus === 'finished' &&
              tracingAccuracy != null &&
              t(`${exp}.traceFinished`, { accuracy: tracingAccuracy })}
          </Text>

          {tracingStatus === 'idle' ? (
            <Button title={t(`${exp}.startTracing`)} onPress={startTracing} size="lg" />
          ) : tracingStatus === 'playing' ? (
            <View style={styles.tracingArea} {...panResponder.panHandlers}>
              <Animated.View
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
                title={t(`${exp}.saveResults`)}
                onPress={handleFinishExperiment}
                size="lg"
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
