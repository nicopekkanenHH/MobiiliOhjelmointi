import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    FlatList,
    Keyboard,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface ShopRow { id: string; text: string }

export default function ShoppingScreen() {
  const [input, setInput] = useState('');
  const [items, setItems] = useState<ShopRow[]>([]);

  const addItem = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setItems(list => [{ id: `${Date.now()}-${Math.random()}`, text: trimmed }, ...list]);
    setInput('');
    Keyboard.dismiss();
  };

  const clear = () => setItems([]);
  const remove = (id: string) => setItems(list => list.filter(x => x.id !== id));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text style={styles.h1}>Ostoslista</Text>
        <Text style={styles.helper}>Syötä ostos ja lisää listalle FlatListin avulla.</Text>

        <View style={styles.inputsRow}>
          <View style={[styles.inputCol, { flex: 1.4 }]}>
            <Text style={styles.label}>Ostos</Text>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="esim. maito"
              returnKeyType="done"
              style={styles.input}
              onSubmitEditing={addItem}
            />
          </View>
          <Pressable onPress={addItem} style={styles.button}>
            <Text style={styles.buttonText}>Add</Text>
          </Pressable>
          <Pressable
            onPress={clear}
            style={[styles.buttonGhost, { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }]}
          >
            <Text style={styles.buttonTextGhost}>Clear</Text>
          </Pressable>
        </View>

        <View style={[styles.resultCard, { flex: 1 }]}>
          <Text style={styles.resultLabel}>Lista</Text>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.helper}>Lista on tyhjä.</Text>}
            contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
            style={{ marginTop: 8 }}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: '#334155',
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text style={{ color: '#e2e8f0' }}>{item.text}</Text>
                <Pressable
                  onPress={() => remove(item.id)}
                  style={({ pressed }) => [
                    { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={styles.buttonTextGhost}>Delete</Text>
                </Pressable>
              </View>
            )}
          />
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

  inputsRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },
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

  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#052e16', fontWeight: '700', fontSize: 18 },

  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#334155',
  },
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
});
