import React, { useCallback, useMemo, useState } from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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
import { useAsyncAction } from '../../src/hooks/useAsyncAction';
import { useTheme } from '../../src/context/ThemeContext';
import { Spacing } from '../../src/theme';
import type { SensorLog } from '../../src/types';

export default function Sensors() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, typography } = useTheme();
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

  const handleClose = useCallback(() => {
    setSelectedSensor(null);
    setIsRecording(false);
    setSensorValue('');
    setNotes('');
  }, []);

  const saveSensorLog = useCallback(async () => {
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

    if (
      selectedSensor === 'battery' ||
      selectedSensor === 'vibration' ||
      selectedSensor === 'reaction-timer' ||
      selectedSensor === 'sound-meter' ||
      selectedSensor === 'location'
    ) {
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
  }, [user, team, selectedSensor, sensorValue, notes, addLog, t, handleClose]);

  const [handleSave, isSaving] = useAsyncAction(saveSensorLog);

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

  };

  const handleShareToForum = (log: SensorLog) => {
    if (!user || !team) return;
    setPendingSensorShare(buildSensorLogForumShare(log, t));
    setLogBookOpen(false);
    router.push('/(tabs)/forum');
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        intro: {
          ...typography.body,
          color: colors.textSecondary,
          marginTop: Spacing.md,
          marginBottom: Spacing.lg,
        },
        logBookRow: {
          marginBottom: Spacing.lg,
        },
      }),
    [colors.textSecondary, typography.body]
  );

  return (
    <>
      <Screen>
        <PageTitle showSettings>{t('sensors.pageTitle')}</PageTitle>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={t('sensors.searchPlaceholder')} />
        <Text style={styles.intro}>{t('sensors.pageIntro')}</Text>

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
