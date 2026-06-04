import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import { buildLocationMapHtml } from '../../utils/locationMapHtml';

interface LocationSensorPanelProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onResultReady: (value: string) => void;
  onSave: () => void;
}

function parseCoords(value: string): { lat: number; lng: number } | null {
  if (!value.includes(',')) return null;
  const [latStr, lngStr] = value.split(',');
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

export function LocationSensorPanel({
  notes,
  onNotesChange,
  onResultReady,
  onSave,
}: LocationSensorPanelProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<string | null>(null);

  const styles = useThemedStyles(({ colors: c, typography }) => ({
    mapBox: {
      width: '100%',
      height: 250,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      marginBottom: Spacing.lg,
      backgroundColor: c.border,
    },
    loadingBox: {
      width: '100%',
      height: 250,
      borderRadius: BorderRadius.lg,
      backgroundColor: c.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    loadingTitle: { ...typography.body, fontWeight: '600', color: c.textSecondary, marginTop: Spacing.sm },
    loadingHint: { ...typography.caption, color: c.textMuted, marginTop: Spacing.xs, textAlign: 'center', paddingHorizontal: Spacing.lg },
    coordsBox: {
      backgroundColor: c.primary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    coordsText: { ...typography.body, color: c.white, fontWeight: '700', textAlign: 'center' },
    hint: { ...typography.bodySmall, color: c.textSecondary, marginBottom: Spacing.lg, lineHeight: 20 },
    saveSection: { gap: Spacing.sm },
  }));

  const checkPermission = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermissionGranted(status === 'granted');
    return status === 'granted';
  }, []);

  useEffect(() => {
    void checkPermission();
  }, [checkPermission]);

  const requestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === 'granted';
    setPermissionGranted(granted);
    if (!granted) {
      Alert.alert(t('activities.permissionDeniedTitle'), t('activities.permissionDeniedMsg'));
    }
    return granted;
  };

  const fetchLocation = async () => {
    setLoading(true);
    setCoords(null);
    onResultReady('');

    try {
      let granted = permissionGranted === true;
      if (!granted) {
        granted = await requestPermission();
      }
      if (!granted) {
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const value = `${loc.coords.latitude},${loc.coords.longitude}`;
      setCoords(value);
      onResultReady(value);
    } catch {
      Alert.alert(t('activities.locationErrorTitle'), t('activities.locationErrorMsg'));
      setCoords(null);
      onResultReady('');
    } finally {
      setLoading(false);
    }
  };

  const handleMeasureAgain = () => {
    setCoords(null);
    onResultReady('');
    void fetchLocation();
  };

  const parsed = coords ? parseCoords(coords) : null;
  const mapPopup = t('sensors.locationMapPopup');

  if (permissionGranted === false && !coords) {
    return (
      <View>
        <Text style={styles.hint}>{t('sensors.locationPermissionHint')}</Text>
        <Button
          title={t('sensors.locationGrantPermission')}
          onPress={requestPermission}
          size="lg"
          fullWidth
          icon={<Ionicons name="location" size={20} color={colors.white} />}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Ionicons name="navigate-outline" size={32} color={colors.textMuted} style={{ marginTop: Spacing.md }} />
        <Text style={styles.loadingTitle}>{t('sensors.locationAcquiring')}</Text>
        <Text style={styles.loadingHint}>{t('sensors.locationAcquiringHint')}</Text>
      </View>
    );
  }

  if (!coords) {
    return (
      <View>
        <Text style={styles.hint}>{t('sensors.locationIdleHint')}</Text>
        <Button
          title={t('sensors.locationGetPosition')}
          onPress={fetchLocation}
          size="lg"
          fullWidth
          icon={<Ionicons name="navigate" size={20} color={colors.white} />}
        />
      </View>
    );
  }

  return (
    <View>
      {parsed ? (
        <View style={styles.mapBox}>
          <WebView
            source={{
              html: buildLocationMapHtml(parsed.lat, parsed.lng, mapPopup),
              baseUrl: 'https://openstreetmap.org',
            }}
            style={{ flex: 1, backgroundColor: 'transparent' }}
            userAgent="StemmLabApp/1.0"
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
          />
        </View>
      ) : null}

      <View style={styles.coordsBox}>
        <Text style={styles.coordsText}>
          {t('sensors.locationCoordinates', {
            lat: parsed?.lat.toFixed(6) ?? coords,
            lng: parsed?.lng.toFixed(6) ?? '',
          })}
        </Text>
      </View>

      <View style={styles.saveSection}>
        <Button
          title={t('sensors.locationMeasureAgain')}
          onPress={handleMeasureAgain}
          variant="outlined"
          style={{ marginBottom: Spacing.md }}
        />
        <Input
          label={t('sensors.notesLabel')}
          placeholder={t('sensors.notesPlaceholder')}
          value={notes}
          onChangeText={onNotesChange}
          multiline
        />
        <Button
          title={t('sensors.saveLog')}
          onPress={onSave}
          size="lg"
          fullWidth
          icon={<Ionicons name="save" size={18} color={colors.white} />}
        />
      </View>
    </View>
  );
}
