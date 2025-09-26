import * as SQLite from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Keyboard, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

type Item = { id: number; title: string; amount: string };

export default function ShoppingSQLiteScreen() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const canAdd = useMemo(() => title.trim().length > 0 && amount.trim().length > 0, [title, amount]);

  useEffect(() => {
    (async () => {
      const database = await SQLite.openDatabaseAsync('shopping.db');
      setDb(database);
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS ShoppingList (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount TEXT NOT NULL,
          title TEXT NOT NULL
        );
      `);
      await refresh(database);
    })();
  }, []);

  const refresh = async (database?: SQLite.SQLiteDatabase) => {
    const d = database ?? db;
    if (!d) return;
    const rows = await d.getAllAsync<Item>('SELECT id, title, amount FROM ShoppingList ORDER BY id DESC;');
    setItems(rows);
  };

  const add = async () => {
    if (!db || !canAdd) return;
    await db.runAsync('INSERT INTO ShoppingList (title, amount) VALUES (?, ?);', [title.trim(), amount.trim()]);
    setTitle(''); setAmount(''); Keyboard.dismiss();
    await refresh();
  };

  const remove = async (id: number) => {
    if (!db) return;
    await db.runAsync('DELETE FROM ShoppingList WHERE id = ?;', [id]);
    await refresh();
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.amount}>{item.amount}</Text>
      </View>
      <Pressable onPress={() => remove(item.id)} style={({ pressed }) => [styles.bought, pressed && { opacity: 0.8 }]}>
        <Text style={styles.boughtText}>bought</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text style={styles.h1}>Ostoslista (SQLite)</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Tuote</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="esim. Maito" style={styles.input} />
          <Text style={styles.label}>Määrä</Text>
          <TextInput value={amount} onChangeText={setAmount} placeholder="esim. 2 l" style={styles.input} onSubmitEditing={add} />
          <Pressable onPress={add} disabled={!canAdd} style={({ pressed }) => [styles.button, (!canAdd)&&styles.buttonDisabled, pressed && canAdd && styles.buttonPressed]}>
            <Text style={styles.buttonText}>Add</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.label}>Lista</Text>
          <FlatList
            data={items}
            keyExtractor={(it) => String(it.id)}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.helper}>Ei ostoksia.</Text>}
            contentContainerStyle={{ gap: 8, paddingVertical: 8, paddingBottom: 120 }}
          />
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
  label: { color: '#cbd5e1', marginTop: 6, marginBottom: 6 },
  input: {
    backgroundColor: '#0b1220',
    borderWidth: 1, borderColor: '#334155',
    color: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, fontSize: 16,
  },
  card: { backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#334155', padding: 12, borderRadius: 16, gap: 6 },
  button: { backgroundColor: '#22c55e', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#052e16', fontWeight: '800' },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { transform: [{ scale: 0.98 }] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 12 },
  title: { color: '#e2e8f0', fontWeight: '700' },
  amount: { color: '#94a3b8' },
  bought: { backgroundColor: '#1f2937', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  boughtText: { color: '#e2e8f0', fontWeight: '800' },
});
