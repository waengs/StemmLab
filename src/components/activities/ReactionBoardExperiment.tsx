import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, PanResponder, Dimensions, Alert } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import * as Haptics from 'expo-haptics';

interface ReactionBoardExperimentProps {
  onComplete: (data: { reactionTime: number; accuracy: number }) => void;
}

export function ReactionBoardExperiment({ onComplete }: ReactionBoardExperimentProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  
  // Phase 1 & 2 State
  const [tapStatus, setTapStatus] = useState<'idle' | 'waiting' | 'ready' | 'finished'>('idle');
  const [dominantTime, setDominantTime] = useState<number | null>(null);
  const [nonDominantTime, setNonDominantTime] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Phase 3 State
  const [tracingStatus, setTracingStatus] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [tracingAccuracy, setTracingAccuracy] = useState<number | null>(null);
  
  const targetAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scoreRef = useRef(0);
  const totalFramesRef = useRef(0);
  const touchPos = useRef({ x: 0, y: 0 }).current;
  const animListenerId = useRef<string | null>(null);

  const screenWidth = Dimensions.get('window').width - Spacing.xl * 2;
  const TRACK_SIZE = 200;
  const TARGET_SIZE = 40;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      targetAnim.removeAllListeners();
    };
  }, []);

  const startTapReaction = () => {
    setTapStatus('waiting');
    const delay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
    
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
      Alert.alert('Too Early!', 'Wait for the screen to turn green before tapping.');
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
    
    // Listen to animated value to compare with touch position
    animListenerId.current = targetAnim.addListener(({ x, y }) => {
      totalFramesRef.current += 1;
      const dx = x + TARGET_SIZE / 2 - touchPos.x;
      const dy = y + TARGET_SIZE / 2 - touchPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // If touch is within 50px of center, count as hit
      if (dist < 50) {
        scoreRef.current += 1;
      }
    });

    // Create a circular path
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

    // Stop after 6 seconds
    setTimeout(() => {
      Animated.timing(targetAnim).stop();
      targetAnim.removeAllListeners();
      const accuracy = totalFramesRef.current > 0 ? Math.round((scoreRef.current / totalFramesRef.current) * 100) : 0;
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
      touchPos.x = -1000; // Move far away to stop scoring
      touchPos.y = -1000;
    },
  });

  const handleFinishExperiment = () => {
    // We average dominant and non-dominant for the final result
    const avgReaction = Math.round(((dominantTime || 0) + (nonDominantTime || 0)) / 2);
    onComplete({
      reactionTime: avgReaction,
      accuracy: tracingAccuracy || 0,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.phaseIndicator}>
        <View style={[styles.dot, phase >= 1 && styles.dotActive]} />
        <View style={[styles.line, phase >= 2 && styles.lineActive]} />
        <View style={[styles.dot, phase >= 2 && styles.dotActive]} />
        <View style={[styles.line, phase >= 3 && styles.lineActive]} />
        <View style={[styles.dot, phase >= 3 && styles.dotActive]} />
      </View>
      <Text style={styles.phaseTitle}>
        {phase === 1 ? 'Phase 1: Dominant Hand' : phase === 2 ? 'Phase 2: Non-Dominant Hand' : 'Phase 3: Tracing Challenge'}
      </Text>

      {phase === 1 || phase === 2 ? (
        <View style={styles.gameContainer}>
          <Text style={styles.instructions}>
            {tapStatus === 'idle' && 'Tap the button below to begin. Wait for the screen to turn green, then tap as fast as you can!'}
            {tapStatus === 'waiting' && 'Wait for green...'}
            {tapStatus === 'ready' && 'TAP NOW!'}
            {tapStatus === 'finished' && `Reaction Time: ${phase === 1 ? dominantTime : nonDominantTime} ms`}
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
              <Button title="Start Test" onPress={startTapReaction} size="lg" />
            )}
            {tapStatus === 'finished' && (
              <Button 
                title={phase === 1 ? "Next Phase" : "Go to Tracing"} 
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
            {tracingStatus === 'idle' && 'Press "Start" and trace the moving circle with your finger for 6 seconds.'}
            {tracingStatus === 'playing' && 'Keep tracing!'}
            {tracingStatus === 'finished' && `Accuracy: ${tracingAccuracy}%`}
          </Text>

          {tracingStatus === 'idle' ? (
            <Button title="Start Tracing" onPress={startTracing} size="lg" />
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
              <Button title="Save Experiment Results" onPress={handleFinishExperiment} size="lg" />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
  line: {
    width: 40,
    height: 3,
    backgroundColor: Colors.border,
  },
  lineActive: {
    backgroundColor: Colors.primary,
  },
  phaseTitle: {
    ...Typography.h3,
    marginBottom: Spacing.lg,
    color: Colors.text,
  },
  gameContainer: {
    width: '100%',
    alignItems: 'center',
  },
  instructions: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    color: Colors.textSecondary,
    height: 48,
  },
  reactionBox: {
    width: 250,
    height: 250,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionBoxWaiting: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  reactionBoxReady: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  tracingArea: {
    width: 200,
    height: 200,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  target: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    position: 'absolute',
  },
  finishContainer: {
    marginTop: Spacing.xl,
  },
});
