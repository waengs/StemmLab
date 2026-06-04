import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius } from '../../theme';
import { useSoundMeter } from '../../hooks/useSoundMeter';

interface SoundMeterPanelProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onResultReady: (value: string) => void;
  onSave: () => void;
}

export function SoundMeterPanel({ notes, onNotesChange, onResultReady, onSave }: SoundMeterPanelProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const { isRecording, decibels, permissionGranted, startMetering, stopMetering } = useSoundMeter();
  const [maxDb, setMaxDb] = useState(0);
  const [hasCaptured, setHasCaptured] = useState(false);

  useEffect(() => {
    if (isRecording && decibels > maxDb) {
      setMaxDb(decibels);
    }
  }, [decibels, isRecording]);

  const handleStart = async () => {
    setMaxDb(0);
    setHasCaptured(false);
    onResultReady('');
    await startMetering();
  };

  const handleCapture = async () => {
    await stopMetering();
    setHasCaptured(true);
    onResultReady(`${maxDb.toFixed(1)} dB`);
  };

  const getMeterColor = (db: number) => {
    if (db < 70) return '#4ade80';
    if (db < 85) return '#facc15';
    return '#f87171';
  };

  const currentDbStr = decibels.toFixed(1);
  const meterColor = getMeterColor(decibels);

  return (
    <View style={styles.container}>
      {!permissionGranted ? (
        <Button
          title={t('sensors.soundGrantMic')}
          onPress={startMetering}
        />
      ) : (
        <>
          <View style={[styles.meterContainer, { borderColor: meterColor }]}>
            <Text style={[styles.dbValue, { color: meterColor }]}>
              {hasCaptured ? maxDb.toFixed(1) : currentDbStr} <Text style={styles.dbLabel}>dB</Text>
            </Text>
            <Text style={styles.meterStatus}>
              {hasCaptured
                ? t('sensors.soundCapturedPeak')
                : isRecording
                  ? t('sensors.soundMeasuringLive')
                  : t('sensors.soundReady')}
            </Text>
            
            {/* Simple visual bar */}
            {!hasCaptured && (
              <View style={styles.barBackground}>
                <View style={[
                  styles.barFill, 
                  { 
                    width: `${Math.min(100, (decibels / 120) * 100)}%`,
                    backgroundColor: meterColor 
                  }
                ]} />
              </View>
            )}
          </View>

          {!isRecording && !hasCaptured && (
            <Button
              title={t('sensors.soundStartMeasuring')}
              onPress={handleStart}
              icon={<Ionicons name="mic" size={20} color={colors.white} />}
            />
          )}

          {isRecording && (
            <Button
              title={t('sensors.soundStopCapture')}
              onPress={handleCapture}
              variant="outlined"
              icon={<Ionicons name="stop" size={20} color={colors.primary} />}
            />
          )}

          {hasCaptured && (
            <View style={styles.saveSection}>
              <Button
                title={t('sensors.soundMeasureAgain')}
                onPress={handleStart}
                variant="outlined"
                style={{ marginBottom: Spacing.md }}
              />
              <Input
                label={t('sensors.notesLabel', { defaultValue: 'Notes (optional)' })}
                placeholder={t('sensors.notesPlaceholder', { defaultValue: 'What did you measure?' })}
                value={notes}
                onChangeText={onNotesChange}
                multiline
              />
              <Button title={t('common.save', { defaultValue: 'Save Measurement' })} onPress={onSave} />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  meterContainer: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dbValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  dbLabel: {
    fontSize: 24,
    fontWeight: 'normal',
  },
  meterStatus: {
    fontSize: 16,
    color: '#666',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  barBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  saveSection: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  }
});
