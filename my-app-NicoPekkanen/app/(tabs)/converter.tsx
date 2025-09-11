import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type Rates = Record<string, number>;
type Direction = 'EUR_TO_OTHER' | 'OTHER_TO_EUR';

export default function ConverterScreen() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [currency, setCurrency] = useState('usd'); 
  const [direction, setDirection] = useState<Direction>('OTHER_TO_EUR');
  const [amountRaw, setAmountRaw] = useState('');
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(
          'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json'
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setRates(json?.eur ?? {});
      } catch (e) {
        if (!cancelled) {
          setErr('Kurssien haku epäonnistui. Tarkista yhteys ja yritä uudelleen.');
          setRates(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currencies = useMemo(() => {
    if (!rates) return ['eur'];
    return ['eur', ...Object.keys(rates).sort()];
  }, [rates]);

  const parsedAmount = useMemo(() => {
    const normalized = amountRaw.replace(',', '.').trim();
    const n = Number(normalized);
    return Number.isFinite(n) ? n : NaN;
  }, [amountRaw]);

  const canConvert = rates && !loading && !Number.isNaN(parsedAmount) && parsedAmount >= 0;

  const fmt = (n: number) => {
    const s = Number.isInteger(n) ? n.toString() : n.toFixed(6);
    return s.replace(/0+$/, '').replace(/\.$/, '');
  };

  const convert = () => {
    Keyboard.dismiss();
    if (!rates) return;
    if (Number.isNaN(parsedAmount)) {
      Alert.alert('Virheellinen syöte', 'Syötä kelvollinen numero.');
      return;
    }
    const amt = parsedAmount;
    const cur = currency.toLowerCase();
    const rate = cur === 'eur' ? 1 : rates[cur];

    if (!rate) {
      Alert.alert('Tuntematon valuutta', `Kurssia ei löytynyt valuutalle ${currency.toUpperCase()}.`);
      return;
    }

    let value: number;
    if (direction === 'OTHER_TO_EUR') {
      value = amt / rate;
      setResult(`= ${fmt(value)} EUR`);
    } else {
      value = amt * rate;
      setResult(`= ${fmt(value)} ${currency.toUpperCase()}`);
    }
  };

  const switchDirection = () => {
    setDirection(d => (d === 'OTHER_TO_EUR' ? 'EUR_TO_OTHER' : 'OTHER_TO_EUR'));
    setResult('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text style={styles.h1}>Valuuttamuunnin</Text>
        <Text style={styles.helper}>
          Hakee kurssit verkosta (EUR-pohjaiset). Valitse valuutta ja suunta, syötä summa ja paina{' '}
          <Text style={styles.bold}>Convert</Text>.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Suunta</Text>
          <Pressable
            onPress={switchDirection}
            style={({ pressed }) => [styles.switchBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.switchText}>
              {direction === 'OTHER_TO_EUR' ? 'Muu → EUR' : 'EUR → Muu'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.label}>Valuutta</Text>
            {loading && <ActivityIndicator />}
            {err && <Text style={styles.error}>{err}</Text>}
            {!loading && rates && (
              <View style={{ height: 50, justifyContent: 'center' }}>
                <Picker
                  selectedValue={currency}
                  onValueChange={(val) => {
                    setCurrency(String(val));
                    setResult('');
                  }}
                  style={styles.picker}
                  itemStyle={Platform.OS === 'ios' ? { textAlign: 'center' } : undefined} // iOS hienosäätö
                >
                  {currencies.map((c) => (
                    <Picker.Item key={c} label={c.toUpperCase()} value={c} />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.label}>Summa</Text>
            <TextInput
              value={amountRaw}
              onChangeText={setAmountRaw}
              placeholder={direction === 'OTHER_TO_EUR' ? 'esim. 100.00' : 'esim. 50.00'}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
              inputMode="decimal"
              returnKeyType="done"
              style={styles.input}
              onSubmitEditing={convert}
            />
          </View>
        </View>

        {/* Nappi */}
        <Pressable
          onPress={convert}
          disabled={!canConvert}
          style={({ pressed }) => [
            styles.button,
            (!canConvert || loading) && styles.buttonDisabled,
            pressed && !loading && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.buttonText}>{loading ? 'Haetaan…' : 'Convert'}</Text>
        </Pressable>

        {/* Tulos */}
        <View style={styles.card}>
          <Text style={styles.result}>{result || '—'}</Text>
          {rates && (
            <Text style={styles.helperSmall}>
              Kurssit: EUR-pohjaiset (palvelun “latest” versio)
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, padding: 20, gap: 16 },
  h1: { fontSize: 28, fontWeight: '700', color: '#e2e8f0' },
  helper: { color: '#94a3b8' },
  helperSmall: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  bold: { fontWeight: '700', color: '#e2e8f0' },

  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },

  
  picker: {
    color: '#e2e8f0',
  },

  label: { color: '#cbd5e1', marginBottom: 6 },

  input: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
  },

  card: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    borderRadius: 16,
    gap: 6,
  },

  switchBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  switchText: { color: '#052e16', fontWeight: '800' },

  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#052e16', fontWeight: '700', fontSize: 18 },
  buttonDisabled: { opacity: 0.5 },

  result: { color: '#e2e8f0', fontSize: 24, fontWeight: '800', textAlign: 'center' },

  error: { color: '#fca5a5' },
});