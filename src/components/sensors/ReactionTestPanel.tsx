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
  const [tapStatus, setTapStatus] = useState<TapStatus>('idle');
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startTest = () => {
    setReactionMs(null);
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
      setReactionMs(ms);
      setTapStatus('finished');
      const summary = t('sensors.reactionResult', { defaultValue: '{{ms}} ms', ms });
      onResultReady(summary);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTapStatus('idle');
    setReactionMs(null);
    onResultReady('');
  };

  return (
    <View>
      <Text style={styles.instructions}>
        {tapStatus === 'idle' &&
          t('sensors.reactionIdleHint', {
            defaultValue: 'Tap Start, then wait for green and tap as fast as you can.',
          })}
        {tapStatus === 'waiting' &&
          t('sensors.reactionWaitHint', { defaultValue: 'Wait for green…' })}
        {tapStatus === 'ready' && t('sensors.reactionGoHint', { defaultValue: 'TAP NOW!' })}
        {tapStatus === 'finished' &&
          t('sensors.reactionDoneHint', {
            defaultValue: 'Reaction time: {{ms}} ms',
            ms: reactionMs ?? 0,
          })}
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
            title={t('sensors.startMeasurement')}
            onPress={startTest}
            size="lg"
          />
        )}
        {tapStatus === 'finished' && (
          <Button
            title={t('sensors.reactionTryAgain', { defaultValue: 'Try again' })}
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
