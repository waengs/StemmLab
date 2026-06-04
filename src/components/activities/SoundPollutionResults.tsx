import React from 'react';
import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import type { SoundPollutionData, SoundPollutionTrial } from './SoundPollutionForm';
import { actT } from '../../utils/activityContent';

interface Props {
  results: { data: SoundPollutionData }[];
}

const generateLeafletMap = (lat: number, lng: number, markers: unknown[]) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html { margin: 0; padding: 0; height: 100vh; width: 100vw; overflow: hidden; }
    #map { height: 100vh; width: 100vw; background-color: #1e293b; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${lat}, ${lng}], 18);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© CARTO'
    }).addTo(map);

    const trials = ${JSON.stringify(markers)};
    const grouped = {};
    trials.forEach(t => {
      if (!t.coordinates) return;
      const key = t.coordinates.latitude + ',' + t.coordinates.longitude;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    });

    Object.keys(grouped).forEach(key => {
      const group = grouped[key];
      const coords = group[0].coordinates;
      const label = group[0].locationLabel || 'Unknown Location';
      
      const maxDb = Math.max(...group.map(t => parseFloat(t.outcomeDb || '0')));
      const color = maxDb > 70 ? 'red' : (maxDb < 50 ? 'green' : 'orange');

      let popupHtml = "<b>" + label + "</b><br/><ul style='margin: 5px 0; padding-left: 20px; font-size: 12px;'>";
      group.forEach(t => {
         popupHtml += "<li>" + t.action + " - <b>" + t.outcomeDb + " dB</b></li>";
      });
      popupHtml += "</ul>";

      L.circleMarker([coords.latitude, coords.longitude], {
        color: color, fillColor: color, fillOpacity: 0.8, radius: 12
      }).addTo(map).bindPopup(popupHtml);
    });
  </script>
</body>
</html>
`;

export function SoundPollutionResults({ results }: Props) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(({ colors: c, typography: ty }) => ({
    container: { marginTop: Spacing.sm },
    predictionHighlight: {
      ...ty.body,
      color: c.primary,
      marginBottom: Spacing.lg,
      padding: Spacing.sm,
      backgroundColor: c.primaryLight + '20',
      borderRadius: BorderRadius.sm,
    },
    tableCard: {
      marginBottom: Spacing.lg,
      padding: Spacing.md,
      backgroundColor: c.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    tableTitle: {
      ...ty.bodySmall,
      fontWeight: '700',
      color: c.text,
      marginBottom: Spacing.md,
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingBottom: Spacing.xs,
      marginBottom: Spacing.sm,
    },
    tableHeaderText: { ...ty.bodySmall, fontWeight: '700', color: c.text },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.xs,
    },
    tableCell: {
      ...ty.bodySmall,
      color: c.textSecondary,
    },
    trialRowBlock: {
      marginBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: c.border + '50',
      paddingBottom: Spacing.sm,
    },
  }));

  if (!results || results.length === 0) return null;

  const data = results[0].data;
  const trialsWithCoords = data.trials?.filter((trial: SoundPollutionTrial) => trial.coordinates) || [];
  const initialRegion =
    trialsWithCoords.length > 0
      ? {
          latitude: trialsWithCoords[0].coordinates!.latitude,
          longitude: trialsWithCoords[0].coordinates!.longitude,
          latitudeDelta: 0.0005,
          longitudeDelta: 0.0005,
        }
      : undefined;

  return (
    <View style={styles.container}>
      {data.predictedLoudestAction ? (
        <Text style={styles.predictionHighlight}>
          <Text style={{ fontWeight: '700' }}>{t('data.activities.sound-pollution.predictedLoudest')} </Text>
          {data.predictedLoudestAction}
        </Text>
      ) : null}

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>{t('data.activities.sound-pollution.resultsMapTitle')}</Text>
        {initialRegion ? (
          <View
            style={{
              width: '100%',
              height: 250,
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: colors.borderLight,
            }}
          >
            <WebView
              source={{
                html: generateLeafletMap(
                  initialRegion.latitude,
                  initialRegion.longitude,
                  trialsWithCoords
                ),
                baseUrl: 'https://openstreetmap.org',
              }}
              style={{ flex: 1, backgroundColor: 'transparent' }}
              userAgent="StemmLabApp/1.0"
              scrollEnabled={false}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
            />
          </View>
        ) : (
          <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>
            {t('data.activities.sound-pollution.noMappedLocations')}
          </Text>
        )}
      </View>

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>{t('data.activities.sound-pollution.experimentDetailsTitle')}</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>{t('data.activities.sound-pollution.tableLocation')}</Text>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>{t('data.activities.sound-pollution.tableAction')}</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>{t('data.activities.sound-pollution.tableDb')}</Text>
        </View>

        {data.trials?.map((trial: SoundPollutionTrial) => (
          <View key={trial.id} style={styles.trialRowBlock}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{trial.locationLabel || t('data.activities.sound-pollution.mapPinLabel')}</Text>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: '700' }]}>{trial.action}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {trial.outcomeDb ? `${trial.outcomeDb} dB` : '—'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {data.surprises ? (
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>{actT('shared.reflectionTitle')}</Text>
          <View style={{ marginBottom: Spacing.sm }}>
            <Text style={{ ...typography.bodySmall, fontWeight: '700' }}>{t('activities.surprisesLabel')}</Text>
            <Text
              style={{
                ...typography.bodySmall,
                color: colors.textSecondary,
                fontStyle: 'italic',
              }}
            >
              {data.surprises}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
