import React, { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  PageTitle,
  SearchBar,
  SensorGrid,
  SensorLogList,
  SensorModal,
} from '../../src/components';
import { hasProfanity } from '../../src/utils/profanity';
import { useAuthStore, useSensorStore, useTeamSensorLogs } from '../../src/stores';
import { useRequireAuth } from '../../src/stores';
import type { SensorLog } from '../../src/types';

export default function Sensors() {
  const { t } = useTranslation();
  const { user, team } = useRequireAuth();
  const logs = useTeamSensorLogs(team?.discriminator);
  const addLog = useSensorStore((s) => s.addLog);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sensorValue, setSensorValue] = useState('');
  const [notes, setNotes] = useState('');

  const handleSensorClick = (sensorId: string) => {
    setSelectedSensor(sensorId);
    setIsRecording(false);
    setSensorValue('');
    setNotes('');
  };

  const simulateSensorData = async () => {
    if (selectedSensor === 'slow-mo') {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(t('common.cameraPermissionMsg', { defaultValue: 'Camera permission is required' }));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsRecording(true);
        setSensorValue(result.assets[0].uri);
      }
      return;
    }

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
    }

    setSensorValue(value);
  };

  const handleSave = async () => {
    if (!user || !team || !selectedSensor) return;

    if (hasProfanity(sensorValue) || hasProfanity(notes)) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

    const saveLog = async (dataToSave: string) => {
      const log: SensorLog = {
        id: Date.now().toString(),
        sensorType: selectedSensor,
        timestamp: Date.now(),
        data: dataToSave,
        teamDiscriminator: team.discriminator,
        recordedByUid: user.uid,
      };

      await addLog(log);
      handleClose();
    };

    if (selectedSensor === 'slow-mo') {
      Alert.alert(
        "Cannot save video",
        "The video cannot be saved currently, but your notes will be saved. Proceed?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Proceed", 
            onPress: () => saveLog(notes ? `Notes: ${notes}` : "No notes recorded.") 
          }
        ]
      );
      return;
    }

    await saveLog(sensorValue);
  };

  const handleClose = () => {
    setSelectedSensor(null);
    setIsRecording(false);
    setSensorValue('');
    setNotes('');
  };

  return (
    <>
      <Screen>
        <PageTitle showSettings>{t('sensors.pageTitle')}</PageTitle>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={t('sensors.searchPlaceholder')} />
        <SensorGrid onSensorPress={handleSensorClick} searchQuery={searchQuery} />
        <SensorLogList logs={logs} searchQuery={searchQuery} />
      </Screen>

      <SensorModal
        sensorId={selectedSensor}
        isRecording={isRecording}
        sensorValue={sensorValue}
        onClose={handleClose}
        onStartMeasurement={simulateSensorData}
        onValueChange={setSensorValue}
        notes={notes}
        onNotesChange={setNotes}
        onSave={handleSave}
      />
    </>
  );
}
