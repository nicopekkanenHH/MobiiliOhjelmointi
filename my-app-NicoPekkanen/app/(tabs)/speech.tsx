import SegmentedControl from '@react-native-segmented-control/segmented-control';
import * as Speech from 'expo-speech';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Keyboard, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

const LOCALES = [
  { label: 'EN', value: 'en-US' },
  { label: 'FI', value: 'fi-FI' },
  { label: 'SV', value: 'sv-SE' },
];

export default function SpeechScreen() {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);

  const speak = () => {
    const locale = LOCALES[index].value;
    const msg = text.trim();
    if (!msg) return;
    Speech.stop();
    Speech.speak(msg, { language: locale, pitch: 1.0, rate: 1.0 });
    Keyboard.dismiss();
  };

  const stop = () => Speech.stop();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text style={styles.h1}>Teksti puheeksi</Text>
        <Text style={styles.helper}>Valitse kieli ja kirjoita teksti.</Text>

        <View style={styles.card}>
          <SegmentedControl
            values={LOCALES.map(l => l.label)}
            selectedIndex={index}
            onChange={(e) => setIndex(e.nativeEvent.selectedSegmentIndex)}
            style={{ marginBottom: 8 }}
          />

          <Text style={styles.label}>Teksti</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Kirjoita tähän…"
            style={styles.input}
            multiline
          />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <Pressable onPress={speak} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
              <Text style={styles.buttonText}>Speak</Text>
            </Pressable>
            <Pressable onPress={stop} style={({ pressed }) => [styles.buttonGhost, pressed && { opacity: 0.8 }]}>
              <Text style={styles.buttonTextGhost}>Stop</Text>
            </Pressable>
          </View>
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
  card: { backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#334155', padding: 12, borderRadius: 16 },
  label: { color: '#cbd5e1', marginBottom: 6, marginTop: 6 },
  input: {
    backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#334155',
    color: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 12,
    borderRadius: 12, fontSize: 16, minHeight: 100,
  },
  button: { backgroundColor: '#22c55e', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#052e16', fontWeight: '800' },
  buttonPressed: { transform: [{ scale: 0.98 }] },
  buttonGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#334155', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  buttonTextGhost: { color: '#e2e8f0', fontWeight: '800' },
});