import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Dish } from '../types';

const COLLECTION_NAME = 'dishes';

interface UseFirestoreReturn {
  dishes: Dish[];
  loading: boolean;
  error: string | null;
  addDish: (dish: Dish) => Promise<void>;
  updateDish: (dish: Dish) => Promise<void>;
  deleteDish: (id: string) => Promise<void>;
  importDishes: (dishes: Dish[]) => Promise<void>;
}

export function useFirestore(): UseFirestoreReturn {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dishesRef = collection(db, COLLECTION_NAME);

    const unsubscribe = onSnapshot(
      dishesRef,
      (snapshot) => {
        const dishList: Dish[] = [];
        snapshot.forEach((doc) => {
          dishList.push(doc.data() as Dish);
        });
        setDishes(dishList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError('Failed to load dishes. Check your Firebase configuration.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addDish = useCallback(async (dish: Dish) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, dish.id);
      await setDoc(docRef, dish);
    } catch (err) {
      console.error('Error adding dish:', err);
      throw err;
    }
  }, []);

  const updateDish = useCallback(async (dish: Dish) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, dish.id);
      await setDoc(docRef, dish);
    } catch (err) {
      console.error('Error updating dish:', err);
      throw err;
    }
  }, []);

  const deleteDish = useCallback(async (id: string) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting dish:', err);
      throw err;
    }
  }, []);

  const importDishes = useCallback(async (newDishes: Dish[]) => {
    try {
      const batch = writeBatch(db);
      const existingIds = new Set(dishes.map((d) => d.id));

      for (const dish of newDishes) {
        if (!existingIds.has(dish.id)) {
          const docRef = doc(db, COLLECTION_NAME, dish.id);
          batch.set(docRef, dish);
        }
      }

      await batch.commit();
    } catch (err) {
      console.error('Error importing dishes:', err);
      throw err;
    }
  }, [dishes]);

  return {
    dishes,
    loading,
    error,
    addDish,
    updateDish,
    deleteDish,
    importDishes,
  };
}
