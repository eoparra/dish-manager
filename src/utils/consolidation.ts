import type { Dish, ConsolidatedIngredient, ConsolidatedList } from '../types';
import { CATEGORIES } from '../constants';

export function consolidateIngredients(dishes: Dish[]): ConsolidatedList {
  const result = {} as ConsolidatedList;

  for (const category of CATEGORIES) {
    const countMap = new Map<string, number>();

    for (const dish of dishes) {
      for (const ingredient of dish.ingredients[category]) {
        const normalized = ingredient.trim().toLowerCase();
        if (normalized) {
          countMap.set(normalized, (countMap.get(normalized) || 0) + 1);
        }
      }
    }

    result[category] = Array.from(countMap.entries())
      .map(([name, count]): ConsolidatedIngredient => ({
        name,
        count,
        display: count === 1 ? name : `${name} ${'+'.repeat(count - 1)}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return result;
}

export function formatConsolidatedListForClipboard(list: ConsolidatedList): string {
  const sections: string[] = [];

  for (const category of CATEGORIES) {
    if (list[category].length > 0) {
      const items = list[category].map(ing => `  - ${ing.display}`).join('\n');
      sections.push(`${category}:\n${items}`);
    }
  }

  return sections.join('\n\n');
}
