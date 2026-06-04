import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Battery from 'expo-battery';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import { formatBatteryLogData, type BatteryLogReading } from '../../utils/batteryLog';

interface BatterySensorPanelProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onResultReady: (summary: string) => void;
  onSave: () => void;
}

function toReading(level: number, state: Battery.BatteryState): BatteryLogReading {
  const charging =
    state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL;
  return {
    levelPercent: Math.round(level * 100),
    isCharging: charging,
  };
}

export function BatterySensorPanel({
  notes,
  onNotesChange,
  onResultReady,
  onSave,
}: BatterySensorPanelProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [level, setLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<Battery.BatteryState | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const styles = useThemedStyles(({ colors: c, typography }) => ({
    measurement: {
      backgroundColor: c.primary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xxl,
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    pct: { fontSize: 42, fontWeight: '800', color: c.white },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginTop: Spacing.sm,
    },
    statusText: { ...typography.body, color: c.white, fontWeight: '600' },
    hint: { ...typography.caption, color: c.textMuted, marginBottom: Spacing.lg, textAlign: 'center' },
    warn: { ...typography.body, color: c.danger, marginBottom: Spacing.lg, textAlign: 'center' },
  }));

  const refresh = useCallback(async () => {
    if (Platform.OS === 'web') {
      setUnavailable(true);
      return;
    }
    try {
      const [lvl, state] = await Promise.all([
        Battery.getBatteryLevelAsync(),
        Battery.getBatteryStateAsync(),
      ]);
      setLevel(lvl);
      setBatteryState(state);
      setUnavailable(false);
      onResultReady(formatBatteryLogData(toReading(lvl, state)));
    } catch {
      setUnavailable(true);
    }
  }, [onResultReady]);

  useEffect(() => {
    void refresh();
    if (Platform.OS === 'web') return;

    const levelSub = Battery.addBatteryLevelListener(() => void refresh());
    const stateSub = Battery.addBatteryStateListener(() => void refresh());

    return () => {
      levelSub.remove();
      stateSub.remove();
    };
  }, [refresh]);

  const pct = level != null ? Math.round(level * 100) : null;
  const isCharging =
    batteryState === Battery.BatteryState.CHARGING ||
    batteryState === Battery.BatteryState.FULL;

  if (unavailable) {
    return (
      <Text style={styles.warn}>
        {t('sensors.battery.unavailable', {
          defaultValue: 'Battery level is not available on this device.',
        })}
      </Text>
    );
  }

  return (
    <View>
      <View style={styles.measurement}>
        <Text style={styles.pct}>{pct != null ? `${pct}%` : '—'}</Text>
        <View style={styles.statusRow}>
          <Ionicons
            name={isCharging ? 'flash' : 'battery-half'}
            size={20}
            color={colors.white}
          />
          <Text style={styles.statusText}>
            {isCharging
              ? t('sensors.battery.charging', { defaultValue: 'Charging' })
              : t('sensors.battery.notCharging', { defaultValue: 'Not charging' })}
          </Text>
        </View>
      </View>
      <Text style={styles.hint}>
        {t('sensors.battery.liveHint', {
          defaultValue: 'Reading updates live from your device battery.',
        })}
      </Text>
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
        icon={<Ionicons name="save" size={18} color={colors.white} />}
      />
    </View>
  );
}
