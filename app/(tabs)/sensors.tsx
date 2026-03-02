import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  PageTitle,
  SensorGrid,
  SensorLogList,
  SensorModal,
} from '../../src/components';
import { getTeam, saveSensorLog, getSensorLogs } from '../../src/utils/storage';
import { hasProfanity } from '../../src/utils/profanity';
import type { SensorLog, Team } from '../../src/types';

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
        const teamLogs = allLogs.filter((l) => l.teamDiscriminator === teamData.discriminator);
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

    if (hasProfanity(sensorValue)) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

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

  return (
    <>
      <Screen>
        <PageTitle>{t('sensors.pageTitle')}</PageTitle>
        <SensorGrid onSensorPress={handleSensorClick} />
        <SensorLogList logs={logs} />
      </Screen>

      <SensorModal
        sensorId={selectedSensor}
        isRecording={isRecording}
        sensorValue={sensorValue}
        onClose={handleClose}
        onStartMeasurement={simulateSensorData}
        onValueChange={setSensorValue}
        onSave={handleSave}
      />
    </>
  );
}
