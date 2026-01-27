export type CategoryName = 'Fruit shop' | 'Butchery' | 'Supermarket';

export interface Dish {
  id: string;
  name: string;
  ingredients: {
    'Fruit shop': string[];
    'Butchery': string[];
    'Supermarket': string[];
  };
  createdAt: string;
}

export interface ConsolidatedIngredient {
  name: string;
  count: number;
  display: string;
}

export type ConsolidatedList = Record<CategoryName, ConsolidatedIngredient[]>;

export type TabType = 'create' | 'browse';
