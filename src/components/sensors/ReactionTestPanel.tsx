import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';

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

  const styles = useThemedStyles(({ colors, typography }) => ({
    instructions: {
      ...typography.body,
      textAlign: 'center',
      marginBottom: Spacing.lg,
      color: colors.textSecondary,
      minHeight: 48,
    },
    reactionBox: {
      width: '100%',
      minHeight: 220,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    reactionBoxWaiting: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
    },
    reactionBoxReady: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
    },
  }));

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
      Alert.alert(t('sensors.reactionTooEarlyTitle'), t('sensors.reactionTooEarlyMsg'));
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

        const dom = dominantMs || ms;
        const avg = Math.round((dom + ms) / 2);
        onResultReady(
          t('sensors.reactionFinishedSummary', { dom, non: ms, avg })
        );
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

  const instructionText = (() => {
    if (tapStatus === 'idle' && phase === 1) return t('sensors.reactionPhase1Hint');
    if (tapStatus === 'idle' && phase === 2) return t('sensors.reactionPhase2Hint');
    if (tapStatus === 'waiting') return t('sensors.reactionWaitHint');
    if (tapStatus === 'ready') return t('sensors.reactionGoHint');
    if (tapStatus === 'finished') {
      const avg = Math.round(((dominantMs || 0) + (nonDominantMs || 0)) / 2);
      return t('sensors.reactionFinishedSummary', {
        dom: dominantMs ?? 0,
        non: nonDominantMs ?? 0,
        avg,
      });
    }
    return '';
  })();

  return (
    <View>
      <Text style={styles.instructions}>{instructionText}</Text>

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
            title={phase === 1 ? t('sensors.reactionStartDominant') : t('sensors.reactionStartNonDominant')}
            onPress={startTest}
            size="lg"
          />
        )}
        {tapStatus === 'finished' && (
          <Button title={t('sensors.reactionTryAgain')} onPress={reset} size="lg" variant="outlined" />
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
