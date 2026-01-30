import { describe, it, expect } from 'vitest';
import { validateDishName, validateIngredients, validateDish } from './validation';
import type { Dish } from '../types';

const createEmptyIngredients = () => ({
  'Fruit shop': [] as string[],
  'Butchery': [] as string[],
  'Supermarket': [] as string[],
});

const createDish = (overrides: Partial<Dish> = {}): Dish => ({
  id: 'test-id',
  name: 'Test Dish',
  ingredients: createEmptyIngredients(),
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('validateDishName', () => {
  describe('empty name validation', () => {
    it('returns error for empty string', () => {
      const result = validateDishName('', []);
      expect(result).toEqual({ field: 'name', message: 'Dish name is required' });
    });

    it('returns error for whitespace-only string', () => {
      const result = validateDishName('   ', []);
      expect(result).toEqual({ field: 'name', message: 'Dish name is required' });
    });

    it('returns error for tab and newline only', () => {
      const result = validateDishName('\t\n', []);
      expect(result).toEqual({ field: 'name', message: 'Dish name is required' });
    });
  });

  describe('valid name', () => {
    it('returns null for valid name with no existing dishes', () => {
      const result = validateDishName('Pasta Carbonara', []);
      expect(result).toBeNull();
    });

    it('returns null for name with leading/trailing whitespace (trimmed)', () => {
      const result = validateDishName('  Pasta Carbonara  ', []);
      expect(result).toBeNull();
    });
  });

  describe('duplicate detection', () => {
    const existingDishes = [
      createDish({ id: '1', name: 'Pasta Carbonara' }),
      createDish({ id: '2', name: 'Chicken Soup' }),
    ];

    it('returns error for exact duplicate name', () => {
      const result = validateDishName('Pasta Carbonara', existingDishes);
      expect(result).toEqual({ field: 'name', message: 'A dish with this name already exists' });
    });

    it('returns error for case-insensitive duplicate (lowercase)', () => {
      const result = validateDishName('pasta carbonara', existingDishes);
      expect(result).toEqual({ field: 'name', message: 'A dish with this name already exists' });
    });

    it('returns error for case-insensitive duplicate (uppercase)', () => {
      const result = validateDishName('PASTA CARBONARA', existingDishes);
      expect(result).toEqual({ field: 'name', message: 'A dish with this name already exists' });
    });

    it('returns error for case-insensitive duplicate (mixed case)', () => {
      const result = validateDishName('PaStA cArBoNaRa', existingDishes);
      expect(result).toEqual({ field: 'name', message: 'A dish with this name already exists' });
    });

    it('returns error for duplicate with leading/trailing whitespace', () => {
      const result = validateDishName('  Pasta Carbonara  ', existingDishes);
      expect(result).toEqual({ field: 'name', message: 'A dish with this name already exists' });
    });

    it('returns null for unique name', () => {
      const result = validateDishName('Beef Stew', existingDishes);
      expect(result).toBeNull();
    });
  });

  describe('editing mode (editingId)', () => {
    const existingDishes = [
      createDish({ id: '1', name: 'Pasta Carbonara' }),
      createDish({ id: '2', name: 'Chicken Soup' }),
    ];

    it('allows keeping the same name when editing', () => {
      const result = validateDishName('Pasta Carbonara', existingDishes, '1');
      expect(result).toBeNull();
    });

    it('allows keeping the same name with different case when editing', () => {
      const result = validateDishName('pasta carbonara', existingDishes, '1');
      expect(result).toBeNull();
    });

    it('returns error when editing to another dish name', () => {
      const result = validateDishName('Chicken Soup', existingDishes, '1');
      expect(result).toEqual({ field: 'name', message: 'A dish with this name already exists' });
    });

    it('allows changing to a completely new name when editing', () => {
      const result = validateDishName('New Dish Name', existingDishes, '1');
      expect(result).toBeNull();
    });
  });
});

describe('validateIngredients', () => {
  describe('no ingredients', () => {
    it('returns error for all empty arrays', () => {
      const ingredients = createEmptyIngredients();
      const result = validateIngredients(ingredients);
      expect(result).toEqual({ field: 'ingredients', message: 'At least one ingredient is required' });
    });

    it('returns error for arrays with only empty strings', () => {
      const ingredients = {
        'Fruit shop': ['', ''],
        'Butchery': [''],
        'Supermarket': ['', '', ''],
      };
      const result = validateIngredients(ingredients);
      expect(result).toEqual({ field: 'ingredients', message: 'At least one ingredient is required' });
    });

    it('returns error for arrays with only whitespace', () => {
      const ingredients = {
        'Fruit shop': ['   ', '\t'],
        'Butchery': ['  '],
        'Supermarket': ['\n', '   '],
      };
      const result = validateIngredients(ingredients);
      expect(result).toEqual({ field: 'ingredients', message: 'At least one ingredient is required' });
    });
  });

  describe('valid ingredients', () => {
    it('returns null when Fruit shop has ingredient', () => {
      const ingredients = {
        'Fruit shop': ['Apple'],
        'Butchery': [],
        'Supermarket': [],
      };
      const result = validateIngredients(ingredients);
      expect(result).toBeNull();
    });

    it('returns null when Butchery has ingredient', () => {
      const ingredients = {
        'Fruit shop': [],
        'Butchery': ['Chicken'],
        'Supermarket': [],
      };
      const result = validateIngredients(ingredients);
      expect(result).toBeNull();
    });

    it('returns null when Supermarket has ingredient', () => {
      const ingredients = {
        'Fruit shop': [],
        'Butchery': [],
        'Supermarket': ['Pasta'],
      };
      const result = validateIngredients(ingredients);
      expect(result).toBeNull();
    });

    it('returns null when multiple categories have ingredients', () => {
      const ingredients = {
        'Fruit shop': ['Apple', 'Banana'],
        'Butchery': ['Chicken'],
        'Supermarket': ['Pasta', 'Rice'],
      };
      const result = validateIngredients(ingredients);
      expect(result).toBeNull();
    });

    it('returns null when valid ingredient mixed with empty strings', () => {
      const ingredients = {
        'Fruit shop': ['', 'Apple', ''],
        'Butchery': [''],
        'Supermarket': [],
      };
      const result = validateIngredients(ingredients);
      expect(result).toBeNull();
    });

    it('returns null when valid ingredient mixed with whitespace', () => {
      const ingredients = {
        'Fruit shop': ['   ', 'Apple', '\t'],
        'Butchery': ['  '],
        'Supermarket': [],
      };
      const result = validateIngredients(ingredients);
      expect(result).toBeNull();
    });
  });
});

describe('validateDish', () => {
  describe('valid dish', () => {
    it('returns empty array for valid dish', () => {
      const ingredients = {
        'Fruit shop': ['Apple'],
        'Butchery': [],
        'Supermarket': [],
      };
      const result = validateDish('My Dish', ingredients, []);
      expect(result).toEqual([]);
    });
  });

  describe('invalid dish', () => {
    it('returns name error only when name is invalid', () => {
      const ingredients = {
        'Fruit shop': ['Apple'],
        'Butchery': [],
        'Supermarket': [],
      };
      const result = validateDish('', ingredients, []);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ field: 'name', message: 'Dish name is required' });
    });

    it('returns ingredients error only when ingredients are invalid', () => {
      const ingredients = createEmptyIngredients();
      const result = validateDish('My Dish', ingredients, []);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ field: 'ingredients', message: 'At least one ingredient is required' });
    });

    it('returns both errors when name and ingredients are invalid', () => {
      const ingredients = createEmptyIngredients();
      const result = validateDish('', ingredients, []);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ field: 'name', message: 'Dish name is required' });
      expect(result).toContainEqual({ field: 'ingredients', message: 'At least one ingredient is required' });
    });

    it('returns duplicate error when dish name exists', () => {
      const existingDishes = [createDish({ id: '1', name: 'Existing Dish' })];
      const ingredients = {
        'Fruit shop': ['Apple'],
        'Butchery': [],
        'Supermarket': [],
      };
      const result = validateDish('Existing Dish', ingredients, existingDishes);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ field: 'name', message: 'A dish with this name already exists' });
    });
  });

  describe('editing mode', () => {
    it('allows same name when editing', () => {
      const existingDishes = [createDish({ id: '1', name: 'Existing Dish' })];
      const ingredients = {
        'Fruit shop': ['Apple'],
        'Butchery': [],
        'Supermarket': [],
      };
      const result = validateDish('Existing Dish', ingredients, existingDishes, '1');
      expect(result).toEqual([]);
    });
  });
});
