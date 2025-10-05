import * as Contacts from 'expo-contacts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function ContactDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<Contacts.Contact | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.getPermissionsAsync();
      if (status !== 'granted') return;
      if (!id) return;
      const c = await Contacts.getContactByIdAsync(id as string, [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers]);
      setContact(c ?? null);
    })();
  }, [id]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>

        <Text style={styles.h1}>Kontaktin tiedot</Text>
        {!contact ? (
          <Text style={styles.helper}>Ladataan…</Text>
        ) : (
          <View style={styles.card}>
            <Text style={styles.name}>{contact.name ?? 'Nimetön'}</Text>
            <Text style={styles.label}>Puhelimet</Text>
            {(contact.phoneNumbers ?? []).length === 0 && <Text style={styles.helper}>Ei numeroita</Text>}
            {(contact.phoneNumbers ?? []).map((p, i) => (
              <Text style={styles.rowText} key={i}>{p.label ? `${p.label}: ` : ''}{p.number}</Text>
            ))}

            <Text style={[styles.label, { marginTop: 12 }]}>Sähköpostit</Text>
            {(contact.emails ?? []).length === 0 && <Text style={styles.helper}>Ei sähköposteja</Text>}
            {(contact.emails ?? []).map((e, i) => (
              <Text style={styles.rowText} key={i}>{e.label ? `${e.label}: ` : ''}{e.email}</Text>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, padding: 16, gap: 12 },
  h1: { fontSize: 24, fontWeight: '800', color: '#e2e8f0' },
  helper: { color: '#94a3b8' },
  card: { backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#334155', padding: 12, borderRadius: 16, gap: 8 },
  name: { color: '#e2e8f0', fontSize: 20, fontWeight: '800' },
  label: { color: '#cbd5e1', marginTop: 6 },
  rowText: { color: '#e2e8f0' },
  backBtn: { paddingVertical: 8, paddingRight: 8 },
  backText: { color: '#e2e8f0', fontWeight: '700' }
});