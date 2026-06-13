import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Button } from '../ui/Button';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCapture: (angleStr: string) => void;
}

export function GyroProtractorModal({ visible, onClose, onCapture }: Props) {
  const { t } = useTranslation();
  const [angle, setAngle] = useState(0);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const styles = useThemedStyles(({ colors, typography }) => ({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      alignItems: 'center',
      elevation: 5,
    },
    title: {
      ...typography.h2,
      color: colors.primary,
      marginBottom: Spacing.md,
    },
    instruction: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
    angleDisplay: {
      fontSize: 72,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: Spacing.xl,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: Spacing.md,
    },
    errorText: {
      ...typography.body,
      color: colors.danger,
      marginBottom: Spacing.lg,
    }
  }));

  useEffect(() => {
    let subscription: any;

    const init = async () => {
      const available = await Accelerometer.isAvailableAsync();
      setIsAvailable(available);

      if (available && visible) {
        Accelerometer.setUpdateInterval(100);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          // Calculate pitch angle
          // When phone is upright, y is ~1. When flat, y is 0.
          // Using atan2 to get the angle from the horizontal plane
          let pitch = Math.atan2(y, z) * (180 / Math.PI);
          // Normalize to 0-90 degrees for simple bend angle measurement
          pitch = Math.abs(pitch);
          if (pitch > 90) {
            pitch = 180 - pitch;
          }
          setAngle(Math.round(pitch));
        });
      }
    };

    if (visible) {
      init();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{t('activities.protractor.title', { defaultValue: 'Digital Protractor' })}</Text>
          
          {isAvailable === false ? (
            <Text style={styles.errorText}>{t('activities.protractor.error', { defaultValue: 'Accelerometer is not available on this device.' })}</Text>
          ) : (
            <>
              <Text style={styles.instruction}>
                {t('activities.protractor.instruction', { defaultValue: 'Align the edge of your phone with the bent material to measure its angle.' })}
              </Text>
              
              <Text style={styles.angleDisplay}>{angle}°</Text>
            </>
          )}

          <View style={styles.buttonRow}>
            <View style={{ flex: 1 }}>
              <Button title={t('common.cancel', { defaultValue: 'Cancel' })} variant="outlined" onPress={onClose} />
            </View>
            <View style={{ flex: 1 }}>
              <Button 
                title={t('common.capture', { defaultValue: 'Capture' })} 
                variant="primary" 
                icon={<Ionicons name="camera-outline" size={20} color="white" />}
                onPress={() => onCapture(angle.toString())} 
                disabled={isAvailable === false}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
