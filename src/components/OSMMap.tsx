import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import type { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes';

export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

interface OSMMapProps {
  destination: MapCoordinates;
  driverLocation?: MapCoordinates | null;
}

const INITIAL_MAP_HTML = `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; background: #e8eee8; }
    .leaflet-container { font-family: Arial, sans-serif; }
    .pin {
      display: flex; width: 34px; height: 34px; align-items: center; justify-content: center;
      border: 3px solid #fff; border-radius: 50%; color: #fff; font-size: 15px; font-weight: bold;
      box-shadow: 0 2px 6px #0006;
    }
    .destination { background: #e65100; }
    .driver { background: #17211f; }
    #map-error {
      display: none; position: absolute; z-index: 1000; inset: 12px 12px auto;
      padding: 10px 12px; border-radius: 10px; background: #fff; color: #17211f;
      font: 13px Arial, sans-serif; box-shadow: 0 2px 8px #0003;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="map-error">Map tiles are unavailable. Check your internet connection and try again.</div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map', { zoomControl: true }).setView([8.4542, 124.6319], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    let destinationMarker;
    let driverMarker;
    let hasFittedBounds = false;
    let hadDriver = false;

    function markerIcon(kind, text) {
      return L.divIcon({
        className: '',
        html: '<div class="pin ' + kind + '">' + text + '</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
    }

    window.updateDeliveryMap = function(data) {
      const destination = [data.destination.latitude, data.destination.longitude];
      if (destinationMarker) {
        destinationMarker.setLatLng(destination);
      } else {
        destinationMarker = L.marker(destination, {
          icon: markerIcon('destination', '⌂'),
          title: 'Delivery destination'
        }).addTo(map);
      }

      if (data.driverLocation) {
        const driver = [data.driverLocation.latitude, data.driverLocation.longitude];
        if (driverMarker) {
          driverMarker.setLatLng(driver);
        } else {
          driverMarker = L.marker(driver, {
            icon: markerIcon('driver', 'D'),
            title: 'Driver location'
          }).addTo(map);
        }

        if (!hasFittedBounds || !hadDriver) {
          map.fitBounds(L.latLngBounds([destination, driver]), { padding: [40, 40], maxZoom: 15 });
          hasFittedBounds = true;
        }
        hadDriver = true;
      } else if (!hasFittedBounds) {
        map.setView(destination, 15);
        hasFittedBounds = true;
      }
    };

    map.whenReady(function() {
      window.ReactNativeWebView.postMessage('map-ready');
      setTimeout(function() { map.invalidateSize(); }, 100);
    });

    map.on('tileerror', function() {
      document.getElementById('map-error').style.display = 'block';
    });
    map.on('tileload', function() {
      document.getElementById('map-error').style.display = 'none';
    });
  </script>
</body>
</html>`;

export default function OSMMap({ destination, driverLocation }: OSMMapProps) {
  const webView = useRef<WebView<{}>>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    const payload = JSON.stringify({ destination, driverLocation: driverLocation ?? null })
      .replace(/</g, '\\u003c');
    webView.current?.injectJavaScript(
      `window.updateDeliveryMap(${payload}); true;`,
    );
  }, [destination, driverLocation, isReady]);

  const handleMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data === 'map-ready') setIsReady(true);
  };

  const handleError = (_event: WebViewErrorEvent) => setLoadError(true);

  return (
    <View style={styles.container}>
      <WebView<{} >
        ref={webView}
        source={{ html: INITIAL_MAP_HTML, baseUrl: 'https://appassets.androidplatform.net' }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        onError={handleError}
        style={styles.webView}
        accessibilityLabel="OpenStreetMap delivery map"
      />
      {!isReady && !loadError && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#17211f" />
          <Text style={styles.message}>Loading OpenStreetMap...</Text>
        </View>
      )}
      {loadError && (
        <View style={styles.error}>
          <Text style={styles.message}>Map could not load. Check your internet connection.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: '#e8eee8' },
  webView: { flex: 1, backgroundColor: 'transparent' },
  loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 10 },
  error: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#e8eee8' },
  message: { color: '#17211f', fontSize: 13, textAlign: 'center' },
});
