import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type Meal = {
  idMeal: string;
  strMeal: string;       // title
  strMealThumb: string;  // thumbnail url
};

export default function RecipesScreen() {
  const [ingredient, setIngredient] = useState('tomato'); // esitäyttö helpottaa testausta
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSearch = useMemo(() => ingredient.trim().length > 0, [ingredient]);

  const fetchMeals = useCallback(async () => {
    if (!canSearch) return;
    setLoading(true);
    setError(null);
    try {
      const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
        ingredient.trim()
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // API palauttaa { meals: null } jos ei osumia
      setMeals(json.meals ?? []);
    } catch (e: any) {
      setError('Haku epäonnistui. Tarkista yhteys tai yritä uudelleen.');
      setMeals(null);
    } finally {
      setLoading(false);
    }
  }, [ingredient, canSearch]);

  useEffect(() => {
    fetchMeals();
  }, []); 

  const onSubmit = () => {
    Keyboard.dismiss();
    fetchMeals();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text style={styles.h1}>Reseptien haku</Text>
        <Text style={styles.helper}>
          Hae reseptejä raaka-aineen perusteella (esim. <Text style={styles.code}>tomato</Text>, <Text style={styles.code}>chicken</Text>).
        </Text>

        <View style={styles.searchRow}>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Raaka-aine</Text>
            <TextInput
              value={ingredient}
              onChangeText={setIngredient}
              placeholder="esim. tomato"
              returnKeyType="search"
              onSubmitEditing={onSubmit}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Pressable
            onPress={onSubmit}
            disabled={!canSearch || loading}
            style={({ pressed }) => [
              styles.button,
              (!canSearch || loading) && styles.buttonDisabled,
              pressed && !loading && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>{loading ? 'Haetaan…' : 'Hae'}</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { flex: 1 }]}>
          {error && <Text style={styles.error}>{error}</Text>}
          {loading && (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator />
            </View>
          )}

          {!loading && meals && meals.length === 0 && (
            <Text style={styles.helper}>Ei reseptejä haulla “{ingredient.trim()}”.</Text>
          )}

          {!loading && Array.isArray(meals) && meals.length > 0 && (
            <FlatList
              data={meals}
              keyExtractor={(item) => item.idMeal}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => <MealRow meal={item} />}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function MealRow({ meal }: { meal: Meal }) {
    const router = useRouter();
  return (
    <Pressable
    onPress={() => router.push(`/(tabs)/recipes/${meal.idMeal}`)}
    style={styles.row}
  >
    <Image source={{ uri: meal.strMealThumb }} style={styles.thumb} resizeMode="cover" />
    <Text style={styles.title} numberOfLines={2}>{meal.strMeal}</Text>
  </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, padding: 20, gap: 16 },
  h1: { fontSize: 28, fontWeight: '700', color: '#e2e8f0' },
  helper: { color: '#94a3b8' },
  code: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), color: '#e2e8f0' },

  searchRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },
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
    height: 48,
  },
  buttonText: { color: '#052e16', fontWeight: '700', fontSize: 16 },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { transform: [{ scale: 0.98 }] },

  card: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    borderRadius: 16,
    gap: 6,
  },

  error: { color: '#fca5a5' },

  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 10,
  },
  thumb: {
    width: 80,   
    height: 80,  
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  title: { flex: 1, color: '#e2e8f0', fontWeight: '600' },
});