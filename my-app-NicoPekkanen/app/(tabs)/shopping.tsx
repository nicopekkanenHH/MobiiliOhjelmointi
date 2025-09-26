import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ShoppingFirebaseScreen from './shopping_firebase';
import ShoppingSQLiteScreen from './shopping_sqlite';

export default function ShoppingScreen() {
  const [mode, setMode] = useState<'sqlite' | 'firebase'>('sqlite');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.switchRow}>
        <Pressable
          onPress={() => setMode('sqlite')}
          style={[styles.button, mode === 'sqlite' && styles.buttonActive]}
        >
          <Text style={styles.buttonText}>SQLite</Text>
        </Pressable>

        <Pressable
          onPress={() => setMode('firebase')}
          style={[styles.button, mode === 'firebase' && styles.buttonActive]}
        >
          <Text style={styles.buttonText}>Firebase</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1 }}>
        {mode === 'sqlite' ? <ShoppingSQLiteScreen /> : <ShoppingFirebaseScreen />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#1e293b',
  },
  button: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonActive: {
    backgroundColor: '#22c55e',
  },
  buttonText: {
    color: '#f1f5f9',
    fontWeight: '700',
  },
});