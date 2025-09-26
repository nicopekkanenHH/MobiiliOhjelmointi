import { db } from '@/firebaseConfig'; // jos alias ei toimi, käytä: '../../firebaseConfig'
import { StatusBar } from 'expo-status-bar';
import { onValue, push, ref, remove } from 'firebase/database';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Keyboard, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

type Item = { id: string; title: string; amount: string };

const LIST_PATH = 'shoppingList';

export default function ShoppingFirebaseScreen() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canAdd = useMemo(() => title.trim().length > 0 && amount.trim().length > 0, [title, amount]);

  useEffect(() => {
    try {
      const listRef = ref(db, LIST_PATH);
      const unsub = onValue(
        listRef,
        (snap) => {
          const val = snap.val() as Record<string, { title: string; amount: string }> | null;
          if (!val) { setItems([]); return; }
          const arr: Item[] = Object.entries(val)
            .map(([key, v]) => ({ id: key, title: v.title, amount: v.amount }))
            .sort((a, b) => (a.id < b.id ? 1 : -1));
          setItems(arr);
          setError(null);
        },
        (err) => {
          console.log('onValue error:', err);
          setError(err?.message ?? 'Luku epäonnistui (säännöt/URL?)');
        }
      );
      return () => unsub();
    } catch (e: any) {
      console.log('subscribe catch:', e);
      setError(e?.message ?? 'Virhe tilauksen alustuksessa');
    }
  }, []);

  const add = async () => {
    if (!canAdd) return;
    try {
      await push(ref(db, LIST_PATH), { title: title.trim(), amount: amount.trim() });
      setTitle('');
      setAmount('');
      Keyboard.dismiss();
    } catch (e: any) {
      console.log('push error:', e);
      Alert.alert('Tallennus epäonnistui', e?.message ?? 'Tuntematon virhe (säännöt/URL?)');
    }
  };

  const removeItem = async (id: string) => {
    try {
      await remove(ref(db, `${LIST_PATH}/${id}`));
    } catch (e: any) {
      console.log('remove error:', e);
      Alert.alert('Poisto epäonnistui', e?.message ?? 'Tuntematon virhe (säännöt/URL?)');
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.amount}>{item.amount}</Text>
      </View>
      <Pressable
        onPress={() => removeItem(item.id)}
        style={({ pressed }) => [styles.bought, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.boughtText}>bought</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text style={styles.h1}>Ostoslista (Firebase)</Text>
        {error ? <Text style={{ color: '#fca5a5' }}>Virhe: {error}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.label}>Tuote</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="esim. Leivät" style={styles.input} />
          <Text style={styles.label}>Määrä</Text>
          <TextInput value={amount} onChangeText={setAmount} placeholder="esim. 3 kpl" style={styles.input} onSubmitEditing={add} />
          <Pressable
            onPress={add}
            disabled={!canAdd}
            style={({ pressed }) => [styles.button, !canAdd && styles.buttonDisabled, pressed && canAdd && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Add</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.label}>Lista</Text>
          <FlatList
            data={items}
            keyExtractor={(it) => it.id}
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
    color: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
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