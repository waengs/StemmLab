import React, { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
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
import { formatSlowMoLogData } from '../../src/utils/slowMoLog';
import { isCloudinaryConfigured, uploadVideoToCloudinary } from '../../src/services/cloudinary';
import { cloudinaryEnv } from '../../src/config/env';
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
  const [isSaving, setIsSaving] = useState(false);

  const handleSensorClick = (sensorId: string) => {
    setSelectedSensor(sensorId);
    setNotes('');
    setSensorValue('');
    setIsRecording(false);
    if (sensorId === 'slow-mo') {
      void simulateSensorData(sensorId);
    }
  };

  const handleResultReady = (value: string) => {
    setSensorValue(value);
    setIsRecording(!!value);
  };

  const simulateSensorData = async (sensorToRun: string | null = selectedSensor) => {
    if (!sensorToRun) return;

    if (sensorToRun === 'slow-mo') {
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
      } else {
        // If they cancelled the camera, close the modal
        handleClose();
      }
      return;
    }

    setIsRecording(true);
    setSensorValue('LOADING...'); // Show buffer state
    let value = '';

    switch (sensorToRun) {
      case 'sound-meter':
        value = (Math.random() * 40 + 40).toFixed(1) + ' dB';
        break;
      case 'location':
        try {
          const loc = await Location.getCurrentPositionAsync({});
          value = `${loc.coords.latitude},${loc.coords.longitude}`;
        } catch (e) {
          value = 'Location Error';
        }
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
      if (!sensorValue) {
        Alert.alert(
          t('sensors.noVideoTitle', { defaultValue: 'No video' }),
          t('sensors.noVideoMsg', { defaultValue: 'Record a video before saving.' })
        );
        return;
      }

      if (isCloudinaryConfigured()) {
        setIsSaving(true);
        try {
          const videoUrl = await uploadVideoToCloudinary(sensorValue, {
            folder: cloudinaryEnv.slowmoFolder,
            publicId: `${team.discriminator}-${Date.now()}`,
          });
          await saveLog(formatSlowMoLogData(videoUrl, notes));
        } catch (error) {
          Alert.alert(
            t('sensors.uploadFailedTitle', { defaultValue: 'Upload failed' }),
            error instanceof Error
              ? error.message
              : t('sensors.uploadFailedMsg', { defaultValue: 'Could not upload the video. Try again.' })
          );
        } finally {
          setIsSaving(false);
        }
        return;
      }

      await saveLog(formatSlowMoLogData(sensorValue, notes));
      return;
    }

    if (selectedSensor === 'vibration' || selectedSensor === 'reaction-timer') {
      if (!sensorValue) {
        Alert.alert(
          t('sensors.noResultTitle', { defaultValue: 'No result' }),
          t('sensors.noResultMsg', { defaultValue: 'Complete a measurement before saving.' })
        );
        return;
      }
      await saveLog(notes.trim() ? `${sensorValue}\nNotes: ${notes}` : sensorValue);
      return;
    }

    await saveLog(sensorValue);
  };

  const handleClose = () => {
    setSelectedSensor(null);
    setIsRecording(false);
    setSensorValue('');
    setNotes('');
    setIsSaving(false);
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
        onResultReady={handleResultReady}
        notes={notes}
        onNotesChange={setNotes}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </>
  );
}
