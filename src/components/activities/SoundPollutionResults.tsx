import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import type { SoundPollutionData, SoundPollutionTrial } from './SoundPollutionForm';

interface Props {
  results: { data: SoundPollutionData }[];
}

const generateLeafletMap = (lat: number, lng: number, markers: any[]) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html { margin: 0; padding: 0; height: 100vh; width: 100vw; overflow: hidden; }
    #map { height: 100vh; width: 100vw; background-color: #eee; }
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

    // Existing markers
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

  if (!results || results.length === 0) return null;

  // We primarily show the most recent result if there are multiple.
  const data = results[0].data;
  
  // Calculate center of map based on trials
  const trialsWithCoords = data.trials?.filter((t: SoundPollutionTrial) => t.coordinates) || [];
  const initialRegion = trialsWithCoords.length > 0 ? {
    latitude: trialsWithCoords[0].coordinates!.latitude,
    longitude: trialsWithCoords[0].coordinates!.longitude,
    latitudeDelta: 0.0005,
    longitudeDelta: 0.0005,
  } : undefined;

  return (
    <View style={styles.container}>
      {data.predictedLoudestAction ? (
        <Text style={styles.predictionHighlight}>
          <Text style={{fontWeight: '700'}}>Predicted Loudest Action: </Text>
          {data.predictedLoudestAction}
        </Text>
      ) : null}

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Experiment Results Map</Text>
        {initialRegion ? (
          <View style={{ width: '100%', height: 250, borderRadius: 8, overflow: 'hidden', backgroundColor: Colors.borderLight }}>
            <WebView
              source={{ 
                html: generateLeafletMap(initialRegion.latitude, initialRegion.longitude, trialsWithCoords),
                baseUrl: 'https://openstreetmap.org'
              }}
              style={{ flex: 1, backgroundColor: 'transparent' }}
              userAgent="StemmLabApp/1.0"
              scrollEnabled={false}
              originWhitelist={['*']}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>
        ) : (
          <Text style={{color: Colors.textSecondary, fontStyle: 'italic'}}>No mapped locations recorded.</Text>
        )}
      </View>

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Experiment Details</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Location</Text>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Action</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Pred.</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>dB</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Right?</Text>
        </View>
        
        {data.trials?.map((trial: SoundPollutionTrial) => (
          <View key={trial.id} style={styles.trialRowBlock}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{trial.locationLabel || 'Map'}</Text>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: '700' }]}>{trial.action}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{trial.prediction}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{trial.outcomeDb ? `${trial.outcomeDb} dB` : '-'}</Text>
              <Text style={[styles.tableCell, { flex: 1, color: trial.wereYouRight === 'Yes' ? Colors.secondary : Colors.danger }]}>
                {trial.wereYouRight || '-'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {(data.surprises || data.needEarMuffs) && (
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Reflection</Text>
          {data.surprises ? (
            <View style={{ marginBottom: Spacing.sm }}>
              <Text style={{ ...Typography.bodySmall, fontWeight: '700' }}>Surprises:</Text>
              <Text style={{...Typography.bodySmall, color: Colors.textSecondary, fontStyle: 'italic'}}>{data.surprises}</Text>
            </View>
          ) : null}
          {data.needEarMuffs ? (
            <View style={{ marginBottom: Spacing.sm }}>
              <Text style={{ ...Typography.bodySmall, fontWeight: '700' }}>Do we need ear muffs?</Text>
              <Text style={{...Typography.bodySmall, color: Colors.textSecondary, fontStyle: 'italic'}}>{data.needEarMuffs}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
  },
  predictionHighlight: {
    ...Typography.body,
    color: Colors.primary,
    marginBottom: Spacing.lg,
    padding: Spacing.sm,
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: BorderRadius.sm,
  },
  tableCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tableTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: '#334155',
    marginBottom: Spacing.md,
  },
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  tableCell: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },
  trialRowBlock: {
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '50',
    paddingBottom: Spacing.sm,
  },
  subDetails: {
    paddingLeft: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
    marginTop: 2,
  },
  detailText: {
    ...Typography.caption,
    color: Colors.textMuted,
  }
});
