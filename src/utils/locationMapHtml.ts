/** Leaflet map HTML for embedding in WebView (sensor location preview). */
export function buildLocationMapHtml(lat: number, lng: number, popupLabel: string): string {
  const popup = JSON.stringify(popupLabel);
  return `
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
    L.circleMarker([${lat}, ${lng}], {
      color: '#3388ff', fillColor: '#3388ff', fillOpacity: 0.5, radius: 8
    }).addTo(map).bindPopup(${popup});
  </script>
</body>
</html>
`;
}
