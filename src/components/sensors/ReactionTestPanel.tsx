import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';

type TapStatus = 'idle' | 'waiting' | 'ready' | 'finished';

interface ReactionTestPanelProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onResultReady: (value: string) => void;
  onSave: () => void;
}

export function ReactionTestPanel({ notes, onNotesChange, onResultReady, onSave }: ReactionTestPanelProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<1 | 2>(1);
  const [tapStatus, setTapStatus] = useState<TapStatus>('idle');
  const [dominantMs, setDominantMs] = useState<number | null>(null);
  const [nonDominantMs, setNonDominantMs] = useState<number | null>(null);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startTest = () => {
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
      Alert.alert(
        t('sensors.reactionTooEarlyTitle', { defaultValue: 'Too early!' }),
        t('sensors.reactionTooEarlyMsg', {
          defaultValue: 'Wait for the screen to turn green before tapping.',
        })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    if (tapStatus === 'ready') {
      const ms = Date.now() - startTimeRef.current;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (phase === 1) {
        setDominantMs(ms);
        setTapStatus('idle');
        setPhase(2);
      } else {
        setNonDominantMs(ms);
        setTapStatus('finished');
        
        // Calculate average and send result
        const dom = dominantMs || ms;
        const avg = Math.round((dom + ms) / 2);
        const summary = `Dominant: ${dom}ms | Non-Dominant: ${ms}ms\nAverage Reaction: ${avg}ms`;
        onResultReady(summary);
      }
    }
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase(1);
    setTapStatus('idle');
    setDominantMs(null);
    setNonDominantMs(null);
    onResultReady('');
  };

  return (
    <View>
      <Text style={styles.instructions}>
        {tapStatus === 'idle' && phase === 1 && 'Phase 1: Dominant Hand. Tap Start, wait for green, and tap as fast as you can!'}
        {tapStatus === 'idle' && phase === 2 && 'Phase 2: Non-Dominant Hand. Tap Start and repeat the test!'}
        {tapStatus === 'waiting' && 'Wait for green…'}
        {tapStatus === 'ready' && 'TAP NOW!'}
        {tapStatus === 'finished' && `Dominant: ${dominantMs}ms | Non-Dominant: ${nonDominantMs}ms\nAverage: ${Math.round(((dominantMs || 0) + (nonDominantMs || 0)) / 2)}ms`}
      </Text>

      <Pressable
        style={[
          styles.reactionBox,
          tapStatus === 'waiting' && styles.reactionBoxWaiting,
          tapStatus === 'ready' && styles.reactionBoxReady,
        ]}
        onPress={tapStatus === 'waiting' || tapStatus === 'ready' ? handleTap : undefined}
      >
        {tapStatus === 'idle' && (
          <Button
            title={phase === 1 ? "Start Dominant Hand" : "Start Non-Dominant Hand"}
            onPress={startTest}
            size="lg"
          />
        )}
        {tapStatus === 'finished' && (
          <Button
            title="Try again"
            onPress={reset}
            size="lg"
            variant="outlined"
          />
        )}
      </Pressable>

      {tapStatus === 'finished' && (
        <>
          <Input
            label={t('common.notes')}
            value={notes}
            onChangeText={onNotesChange}
            multiline
            numberOfLines={2}
            placeholder={t('sensors.notesPlaceholder')}
            containerStyle={{ marginTop: Spacing.lg }}
          />
          <View style={{ marginTop: Spacing.md }}>
            <Button title={t('sensors.saveLog')} onPress={onSave} size="lg" fullWidth />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  instructions: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    color: Colors.textSecondary,
    minHeight: 48,
  },
  reactionBox: {
    width: '100%',
    minHeight: 220,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  reactionBoxWaiting: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  reactionBoxReady: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
});
