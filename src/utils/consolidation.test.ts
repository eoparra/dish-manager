import { describe, it, expect } from 'vitest';
import { consolidateIngredients, formatConsolidatedListForClipboard } from './consolidation';
import type { Dish, ConsolidatedList } from '../types';

const createDish = (
  id: string,
  name: string,
  ingredients: {
    'Fruit shop'?: string[];
    'Butchery'?: string[];
    'Supermarket'?: string[];
  }
): Dish => ({
  id,
  name,
  ingredients: {
    'Fruit shop': ingredients['Fruit shop'] ?? [],
    'Butchery': ingredients['Butchery'] ?? [],
    'Supermarket': ingredients['Supermarket'] ?? [],
  },
  createdAt: '2024-01-01T00:00:00.000Z',
});

describe('consolidateIngredients', () => {
  describe('empty input', () => {
    it('returns empty arrays for all categories when no dishes', () => {
      const result = consolidateIngredients([]);
      expect(result['Fruit shop']).toEqual([]);
      expect(result['Butchery']).toEqual([]);
      expect(result['Supermarket']).toEqual([]);
    });

    it('returns empty arrays when dishes have no ingredients', () => {
      const dishes = [
        createDish('1', 'Empty Dish 1', {}),
        createDish('2', 'Empty Dish 2', {}),
      ];
      const result = consolidateIngredients(dishes);
      expect(result['Fruit shop']).toEqual([]);
      expect(result['Butchery']).toEqual([]);
      expect(result['Supermarket']).toEqual([]);
    });
  });

  describe('single dish', () => {
    it('consolidates ingredients from single dish', () => {
      const dishes = [
        createDish('1', 'Fruit Salad', {
          'Fruit shop': ['Apple', 'Banana'],
          'Supermarket': ['Sugar'],
        }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop']).toHaveLength(2);
      expect(result['Supermarket']).toHaveLength(1);
      expect(result['Butchery']).toHaveLength(0);
    });

    it('creates correct display for count of 1', () => {
      const dishes = [
        createDish('1', 'Simple', { 'Fruit shop': ['Apple'] }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop'][0]).toEqual({
        name: 'apple',
        count: 1,
        display: 'apple',
      });
    });
  });

  describe('counting duplicates', () => {
    it('counts same ingredient across multiple dishes', () => {
      const dishes = [
        createDish('1', 'Dish 1', { 'Fruit shop': ['Apple'] }),
        createDish('2', 'Dish 2', { 'Fruit shop': ['Apple'] }),
        createDish('3', 'Dish 3', { 'Fruit shop': ['Apple'] }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop']).toHaveLength(1);
      expect(result['Fruit shop'][0]).toEqual({
        name: 'apple',
        count: 3,
        display: 'apple ++',
      });
    });

    it('counts duplicate within same dish', () => {
      const dishes = [
        createDish('1', 'Dish 1', { 'Fruit shop': ['Apple', 'Apple'] }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop']).toHaveLength(1);
      expect(result['Fruit shop'][0].count).toBe(2);
    });

    it('creates correct display format for various counts', () => {
      const dishes = [
        createDish('1', 'Dish 1', { 'Fruit shop': ['Apple', 'Banana', 'Orange'] }),
        createDish('2', 'Dish 2', { 'Fruit shop': ['Apple', 'Banana'] }),
        createDish('3', 'Dish 3', { 'Fruit shop': ['Apple'] }),
      ];
      const result = consolidateIngredients(dishes);

      const apple = result['Fruit shop'].find(i => i.name === 'apple');
      const banana = result['Fruit shop'].find(i => i.name === 'banana');
      const orange = result['Fruit shop'].find(i => i.name === 'orange');

      expect(apple).toEqual({ name: 'apple', count: 3, display: 'apple ++' });
      expect(banana).toEqual({ name: 'banana', count: 2, display: 'banana +' });
      expect(orange).toEqual({ name: 'orange', count: 1, display: 'orange' });
    });
  });

  describe('case normalization', () => {
    it('normalizes ingredients to lowercase', () => {
      const dishes = [
        createDish('1', 'Dish 1', { 'Fruit shop': ['APPLE'] }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop'][0].name).toBe('apple');
    });

    it('treats different cases as same ingredient', () => {
      const dishes = [
        createDish('1', 'Dish 1', { 'Fruit shop': ['Apple'] }),
        createDish('2', 'Dish 2', { 'Fruit shop': ['APPLE'] }),
        createDish('3', 'Dish 3', { 'Fruit shop': ['apple'] }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop']).toHaveLength(1);
      expect(result['Fruit shop'][0].count).toBe(3);
      expect(result['Fruit shop'][0].name).toBe('apple');
    });

    it('handles mixed case in same dish', () => {
      const dishes = [
        createDish('1', 'Dish 1', { 'Fruit shop': ['Apple', 'APPLE', 'apple'] }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop']).toHaveLength(1);
      expect(result['Fruit shop'][0].count).toBe(3);
    });
  });

  describe('whitespace handling', () => {
    it('trims leading and trailing whitespace', () => {
      const dishes = [
        createDish('1', 'Dish 1', { 'Fruit shop': ['  Apple  '] }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop'][0].name).toBe('apple');
    });

    it('treats trimmed versions as same ingredient', () => {
      const dishes = [
        createDish('1', 'Dish 1', { 'Fruit shop': ['Apple'] }),
        createDish('2', 'Dish 2', { 'Fruit shop': ['  Apple  '] }),
        createDish('3', 'Dish 3', { 'Fruit shop': ['Apple '] }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop']).toHaveLength(1);
      expect(result['Fruit shop'][0].count).toBe(3);
    });

    it('ignores empty strings', () => {
      const dishes = [
        createDish('1', 'Dish 1', { 'Fruit shop': ['Apple', '', 'Banana'] }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop']).toHaveLength(2);
    });

    it('ignores whitespace-only strings', () => {
      const dishes = [
        createDish('1', 'Dish 1', { 'Fruit shop': ['Apple', '   ', '\t', 'Banana'] }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop']).toHaveLength(2);
    });
  });

  describe('sorting', () => {
    it('sorts ingredients alphabetically', () => {
      const dishes = [
        createDish('1', 'Dish 1', { 'Fruit shop': ['Banana', 'Apple', 'Cherry'] }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop'].map(i => i.name)).toEqual(['apple', 'banana', 'cherry']);
    });

    it('sorts case-insensitively', () => {
      const dishes = [
        createDish('1', 'Dish 1', { 'Fruit shop': ['banana', 'APPLE', 'Cherry'] }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop'].map(i => i.name)).toEqual(['apple', 'banana', 'cherry']);
    });
  });

  describe('multiple categories', () => {
    it('consolidates ingredients across all categories independently', () => {
      const dishes = [
        createDish('1', 'Dish 1', {
          'Fruit shop': ['Apple', 'Banana'],
          'Butchery': ['Chicken'],
          'Supermarket': ['Rice', 'Pasta'],
        }),
        createDish('2', 'Dish 2', {
          'Fruit shop': ['Apple'],
          'Butchery': ['Beef', 'Chicken'],
          'Supermarket': ['Rice'],
        }),
      ];
      const result = consolidateIngredients(dishes);

      expect(result['Fruit shop']).toHaveLength(2);
      expect(result['Fruit shop'].find(i => i.name === 'apple')?.count).toBe(2);
      expect(result['Fruit shop'].find(i => i.name === 'banana')?.count).toBe(1);

      expect(result['Butchery']).toHaveLength(2);
      expect(result['Butchery'].find(i => i.name === 'chicken')?.count).toBe(2);
      expect(result['Butchery'].find(i => i.name === 'beef')?.count).toBe(1);

      expect(result['Supermarket']).toHaveLength(2);
      expect(result['Supermarket'].find(i => i.name === 'rice')?.count).toBe(2);
      expect(result['Supermarket'].find(i => i.name === 'pasta')?.count).toBe(1);
    });
  });
});

describe('formatConsolidatedListForClipboard', () => {
  describe('empty list', () => {
    it('returns empty string when all categories are empty', () => {
      const list: ConsolidatedList = {
        'Fruit shop': [],
        'Butchery': [],
        'Supermarket': [],
      };
      const result = formatConsolidatedListForClipboard(list);
      expect(result).toBe('');
    });
  });

  describe('single category', () => {
    it('formats single category correctly', () => {
      const list: ConsolidatedList = {
        'Fruit shop': [
          { name: 'apple', count: 1, display: 'apple' },
          { name: 'banana', count: 2, display: 'banana +' },
        ],
        'Butchery': [],
        'Supermarket': [],
      };
      const result = formatConsolidatedListForClipboard(list);
      expect(result).toBe('Fruit shop:\n  - apple\n  - banana +');
    });
  });

  describe('multiple categories', () => {
    it('formats multiple categories with double newline separator', () => {
      const list: ConsolidatedList = {
        'Fruit shop': [
          { name: 'apple', count: 1, display: 'apple' },
        ],
        'Butchery': [
          { name: 'chicken', count: 2, display: 'chicken +' },
        ],
        'Supermarket': [],
      };
      const result = formatConsolidatedListForClipboard(list);
      expect(result).toBe('Fruit shop:\n  - apple\n\nButchery:\n  - chicken +');
    });

    it('formats all categories in order', () => {
      const list: ConsolidatedList = {
        'Fruit shop': [
          { name: 'apple', count: 1, display: 'apple' },
        ],
        'Butchery': [
          { name: 'chicken', count: 1, display: 'chicken' },
        ],
        'Supermarket': [
          { name: 'rice', count: 3, display: 'rice ++' },
        ],
      };
      const result = formatConsolidatedListForClipboard(list);

      const expected = [
        'Fruit shop:',
        '  - apple',
        '',
        'Butchery:',
        '  - chicken',
        '',
        'Supermarket:',
        '  - rice ++',
      ].join('\n');

      expect(result).toBe(expected);
    });

    it('skips empty categories', () => {
      const list: ConsolidatedList = {
        'Fruit shop': [
          { name: 'apple', count: 1, display: 'apple' },
        ],
        'Butchery': [],
        'Supermarket': [
          { name: 'rice', count: 1, display: 'rice' },
        ],
      };
      const result = formatConsolidatedListForClipboard(list);
      expect(result).toBe('Fruit shop:\n  - apple\n\nSupermarket:\n  - rice');
      expect(result).not.toContain('Butchery');
    });
  });

  describe('display format preservation', () => {
    it('uses the display property as-is', () => {
      const list: ConsolidatedList = {
        'Fruit shop': [
          { name: 'apple', count: 5, display: 'apple ++++' },
        ],
        'Butchery': [],
        'Supermarket': [],
      };
      const result = formatConsolidatedListForClipboard(list);
      expect(result).toContain('apple ++++');
    });
  });
});
