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
import { matchesSearch } from '../../utils/search';
import { Spacing } from '../../theme';
import type { SensorLog } from '../../types';

interface SensorLogListProps {
  logs: SensorLog[];
  searchQuery?: string;
}

export function SensorLogList({ logs, searchQuery = '' }: SensorLogListProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  
  const updateLog = useSensorStore((s) => s.updateLog);
  const deleteLog = useSensorStore((s) => s.deleteLog);

  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const sensorName = t(`data.sensors.${log.sensorType}.name`, { defaultValue: log.sensorType });
      return matchesSearch(`${sensorName} ${log.data}`, searchQuery);
    });
  }, [logs, searchQuery, t]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: { marginTop: Spacing.xl },
        title: { ...typography.h3, marginBottom: Spacing.md },
        logCard: { marginBottom: Spacing.sm, padding: Spacing.md },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: Spacing.md,
        },
        info: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          flexWrap: 'wrap',
        },
        data: { ...typography.bodySmall, flex: 1, minWidth: 120 },
        date: { ...typography.caption, flexShrink: 0 },
        empty: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
        actions: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          marginTop: Spacing.sm,
        },
        actionBtn: {
          padding: Spacing.xs,
        },
        editContainer: {
          flex: 1,
          marginTop: Spacing.xs,
        },
        editActions: {
          flexDirection: 'row',
          gap: Spacing.sm,
          marginTop: Spacing.sm,
          justifyContent: 'flex-end',
        }
      }),
    [colors, typography]
  );

  const handleEdit = (log: SensorLog) => {
    setEditingLogId(log.id);
    setEditValue(log.data);
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
    Alert.alert(
      "Delete Log",
      "Are you sure you want to delete this sensor log?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteLog(id) }
      ]
    );
  };

  if (logs.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t('sensors.recentLogs')}</Text>
      {filteredLogs.length === 0 ? (
        <Text style={styles.empty}>{t('common.noSearchResults')}</Text>
      ) : (
        filteredLogs.map((log) => {
          const isEditing = editingLogId === log.id;
          return (
            <Card key={log.id} style={styles.logCard} variant="outlined">
              <View style={styles.row}>
                <View style={styles.info}>
                  <Chip
                    label={t(`data.sensors.${log.sensorType}.name`, { defaultValue: log.sensorType })}
                    variant="filled"
                    color={colors.primary}
                    size="sm"
                  />
                  {isEditing ? (
                    <View style={styles.editContainer}>
                      <Input
                        value={editValue}
                        onChangeText={setEditValue}
                        multiline
                      />
                      <View style={styles.editActions}>
                        <Button title="Cancel" variant="ghost" size="sm" onPress={handleCancelEdit} />
                        <Button title="Save" size="sm" onPress={() => handleSaveEdit(log)} />
                      </View>
                    </View>
                  ) : (
                    <View style={{ flex: 1 }}>
                      <Text style={styles.data} numberOfLines={2}>
                        {log.data}
                      </Text>
                      <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(log)}>
                          <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(log.id)}>
                          <Ionicons name="trash-outline" size={16} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
                <Text style={styles.date}>{new Date(log.timestamp).toLocaleString()}</Text>
              </View>
            </Card>
          );
        })
      )}
    </View>
  );
}
