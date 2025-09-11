import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type MealDetail = {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string | null;
  strTags: string | null;
  [k: string]: any;
};

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setErr(null);
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(
          String(id)
        )}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const m = (json.meals && json.meals[0]) || null;
        if (!cancelled) setMeal(m);
      } catch (e) {
        if (!cancelled) setErr('Tietojen haku epäonnistui.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const ingredients = useMemo(() => {
    if (!meal) return [];
    const rows: { name: string; measure: string }[] = [];
    for (let i = 1; i <= 20; i++) {
      const name = (meal[`strIngredient${i}`] || '').trim();
      const measure = (meal[`strMeasure${i}`] || '').trim();
      if (name) rows.push({ name, measure });
    }
    return rows;
  }, [meal]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Takaisin</Text>
        </Pressable>
        {loading && (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator />
          </View>
        )}

        {!loading && err && <Text style={styles.error}>{err}</Text>}

        {!loading && meal && (
          <>
            <Text style={styles.title}>{meal.strMeal}</Text>
            {meal.strMealThumb ? (
              <Image
                source={{ uri: meal.strMealThumb }}
                style={styles.hero}
                resizeMode="cover"
                accessibilityLabel={meal.strMeal}
              />
            ) : null}

            <View style={styles.metaRow}>
              {meal.strCategory ? <Text style={styles.metaPill}>{meal.strCategory}</Text> : null}
              {meal.strArea ? <Text style={styles.metaPill}>{meal.strArea}</Text> : null}
              {meal.strTags ? (
                <Text style={styles.metaPill}>#{meal.strTags.split(',').join(' #')}</Text>
              ) : null}
            </View>

            <Text style={styles.h2}>Ainekset</Text>
            <View style={styles.card}>
              {ingredients.length === 0 ? (
                <Text style={styles.helper}>Ei listattuja ainesosia.</Text>
              ) : (
                ingredients.map((it, idx) => (
                  <View key={idx} style={styles.ingRow}>
                    <Text style={styles.ingName}>{it.name}</Text>
                    <Text style={styles.ingMeasure}>{it.measure}</Text>
                  </View>
                ))
              )}
            </View>

            {meal.strInstructions ? (
              <>
                <Text style={styles.h2}>Valmistusohje</Text>
                <View style={styles.card}>
                  <Text style={styles.body}>{meal.strInstructions}</Text>
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { padding: 20, gap: 16 },
  error: { color: '#fca5a5' },
  helper: { color: '#94a3b8' },

  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#22c55e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backText: {
    color: '#052e16',
    fontWeight: '700',
    fontSize: 16,
  },
  
  title: { fontSize: 26, fontWeight: '800', color: '#e2e8f0' },
  hero: {
    width: '100%',
    height: 220, 
    borderRadius: 14,
    backgroundColor: '#111827',
  },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaPill: {
    color: '#052e16',
    backgroundColor: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '700',
  },

  h2: { fontSize: 18, fontWeight: '700', color: '#e2e8f0', marginTop: 8 },
  card: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    borderRadius: 16,
    gap: 6,
  },
  body: { color: '#e2e8f0', lineHeight: 22 },

  ingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ingName: { color: '#e2e8f0', fontWeight: '600' },
  ingMeasure: { color: '#94a3b8' },
});