import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import * as SMS from 'expo-sms';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
    FlatList, Modal, Pressable, SafeAreaView, StyleSheet,
    Text, TextInput, View
} from 'react-native';

type ContactRow = {
  id: string;
  name: string;
  phoneNumbers?: { label?: string; number: string }[];
};

export default function ContactsScreen() {
  const router = useRouter();
  const [permission, setPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [all, setAll] = useState<ContactRow[]>([]);
  const [q, setQ] = useState('');
  const [pickerFor, setPickerFor] = useState<ContactRow | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      setPermission(status as any);
      if (status !== 'granted') return;

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
        pageSize: 1000,
        sort: Contacts.SortTypes.FirstName,
      });

      const mapped: ContactRow[] = (data || []).map((c) => ({
        id: c.id,
        name: c.name ?? ([c.firstName, c.lastName].filter(Boolean).join(' ') || 'Nimetön'),
        phoneNumbers: (c.phoneNumbers || []).map(p => ({ label: p.label ?? undefined, number: (p.number || '').trim() })).filter(p => p.number.length > 0),
      }));
      setAll(mapped);
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(c => c.name.toLowerCase().includes(needle));
  }, [all, q]);

  const openDetails = (id: string) => {
    // Detalji erillisessä ruudussa, EI alapalkissa
    router.push(`/contacts/${id}`);
  };

  const startSMS = async (contact: ContactRow) => {
    if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) return;
    if (contact.phoneNumbers.length === 1) {
      const can = await SMS.isAvailableAsync();
      if (!can) { alert('SMS ei ole käytettävissä tällä laitteella.'); return; }
      await SMS.sendSMSAsync([contact.phoneNumbers[0].number], '');
      return;
    }
    // Jos useampi numero → näytä valintamodaali
    setPickerFor(contact);
  };

  const chooseNumber = async (num: string) => {
    setPickerFor(null);
    const can = await SMS.isAvailableAsync();
    if (!can) { alert('SMS ei ole käytettävissä tällä laitteella.'); return; }
    await SMS.sendSMSAsync([num], '');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text style={styles.h1}>Kontaktit</Text>
        {permission !== 'granted' && (
          <Text style={styles.error}>Salli kontaktien luku asetuksista käyttääksesi tätä näkymää.</Text>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Haku (nimi)</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Aloita kirjoittamaan nimeä"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.label}>Yhteystiedot</Text>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 8, paddingVertical: 8, paddingBottom: 120 }}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Pressable onPress={() => openDetails(item.id)} style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.subtle}>
                    {(item.phoneNumbers && item.phoneNumbers[0]?.number) ? item.phoneNumbers[0].number : 'Ei numeroa'}
                  </Text>
                </Pressable>
                {!!item.phoneNumbers?.length && (
                  <Pressable
                    onPress={() => startSMS(item)}
                    style={({ pressed }) => [styles.smsBtn, pressed && { opacity: 0.85 }]}
                  >
                    <Text style={styles.smsBtnText}>SMS</Text>
                  </Pressable>
                )}
              </View>
            )}
            ListEmptyComponent={<Text style={styles.helper}>Ei kontakteja tai haku ei tuottanut tuloksia.</Text>}
          />
        </View>
      </View>

      {/* Numeron valintamodaali */}
      <Modal visible={!!pickerFor} transparent animationType="fade" onRequestClose={() => setPickerFor(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.label}>Valitse numero ({pickerFor?.name})</Text>
            {pickerFor?.phoneNumbers?.map((p, idx) => (
              <Pressable key={`${p.number}-${idx}`} onPress={() => chooseNumber(p.number)} style={styles.modalItem}>
                <Text style={styles.modalItemText}>{p.number} {p.label ? `(${p.label})` : ''}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setPickerFor(null)} style={[styles.modalItem, { marginTop: 8 }]}>
              <Text style={[styles.modalItemText, { color: '#94a3b8' }]}>Peruuta</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, padding: 16, gap: 12 },
  h1: { fontSize: 24, fontWeight: '800', color: '#e2e8f0' },
  error: { color: '#fca5a5' },
  helper: { color: '#94a3b8' },
  label: { color: '#cbd5e1', marginBottom: 6 },
  input: {
    backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#334155',
    color: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, fontSize: 16,
  },
  card: { backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#334155', padding: 12, borderRadius: 16, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 12 },
  name: { color: '#e2e8f0', fontWeight: '700' },
  subtle: { color: '#94a3b8' },
  smsBtn: { backgroundColor: '#22c55e', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  smsBtnText: { color: '#052e16', fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#334155', borderRadius: 16, padding: 16 },
  modalItem: { borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 12, marginTop: 6 },
  modalItemText: { color: '#e2e8f0', fontWeight: '600' },
});