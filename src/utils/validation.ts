import type { Dish, CategoryName } from '../types';
import { CATEGORIES } from '../constants';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateDishName(name: string, existingDishes: Dish[], editingId?: string): ValidationError | null {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { field: 'name', message: 'Dish name is required' };
  }

  const duplicate = existingDishes.find(
    dish => dish.name.toLowerCase() === trimmedName.toLowerCase() && dish.id !== editingId
  );

  if (duplicate) {
    return { field: 'name', message: 'A dish with this name already exists' };
  }

  return null;
}

export function validateIngredients(ingredients: Record<CategoryName, string[]>): ValidationError | null {
  const hasAnyIngredient = CATEGORIES.some(
    category => ingredients[category].some(ing => ing.trim() !== '')
  );

  if (!hasAnyIngredient) {
    return { field: 'ingredients', message: 'At least one ingredient is required' };
  }

  return null;
}

export function validateDish(
  name: string,
  ingredients: Record<CategoryName, string[]>,
  existingDishes: Dish[],
  editingId?: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  const nameError = validateDishName(name, existingDishes, editingId);
  if (nameError) errors.push(nameError);

  const ingredientsError = validateIngredients(ingredients);
  if (ingredientsError) errors.push(ingredientsError);

  return errors;
}
