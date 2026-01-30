import { vi } from 'vitest';
import type { Dish, CategoryName } from '../../types';

// Mock dish data for tests
export const mockDishes: Dish[] = [
  {
    id: 'dish-1',
    name: 'Pasta Carbonara',
    ingredients: {
      'Fruit shop': [],
      'Butchery': ['Bacon'],
      'Supermarket': ['Pasta', 'Eggs', 'Parmesan'],
    },
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dish-2',
    name: 'Fruit Salad',
    ingredients: {
      'Fruit shop': ['Apple', 'Banana', 'Orange'],
      'Butchery': [],
      'Supermarket': ['Honey'],
    },
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

export const mockIngredients: Record<CategoryName, string[]> = {
  'Fruit shop': ['Apple', 'Banana', 'Orange', 'Lemon', 'Lime'],
  'Butchery': ['Chicken', 'Beef', 'Pork', 'Bacon'],
  'Supermarket': ['Pasta', 'Rice', 'Bread', 'Eggs', 'Milk'],
};

// Create mock Firestore functions
export const createFirestoreMock = () => {
  const unsubscribe = vi.fn();

  return {
    collection: vi.fn(),
    doc: vi.fn(),
    onSnapshot: vi.fn((_ref, onSuccess) => {
      // Simulate successful snapshot
      const snapshot = {
        forEach: (callback: (doc: { data: () => Dish }) => void) => {
          mockDishes.forEach((dish) => {
            callback({ data: () => dish });
          });
        },
      };
      onSuccess(snapshot);
      return unsubscribe;
    }),
    setDoc: vi.fn().mockResolvedValue(undefined),
    deleteDoc: vi.fn().mockResolvedValue(undefined),
    getDoc: vi.fn().mockImplementation(() => ({
      exists: () => true,
      data: () => ({ names: mockIngredients['Fruit shop'] }),
    })),
    writeBatch: vi.fn(() => ({
      set: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    })),
    arrayUnion: vi.fn((...items) => items),
    unsubscribe,
  };
};

// Mock the firebase module
export const mockFirebaseModule = (firestoreMock: ReturnType<typeof createFirestoreMock>) => {
  vi.mock('firebase/firestore', () => ({
    collection: firestoreMock.collection,
    doc: firestoreMock.doc,
    onSnapshot: firestoreMock.onSnapshot,
    setDoc: firestoreMock.setDoc,
    deleteDoc: firestoreMock.deleteDoc,
    getDoc: firestoreMock.getDoc,
    writeBatch: firestoreMock.writeBatch,
    arrayUnion: firestoreMock.arrayUnion,
  }));

  vi.mock('../../firebase', () => ({
    db: {},
  }));
};
