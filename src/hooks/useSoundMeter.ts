import { useState, useEffect } from 'react';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';

export function useSoundMeter() {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [decibels, setDecibels] = useState<number>(0);

  const audioRecorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const recorderState = useAudioRecorderState(audioRecorder, 100);

  useEffect(() => {
    if (recorderState.isRecording && recorderState.metering !== undefined) {
      // Approximate dB SPL: +120 (0 dBFS ~ 120 dB SPL)
      const dbSPL = Math.max(0, recorderState.metering + 120);
      setDecibels(dbSPL);
    }
  }, [recorderState.metering, recorderState.isRecording]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await requestRecordingPermissionsAsync();
        setPermissionGranted(status === 'granted');
      } catch (err) {
        console.warn('Failed to request audio permissions', err);
      }
    })();
  }, []);

  const startMetering = async () => {
    if (!permissionGranted) {
      const { status } = await requestRecordingPermissionsAsync();
      setPermissionGranted(status === 'granted');
      if (status !== 'granted') return;
    }

    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync({
        ...RecordingPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });

      audioRecorder.record();
    } catch (err) {
      console.error('Failed to start metering', err);
    }
  };

  const stopMetering = () => {
    try {
      if (audioRecorder.isRecording) {
        audioRecorder.stop();
      }
      setDecibels(0);
    } catch (err) {
      console.warn('Failed to stop metering', err);
    }
  };

  return {
    isRecording: audioRecorder.isRecording,
    decibels,
    permissionGranted,
    startMetering,
    stopMetering,
  };
}
