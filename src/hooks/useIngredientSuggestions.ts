import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import type { CategoryName } from '../types';

// Maps CategoryName to Firestore document ID
const CATEGORY_DOC_IDS: Record<CategoryName, string> = {
  'Fruit shop': 'fruitShop',
  'Butchery': 'butchery',
  'Supermarket': 'supermarket',
};

// Type for all known ingredients by category
export type KnownIngredients = Record<CategoryName, string[]>;

interface UseIngredientSuggestionsReturn {
  knownIngredients: KnownIngredients;
  loading: boolean;
  error: string | null;
  addNewIngredients: (category: CategoryName, ingredients: string[]) => Promise<void>;
  getSuggestions: (category: CategoryName, query: string, limit?: number) => string[];
}

/**
 * Hook to manage ingredient suggestions from Firestore.
 * Fetches known ingredients on mount and provides methods to add new ones.
 */
export function useIngredientSuggestions(): UseIngredientSuggestionsReturn {
  const [knownIngredients, setKnownIngredients] = useState<KnownIngredients>({
    'Fruit shop': [],
    'Butchery': [],
    'Supermarket': [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all ingredients from Firestore on mount
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        setError(null);

        const categories: CategoryName[] = ['Fruit shop', 'Butchery', 'Supermarket'];
        const results: KnownIngredients = {
          'Fruit shop': [],
          'Butchery': [],
          'Supermarket': [],
        };

        // Fetch all categories in parallel
        await Promise.all(
          categories.map(async (category) => {
            const docId = CATEGORY_DOC_IDS[category];
            const docRef = doc(db, 'ingredients', docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const data = docSnap.data();
              results[category] = data.names || [];
            }
          })
        );

        setKnownIngredients(results);
      } catch (err) {
        console.error('Error fetching ingredients:', err);
        setError('Failed to load ingredient suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  /**
   * Add new ingredients to a category in Firestore.
   * Only adds ingredients that don't already exist (case-insensitive check).
   */
  const addNewIngredients = useCallback(
    async (category: CategoryName, ingredients: string[]) => {
      if (ingredients.length === 0) return;

      const docId = CATEGORY_DOC_IDS[category];
      const existingLower = new Set(
        knownIngredients[category].map((i) => i.toLowerCase())
      );

      // Filter to only truly new ingredients (case-insensitive)
      const newIngredients = ingredients.filter(
        (ing) => ing.trim() !== '' && !existingLower.has(ing.toLowerCase())
      );

      if (newIngredients.length === 0) return;

      try {
        const docRef = doc(db, 'ingredients', docId);

        // Use arrayUnion to atomically add new ingredients
        await setDoc(
          docRef,
          { names: arrayUnion(...newIngredients) },
          { merge: true }
        );

        // Update local state
        setKnownIngredients((prev) => ({
          ...prev,
          [category]: [...prev[category], ...newIngredients],
        }));
      } catch (err) {
        console.error(`Error adding ingredients to ${category}:`, err);
        throw err;
      }
    },
    [knownIngredients]
  );

  /**
   * Get filtered suggestions for a given category and query.
   * Case-insensitive prefix match, returns up to `limit` results.
   */
  const getSuggestions = useCallback(
    (category: CategoryName, query: string, limit: number = 10): string[] => {
      const trimmedQuery = query.trim().toLowerCase();

      if (trimmedQuery === '') return [];

      return knownIngredients[category]
        .filter((ingredient) =>
          ingredient.toLowerCase().startsWith(trimmedQuery)
        )
        .slice(0, limit);
    },
    [knownIngredients]
  );

  return {
    knownIngredients,
    loading,
    error,
    addNewIngredients,
    getSuggestions,
  };
}
