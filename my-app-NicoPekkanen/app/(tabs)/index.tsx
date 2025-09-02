import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Op = '+' | '-';

interface CalcRow {
  id: string;
  expr: string;
  result: string;
}

export default function CalculatorScreen() {
  const [aRaw, setARaw] = useState('');
  const [bRaw, setBRaw] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [lastOp, setLastOp] = useState<Op | null>(null);
  const [history, setHistory] = useState<CalcRow[]>([]);

  const validPattern = /^-?\d*(?:[\.,]\d*)?$/;
  const aValid = useMemo(() => validPattern.test(aRaw), [aRaw]);
  const bValid = useMemo(() => validPattern.test(bRaw), [bRaw]);

  const parseNumber = (s: string): number | null => {
    if (!s) return null;
    if (!validPattern.test(s)) return null;
    const normalized = s.replace(',', '.');
    if (normalized === '-' || normalized === '.' || normalized === '-.' ) return null;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  };

  const a = useMemo(() => parseNumber(aRaw), [aRaw]);
  const b = useMemo(() => parseNumber(bRaw), [bRaw]);

  const inputsMissing = a === null || b === null;
  const hasErrors = !aValid || !bValid || inputsMissing;

  const formatNumber = (n: number) =>
    Number.isInteger(n) ? n.toString() : n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');

  const addToHistory = (expr: string, res: string) => {
    setHistory(h => [{ id: `${Date.now()}-${Math.random()}`, expr, result: res }, ...h]);
  };

  const compute = (op: Op) => {
    if (a === null || b === null) {
      setResult('Syötteet puuttuvat tai ovat virheellisiä');
      setLastOp(null);
      return;
    }
    const value = op === '+' ? a + b : a - b;
    const formatted = formatNumber(value);
    setResult(formatted);
    setLastOp(op);
    addToHistory(`${formatNumber(a)} ${op} ${formatNumber(b)}`, formatted);
  };

  const clearAll = () => {
    setARaw('');
    setBRaw('');
    setResult(null);
    setLastOp(null);
  };

  const clearHistory = () => setHistory([]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text style={styles.h1}>Laskin</Text>
        <Text style={styles.helper}>
          Syötä kaksi numeroa. Desimaalierotin voi olla "," tai ".". Negatiiviset luvut ok.
        </Text>

        <View style={styles.inputsRow}>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Luku A</Text>
            <TextInput
              value={aRaw}
              onChangeText={setARaw}
              placeholder="esim. 12,5"
              accessibilityLabel="Ensimmäinen luku"
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
              inputMode="decimal"
              returnKeyType="done"
              style={[styles.input, !aValid && styles.inputError]}
            />
            {!aValid && <Text style={styles.error}>Virheellinen syöte</Text>}
          </View>

          <View style={styles.inputCol}>
            <Text style={styles.label}>Luku B</Text>
            <TextInput
              value={bRaw}
              onChangeText={setBRaw}
              placeholder="esim. 3.75"
              accessibilityLabel="Toinen luku"
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
              inputMode="decimal"
              returnKeyType="done"
              style={[styles.input, !bValid && styles.inputError]}
            />
            {!bValid && <Text style={styles.error}>Virheellinen syöte</Text>}
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <CalcButton title="+" onPress={() => compute('+')} disabled={hasErrors} />
          <CalcButton title="-" onPress={() => compute('-')} disabled={hasErrors} />
          <CalcButton title="Tyhjennä" onPress={clearAll} variant="ghost" />
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Tulos</Text>
          <Text style={styles.resultValue} accessibilityRole="header">
            {result === null ? '–' : result}
          </Text>
          {hasErrors && (
            <Text style={styles.resultHint}>
              Varmista että molemmat kentät sisältävät kelvollisen numeron.
            </Text>
          )}
          {lastOp && result !== null && (
            <Text style={styles.opNote}>Viimeisin lasku: A {lastOp} B</Text>
          )}
        </View>

        <View style={[styles.resultCard, { flex: 1 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.resultLabel}>Historia</Text>
            <Pressable
              onPress={clearHistory}
              style={({ pressed }) => [
                styles.buttonGhost,
                { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.buttonTextGhost}>Clear history</Text>
            </Pressable>
          </View>

          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.helper}>Ei laskuhistoriaa vielä.</Text>}
            contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#334155',
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text style={{ color: '#e2e8f0' }}>{item.expr}</Text>
                <Text style={{ color: '#94a3b8', fontWeight: '700' }}>= {item.result}</Text>
              </View>
            )}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function CalcButton({
  title,
  onPress,
  disabled,
  variant = 'solid',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'solid' | 'ghost';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'ghost' && styles.buttonGhost,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonText, variant === 'ghost' && styles.buttonTextGhost]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, padding: 20, gap: 16 },
  h1: { fontSize: 28, fontWeight: '700', color: '#e2e8f0' },
  helper: { color: '#94a3b8' },

  inputsRow: { flexDirection: 'row', gap: 12 },
  inputCol: { flex: 1 },
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
  inputError: { borderColor: '#f87171', backgroundColor: '#201014' },
  error: { color: '#fca5a5', marginTop: 6, fontSize: 12 },

  buttonsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#334155',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { transform: [{ scale: 0.98 }] },
  buttonText: { color: '#052e16', fontWeight: '700', fontSize: 18 },
  buttonTextGhost: { color: '#e2e8f0' },

  resultCard: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    borderRadius: 16,
    gap: 6,
    marginTop: 8,
  },
  resultLabel: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' },
  resultValue: { color: '#e2e8f0', fontSize: 32, fontWeight: '800' },
  resultHint: { color: '#94a3b8' },
  opNote: { color: '#64748b', fontSize: 12 },
});