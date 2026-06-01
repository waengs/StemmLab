import React, { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  PageTitle,
  SearchBar,
  SensorGrid,
  SensorModal,
  SensorLogBookModal,
  FeatureCard,
} from '../../src/components';
import { hasProfanity } from '../../src/utils/profanity';
import { formatSlowMoLogData } from '../../src/utils/slowMoLog';
import { isCloudinaryConfigured, uploadVideoToCloudinary } from '../../src/services/cloudinary';
import { cloudinaryEnv } from '../../src/config/env';
import { useForumStore, useSensorStore, useMySensorLogsAll } from '../../src/stores';
import { buildSensorLogForumShare } from '../../src/utils/sensorLogForumShare';
import { useRequireAuth } from '../../src/stores';
import { useTheme } from '../../src/context/ThemeContext';
import { Spacing } from '../../src/theme';
import type { SensorLog } from '../../src/types';

export default function Sensors() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const { user, team } = useRequireAuth();
  const allLogs = useMySensorLogsAll(user?.uid, team?.discriminator);
  const addLog = useSensorStore((s) => s.addLog);
  const setPendingSensorShare = useForumStore((s) => s.setPendingSensorShare);
  const [searchQuery, setSearchQuery] = useState('');
  const [logBookOpen, setLogBookOpen] = useState(false);
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
        handleClose();
      }
      return;
    }

    setIsRecording(true);
    setSensorValue('LOADING...');
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
            folder: cloudinaryEnv.sensorLogsFolder,
            publicId: `${user.uid}-${Date.now()}`,
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

      Alert.alert(
        t('sensors.cloudinaryRequiredTitle', { defaultValue: 'Cloudinary required' }),
        t('sensors.cloudinaryRequiredMsg', {
          defaultValue:
            'Slow-motion videos are stored in Cloudinary so they survive reinstall and sync across devices. Add Cloudinary keys to .env and restart Expo, or save will only keep a copy on this device.',
        }),
        [
          { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
          {
            text: t('sensors.saveOnDeviceOnly', { defaultValue: 'Save on this device only' }),
            onPress: () => void saveLog(formatSlowMoLogData(sensorValue, notes)),
          },
        ]
      );
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

  const handleShareToForum = (log: SensorLog) => {
    if (!user || !team) return;
    setPendingSensorShare(buildSensorLogForumShare(log, t));
    setLogBookOpen(false);
    router.push('/(tabs)/forum');
  };

  return (
    <>
      <Screen>
        <PageTitle showSettings>{t('sensors.pageTitle')}</PageTitle>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={t('sensors.searchPlaceholder')} />

        <View style={styles.logBookRow}>
          <FeatureCard
            title={t('sensors.logBook.title')}
            description={t('sensors.logBook.cardDescription', { count: allLogs.length })}
            icon="book-outline"
            iconColor={colors.primary}
            chipLabel={t('sensors.logBook.chip')}
            onPress={() => setLogBookOpen(true)}
          />
        </View>

        <SensorGrid onSensorPress={handleSensorClick} searchQuery={searchQuery} />
      </Screen>

      <SensorLogBookModal
        visible={logBookOpen}
        logs={allLogs}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onClose={() => setLogBookOpen(false)}
        onShareToForum={handleShareToForum}
      />

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

const styles = StyleSheet.create({
  logBookRow: {
    marginBottom: Spacing.lg,
  },
});
