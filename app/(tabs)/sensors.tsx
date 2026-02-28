import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { SENSORS } from '../../src/types';
import { getTeam, saveSensorLog, getSensorLogs } from '../../src/utils/storage';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../src/theme';
import type { SensorLog, Team } from '../../src/types';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function Sensors() {
  const { t } = useTranslation();
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sensorValue, setSensorValue] = useState('');
  const [logs, setLogs] = useState<SensorLog[]>([]);
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    (async () => {
      const teamData = await getTeam();
      setTeam(teamData);
      if (teamData) {
        const allLogs = await getSensorLogs();
        const teamLogs = allLogs.filter(l => l.teamDiscriminator === teamData.discriminator);
        setLogs(teamLogs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));
      }
    })();
  }, []);

  const handleSensorClick = (sensorId: string) => {
    setSelectedSensor(sensorId);
    setIsRecording(false);
    setSensorValue('');
  };

  const simulateSensorData = () => {
    setIsRecording(true);
    let value = '';

    switch (selectedSensor) {
      case 'g-force':
        value = (Math.random() * 5 + 1).toFixed(2) + ' g';
        break;
      case 'sound-meter':
        value = (Math.random() * 40 + 40).toFixed(1) + ' dB';
        break;
      case 'vibration':
        value = (Math.random() * 100 + 20).toFixed(1) + ' Hz';
        break;
      case 'movement-detector':
        value = (Math.random() * 10 + 1).toFixed(2) + ' m/s';
        break;
      case 'location':
        value = `${(Math.random() * 90).toFixed(4)}°N, ${(Math.random() * 180).toFixed(4)}°E`;
        break;
      case 'slow-mo':
        value = 'Video recording started at 240 fps';
        break;
    }

    setSensorValue(value);
  };

  const handleSave = async () => {
    if (!team || !selectedSensor) return;

    const log: SensorLog = {
      id: Date.now().toString(),
      sensorType: selectedSensor,
      timestamp: Date.now(),
      data: sensorValue,
      teamDiscriminator: team.discriminator,
    };

    await saveSensorLog(log);
    setLogs([log, ...logs].slice(0, 10));
    handleClose();
  };

  const handleClose = () => {
    setSelectedSensor(null);
    setIsRecording(false);
    setSensorValue('');
  };

  const sensor = selectedSensor ? SENSORS[selectedSensor as keyof typeof SENSORS] : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>{t('sensors.pageTitle')}</Text>

        <View style={styles.grid}>
          {Object.values(SENSORS).map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.sensorCard}
              onPress={() => handleSensorClick(s.id)}
              activeOpacity={0.7}
            >
              <Card style={styles.sensorCardInner}>
                <View style={styles.sensorIcon}>
                  <Ionicons name={s.icon as IoniconsName} size={24} color={Colors.primary} />
                </View>
                <Text style={styles.sensorName}>{t(`data.sensors.${s.id}.name`, { defaultValue: s.name })}</Text>
                <Text style={styles.sensorDesc}>{t(`data.sensors.${s.id}.desc`, { defaultValue: s.description })}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Logs */}
        {logs.length > 0 && (
          <View style={styles.logsSection}>
            <Text style={styles.logsTitle}>{t('sensors.recentLogs')}</Text>
            {logs.map((log) => (
              <Card key={log.id} style={styles.logCard} variant="outlined">
                <View style={styles.logRow}>
                  <View style={styles.logInfo}>
                    <Chip label={t(`data.sensors.${log.sensorType}.name`, { defaultValue: log.sensorType })} variant="filled" color={Colors.primary} size="sm" />
                    <Text style={styles.logData}>{log.data}</Text>
                  </View>
                  <Text style={styles.logDate}>
                    {new Date(log.timestamp).toLocaleString()}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sensor Modal */}
      <Modal
        visible={!!selectedSensor}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {sensor && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconRow}>
                    <Ionicons name={sensor.icon as IoniconsName} size={24} color={Colors.primary} />
                    <Text style={styles.modalTitle}>{t(`data.sensors.${sensor.id}.name`, { defaultValue: sensor.name })}</Text>
                  </View>
                  <TouchableOpacity onPress={handleClose}>
                    <Ionicons name="close" size={24} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDesc}>{t(`data.sensors.${sensor.id}.desc`, { defaultValue: sensor.description })}</Text>

                {!isRecording ? (
                  <Button
                    title={t('sensors.startMeasurement')}
                    onPress={simulateSensorData}
                    size="lg"
                    fullWidth
                    icon={<Ionicons name="play" size={18} color={Colors.white} />}
                  />
                ) : (
                  <View>
                    <View style={styles.measurementDisplay}>
                      <Text style={styles.measurementValue}>{sensorValue}</Text>
                    </View>
                    <Input
                      label={t('common.notes')}
                      value={sensorValue}
                      onChangeText={setSensorValue}
                      multiline
                      numberOfLines={2}
                      placeholder={t('sensors.notesPlaceholder')}
                    />
                    <Button
                      title={t('sensors.saveLog')}
                      onPress={handleSave}
                      size="lg"
                      fullWidth
                      icon={<Ionicons name="save" size={18} color={Colors.white} />}
                    />
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  pageTitle: {
    ...Typography.h1,
    marginBottom: Spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sensorCard: {
    width: '47%',
    flexGrow: 1,
  },
  sensorCardInner: {
    alignItems: 'flex-start',
  },
  sensorIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  sensorName: {
    ...Typography.h3,
    marginBottom: 2,
  },
  sensorDesc: {
    ...Typography.caption,
  },
  logsSection: {
    marginTop: Spacing.sm,
  },
  logsTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  logCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  logData: {
    ...Typography.bodySmall,
    flex: 1,
  },
  logDate: {
    ...Typography.caption,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalTitle: {
    ...Typography.h2,
  },
  modalDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  measurementDisplay: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  measurementValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
  },
});
