import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useSensorStore } from '../../stores/sensorStore';
import { useTheme } from '../../context/ThemeContext';
import { filterSensorLogsBySearch } from '../../utils/sensorLogSearch';
import { getSensorChipLabel } from '../../utils/sensorChip';
import { parseSlowMoLogData, parseVibrationLogData } from '../../utils/slowMoLog';
import { EmptyState } from '../layout/EmptyState';
import { Spacing } from '../../theme';
import type { SensorLog } from '../../types';
import { TrialVideoPlayer } from './TrialVideoPlayer';

interface SensorLogListProps {
  logs: SensorLog[];
  searchQuery?: string;
  /** Section title; defaults to sensors.recentLogs */
  title?: string;
  /** When true, show an empty state instead of rendering nothing */
  showWhenEmpty?: boolean;
  emptyMessage?: string;
  onShareToForum?: (log: SensorLog) => void;
}

function LogNotes({ text, label, styles }: { text: string; label: string; styles: ReturnType<typeof createStyles> }) {
  if (!text.trim()) return null;
  return (
    <View style={styles.notesBlock}>
      <Text style={styles.notesLabel}>{label}</Text>
      <Text style={styles.notesText}>{text}</Text>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors'], typography: ReturnType<typeof useTheme>['typography']) {
  return StyleSheet.create({
    section: { marginTop: Spacing.xl },
    title: { ...typography.h3, marginBottom: Spacing.md },
    logCard: { marginBottom: Spacing.md, padding: Spacing.md },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    headerLeft: { flex: 1, gap: Spacing.xs },
    logSensorName: { ...typography.label, color: colors.text },
    logChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      flexShrink: 0,
    },
    date: { ...typography.caption, color: colors.textMuted, maxWidth: 120, textAlign: 'right' },
    body: { width: '100%' },
    empty: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    actionBtn: {
      padding: Spacing.xs,
    },
    editContainer: {
      marginTop: Spacing.sm,
    },
    editActions: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginTop: Spacing.sm,
      justifyContent: 'flex-end',
    },
    videoWrap: { width: '100%', marginTop: Spacing.xs },
    statsList: {
      gap: Spacing.xs,
      marginTop: Spacing.xs,
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    statText: { ...typography.bodySmall, color: colors.text, flex: 1 },
    plainData: { ...typography.bodySmall, color: colors.text, marginTop: Spacing.xs, lineHeight: 20 },
    notesBlock: {
      marginTop: Spacing.sm,
      padding: Spacing.sm,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    notesLabel: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '600',
      marginBottom: 2,
      textTransform: 'uppercase',
    },
    notesText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
    noVideoHint: {
      ...typography.caption,
      color: colors.textMuted,
      fontStyle: 'italic',
      marginTop: Spacing.xs,
    },
  });
}

export function SensorLogList({
  logs,
  searchQuery = '',
  title,
  showWhenEmpty = false,
  emptyMessage,
  onShareToForum,
}: SensorLogListProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  const updateLog = useSensorStore((s) => s.updateLog);
  const deleteLog = useSensorStore((s) => s.deleteLog);

  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const filteredLogs = useMemo(
    () => filterSensorLogsBySearch(logs, searchQuery, t),
    [logs, searchQuery, t]
  );

  const handleEdit = (log: SensorLog) => {
    setEditingLogId(log.id);
    setEditValue(String(log.data));
  };

  const handleSaveEdit = async (log: SensorLog) => {
    if (editValue.trim().length === 0) {
      Alert.alert('Error', 'Log cannot be empty.');
      return;
    }
    await updateLog({ ...log, data: editValue });
    setEditingLogId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setEditValue('');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Log', 'Are you sure you want to delete this sensor log?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLog(id) },
    ]);
  };

  const renderLogBody = (log: SensorLog) => {
    const data = String(log.data);

    if (log.sensorType === 'slow-mo') {
      const slowMo = parseSlowMoLogData(data);
      return (
        <>
          {slowMo.videoUrl ? (
            <View style={styles.videoWrap}>
              <TrialVideoPlayer videoUri={slowMo.videoUrl} compact />
            </View>
          ) : (
            <Text style={styles.noVideoHint}>
              {t('sensors.noVideoInLog', { defaultValue: 'No video saved with this log.' })}
            </Text>
          )}
          <LogNotes text={slowMo.notes} label={t('common.notes')} styles={styles} />
        </>
      );
    }

    if (log.sensorType === 'vibration') {
      const vibration = parseVibrationLogData(data);
      if (vibration.stats.length > 0) {
        return (
          <>
            <View style={styles.statsList}>
              {vibration.stats.map((stat) => (
                <View key={stat} style={styles.statRow}>
                  <Ionicons name="ellipse" size={6} color={colors.primary} />
                  <Text style={styles.statText}>{stat}</Text>
                </View>
              ))}
            </View>
            <LogNotes text={vibration.notes} label={t('common.notes')} styles={styles} />
          </>
        );
      }
    }

    return <Text style={styles.plainData}>{data}</Text>;
  };

  const sectionTitle = title ?? t('sensors.recentLogs');

  if (logs.length === 0) {
    if (!showWhenEmpty) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.title}>{sectionTitle}</Text>
        <EmptyState
          icon="book-outline"
          message={emptyMessage ?? t('sensors.logBook.empty')}
        />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{sectionTitle}</Text>
      {filteredLogs.length === 0 ? (
        <Text style={styles.empty}>{t('common.noSearchResults')}</Text>
      ) : (
        filteredLogs.map((log) => {
          const isEditing = editingLogId === log.id;

          return (
            <Card key={log.id} style={styles.logCard} variant="outlined">
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={styles.logSensorName}>
                    {t(`data.sensors.${log.sensorType}.name`, { defaultValue: log.sensorType })}
                  </Text>
                  <View style={styles.logChips}>
                    <Chip label={getSensorChipLabel(log.sensorType, t)} size="sm" />
                  </View>
                </View>
                <View style={styles.headerRight}>
                  <Text style={styles.date} numberOfLines={2}>
                    {new Date(log.timestamp).toLocaleString()}
                  </Text>
                  {!isEditing && (
                    <View style={styles.actions}>
                      {onShareToForum ? (
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => onShareToForum(log)}
                          accessibilityLabel={t('sensors.shareForum.button')}
                        >
                          <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(log)}>
                        <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(log.id)}>
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {isEditing ? (
                <View style={styles.editContainer}>
                  <Input value={editValue} onChangeText={setEditValue} multiline />
                  <View style={styles.editActions}>
                    <Button title="Cancel" variant="ghost" size="sm" onPress={handleCancelEdit} />
                    <Button title="Save" size="sm" onPress={() => handleSaveEdit(log)} />
                  </View>
                </View>
              ) : (
                <View style={styles.body}>{renderLogBody(log)}</View>
              )}
            </Card>
          );
        })
      )}
    </View>
  );
}
