import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useIngredientSuggestions } from './useIngredientSuggestions';

// Mock Firebase
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  arrayUnion: vi.fn((...items) => items),
}));

vi.mock('../firebase', () => ({
  db: {},
}));

describe('useIngredientSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: return ingredients for each category
    mockGetDoc.mockImplementation(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({ names: ['Apple', 'Banana', 'Cherry'] }),
      })
    );
    mockSetDoc.mockResolvedValue(undefined);
  });

  describe('initial loading', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useIngredientSuggestions());
      expect(result.current.loading).toBe(true);
    });

    it('loads ingredients from Firestore on mount', async () => {
      const { result } = renderHook(() => useIngredientSuggestions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGetDoc).toHaveBeenCalledTimes(3); // Once per category
      expect(result.current.knownIngredients['Fruit shop']).toEqual(['Apple', 'Banana', 'Cherry']);
    });

    it('handles empty Firestore documents', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const { result } = renderHook(() => useIngredientSuggestions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.knownIngredients['Fruit shop']).toEqual([]);
    });

    it('sets error on Firestore failure', async () => {
      mockGetDoc.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useIngredientSuggestions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load ingredient suggestions');
    });
  });

  describe('getSuggestions', () => {
    it('filters ingredients by prefix (case-insensitive)', async () => {
      const { result } = renderHook(() => useIngredientSuggestions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const suggestions = result.current.getSuggestions('Fruit shop', 'ap');
      expect(suggestions).toEqual(['Apple']);
    });

    it('returns empty array for empty query', async () => {
      const { result } = renderHook(() => useIngredientSuggestions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.getSuggestions('Fruit shop', '')).toEqual([]);
      expect(result.current.getSuggestions('Fruit shop', '   ')).toEqual([]);
    });

    it('respects the limit parameter', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ names: ['Apple', 'Apricot', 'Avocado', 'Artichoke'] }),
      });

      const { result } = renderHook(() => useIngredientSuggestions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const suggestions = result.current.getSuggestions('Fruit shop', 'a', 2);
      expect(suggestions).toHaveLength(2);
    });

    it('returns all matching when under limit', async () => {
      const { result } = renderHook(() => useIngredientSuggestions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const suggestions = result.current.getSuggestions('Fruit shop', 'b');
      expect(suggestions).toEqual(['Banana']);
    });
  });

  describe('addNewIngredients', () => {
    it('adds new ingredients to Firestore', async () => {
      const { result } = renderHook(() => useIngredientSuggestions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addNewIngredients('Fruit shop', ['Dragon fruit']);
      });

      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('skips ingredients that already exist (case-insensitive)', async () => {
      const { result } = renderHook(() => useIngredientSuggestions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addNewIngredients('Fruit shop', ['apple', 'BANANA']);
      });

      // Should not call setDoc since all ingredients exist
      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it('filters out empty strings', async () => {
      const { result } = renderHook(() => useIngredientSuggestions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addNewIngredients('Fruit shop', ['', '  ', 'Dragon fruit']);
      });

      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('does nothing for empty array', async () => {
      const { result } = renderHook(() => useIngredientSuggestions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addNewIngredients('Fruit shop', []);
      });

      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it('updates local state after adding', async () => {
      const { result } = renderHook(() => useIngredientSuggestions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addNewIngredients('Fruit shop', ['Dragon fruit']);
      });

      expect(result.current.knownIngredients['Fruit shop']).toContain('Dragon fruit');
    });
  });
});
