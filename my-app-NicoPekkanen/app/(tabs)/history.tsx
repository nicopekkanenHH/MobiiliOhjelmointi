import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useCalcHistory } from '../context/_CalcHistoryContext';

export default function HistoryScreen() {
  const router = useRouter();
  const { history, clear } = useCalcHistory();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text style={styles.h1}>History</Text>

        <View style={[styles.card, { flex: 1 }]}>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={{ color: '#94a3b8' }}>Ei laskuhistoriaa vielä.</Text>}
            contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
            renderItem={({ item }) => (
              <Text style={{ color: '#e2e8f0' }}>
                {item.expr} = {item.result}
              </Text>
            )}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={() => router.back()} style={styles.button}>
            <Text style={styles.buttonText}>Back</Text>
          </Pressable>
          <Pressable onPress={clear} style={[styles.buttonGhost, { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }]}>
            <Text style={styles.buttonTextGhost}>Clear history</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, padding: 20, gap: 16 },
  h1: { fontSize: 28, fontWeight: '700', color: '#e2e8f0' },
  card: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    borderRadius: 16,
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#052e16', fontWeight: '700', fontSize: 16 },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextGhost: { color: '#e2e8f0', fontWeight: '700', fontSize: 16 },
});