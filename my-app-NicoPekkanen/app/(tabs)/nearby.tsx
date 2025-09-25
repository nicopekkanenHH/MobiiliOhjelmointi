import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

type Poi = {
  id: string;
  lat: number;
  lon: number;
  name?: string;
  address?: string;
};

const DEFAULT_RADIUS_M = 1500; // 1.5 km

// OSM amenity-tyyppejä: 'restaurant', 'cafe', 'bar', 'fast_food', 'bicycle_rental' (kaupunkipyörät),
// bussipysäkki: "public_transport=platform" + "bus=yes" (tehdään helppo: 'bus_stop' tagi)
const PRESETS = [
  { key: 'restaurant', label: 'Ravintolat' },
  { key: 'cafe', label: 'Kahvilat' },
  { key: 'bar', label: 'Baarit' },
  { key: 'bus_stop', label: 'Bussipysäkit' },
  { key: 'bicycle_rental', label: 'Pyöräasemat' }, // huom: OSM tagit vaihtelevat alueittain
];

export default function NearbyScreen() {
  const [permission, setPermission] = useState<Location.PermissionStatus | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(false);
  const [pois, setPois] = useState<Poi[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('restaurant');  // vapaa teksti (OSM amenity)
  const [radius, setRadius] = useState(DEFAULT_RADIUS_M);
  const mapRef = useRef<MapView | null>(null);

  // Pyyntö: sijaintilupa -> hae sijainti -> keskitys
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status);
      if (status !== 'granted') {
        setError('Sijaintilupaa ei myönnetty.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const reg: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
      setRegion(reg);
    })().catch((e) => {
      console.warn(e);
      setError('Sijainnin haku epäonnistui.');
    });
  }, []);

  const centerLatLon = useMemo(() => {
    if (!region) return null;
    return { lat: region.latitude, lon: region.longitude };
  }, [region]);

  const buildOverpassQuery = useCallback((amenity: string, lat: number, lon: number, rad: number) => {
    // Rakennetaan Overpass QL: hae node- ja way-kohteita halutulla tagilla säteellä
    // Bussipysäkeille käytetään tagia "highway=bus_stop"
    const filter =
      amenity === 'bus_stop'
        ? `node(around:${rad},${lat},${lon})["highway"="bus_stop"];`
        : amenity === 'bicycle_rental'
        ? `node(around:${rad},${lat},${lon})["amenity"="bicycle_rental"];`
        : `node(around:${rad},${lat},${lon})["amenity"="${amenity}"];`;

    // Palautetaan myös address-tagit jos löytyy
    return `
      [out:json][timeout:25];
      (
        ${filter}
      );
      out body;
      >;
      out skel qt;
    `;
  }, []);

  const fetchPOIs = useCallback(async () => {
    if (!centerLatLon) return;
    setLoading(true);
    setError(null);
    try {
      const q = buildOverpassQuery(query.trim(), centerLatLon.lat, centerLatLon.lon, radius);
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: `data=${encodeURIComponent(q)}`,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const list: Poi[] = (json.elements || [])
        .filter((el: any) => el.type === 'node' && typeof el.lat === 'number' && typeof el.lon === 'number')
        .map((el: any) => {
          const t = el.tags || {};
          const name: string | undefined = t.name;
          const addr = [
            t['addr:street'],
            t['addr:housenumber'],
            t['addr:city'] || t['addr:suburb'],
          ]
            .filter(Boolean)
            .join(' ');
          return {
            id: String(el.id),
            lat: el.lat,
            lon: el.lon,
            name,
            address: addr || undefined,
          };
        });

      setPois(list);
      // Säädä kartan näkyvyys markkereille kevyesti (vain jos markkereita on)
      if (list.length > 0 && mapRef.current) {
        const latitudes = list.map(p => p.lat);
        const longitudes = list.map(p => p.lon);
        const minLat = Math.min(...latitudes, centerLatLon.lat);
        const maxLat = Math.max(...latitudes, centerLatLon.lat);
        const minLon = Math.min(...longitudes, centerLatLon.lon);
        const maxLon = Math.max(...longitudes, centerLatLon.lon);
        mapRef.current.fitToCoordinates(
          [
            { latitude: minLat, longitude: minLon },
            { latitude: maxLat, longitude: maxLon },
          ],
          { edgePadding: { top: 60, left: 40, right: 40, bottom: 160 }, animated: true }
        );
      }
    } catch (e: any) {
      console.warn(e);
      setError('Kohteiden haku epäonnistui. Yritä uudelleen.');
      setPois([]);
    } finally {
      setLoading(false);
    }
  }, [buildOverpassQuery, centerLatLon, query, radius]);

  // Hae automaattisesti kun saadaan region
  useEffect(() => {
    if (region) fetchPOIs();
  }, [region]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRecenter = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const reg: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
      setRegion(reg);
      mapRef.current?.animateToRegion(reg, 500);
    } catch (e) {
      Alert.alert('Virhe', 'Sijainnin päivitys epäonnistui.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text style={styles.h1}>Lähellä</Text>
        <Text style={styles.helper}>Näytä lähelläsi olevat kohteet OpenStreetMapin (Overpass) avulla.</Text>

        {/* Hakualue */}
        <View style={styles.controls}>
          <View style={styles.row}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="amenity esim. restaurant / cafe / bar"
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { flex: 1 }]}
              returnKeyType="search"
              onSubmitEditing={fetchPOIs}
            />
            <Pressable onPress={fetchPOIs} style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}>
              <Text style={styles.btnText}>{loading ? 'Haetaan…' : 'Näytä'}</Text>
            </Pressable>
          </View>

          <View style={styles.presetRow}>
            {PRESETS.map(p => (
              <Pressable
                key={p.key}
                onPress={() => { setQuery(p.key); fetchPOIs(); }}
                style={({ pressed }) => [styles.pill, pressed && { opacity: 0.8 }, query === p.key && styles.pillActive]}
              >
                <Text style={[styles.pillText, query === p.key && styles.pillTextActive]}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Kartta */}
        <View style={styles.mapCard}>
          {!region ? (
            <View style={styles.centered}>
              {permission === 'granted' ? (
                <>
                  <ActivityIndicator />
                  <Text style={styles.helper}>Haetaan sijaintia…</Text>
                </>
              ) : (
                <Text style={styles.error}>Sijaintilupaa ei ole myönnetty.</Text>
              )}
            </View>
          ) : (
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              initialRegion={region}
              showsUserLocation
              showsMyLocationButton={false}
              toolbarEnabled={false}
              loadingEnabled
              provider={Platform.OS === 'ios' ? undefined : undefined} // Apple Maps iOS, Google Android oletuksena
            >
              {/* Oma sijainti keskitysnappi */}
              {/* Markerit */}
              {pois.map(p => (
                <Marker
                  key={p.id}
                  coordinate={{ latitude: p.lat, longitude: p.lon }}
                  title={p.name || 'Nimetön kohde'}
                  description={p.address}
                />
              ))}
            </MapView>
          )}

          {/* Kelluva keskitysnappi */}
          <Pressable onPress={onRecenter} style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}>
            <Text style={styles.fabText}>⦿</Text>
          </Pressable>
        </View>

        {/* Alapalkin info / virheet */}
        <View style={styles.footer}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!error && <Text style={styles.helperSmall}>Säde: ~{Math.round(radius / 100) / 10} km • Tuloksia: {pois.length}</Text>}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, padding: 16, gap: 12 },
  h1: { fontSize: 24, fontWeight: '800', color: '#e2e8f0' },
  helper: { color: '#94a3b8' },
  helperSmall: { color: '#94a3b8', fontSize: 12 },
  error: { color: '#fca5a5' },

  controls: { gap: 8 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },

  input: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 16,
  },

  btn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: { transform: [{ scale: 0.98 }] },
  btnText: { color: '#052e16', fontWeight: '800' },

  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderWidth: 1, borderColor: '#334155', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#0b1220',
  },
  pillActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  pillText: { color: '#e2e8f0', fontWeight: '700' },
  pillTextActive: { color: '#052e16' },

  mapCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },

  fab: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#22c55e',
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)',
  },
  fabText: { color: '#052e16', fontSize: 18, fontWeight: '900' },

  footer: { paddingTop: 6 },
});