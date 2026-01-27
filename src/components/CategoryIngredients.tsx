import type { CategoryName } from '../types';
import { IngredientInput } from './IngredientInput';

interface CategoryIngredientsProps {
  category: CategoryName;
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
}

const CATEGORY_COLORS: Record<CategoryName, { bg: string; border: string; text: string }> = {
  'Fruit shop': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  'Butchery': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  'Supermarket': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
};

export function CategoryIngredients({ category, ingredients, onChange }: CategoryIngredientsProps) {
  const colors = CATEGORY_COLORS[category];

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    onChange(newIngredients);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    onChange(newIngredients.length === 0 ? [''] : newIngredients);
  };

  const handleAddIngredient = () => {
    onChange([...ingredients, '']);
  };

  return (
    <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
      <h3 className={`font-semibold mb-3 ${colors.text}`}>{category}</h3>
      <div className="space-y-2">
        {ingredients.map((ingredient, index) => (
          <IngredientInput
            key={index}
            value={ingredient}
            onChange={(value) => handleIngredientChange(index, value)}
            onRemove={() => handleRemoveIngredient(index)}
            canRemove={ingredients.length > 1}
            placeholder={`Add ${category.toLowerCase()} ingredient...`}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={handleAddIngredient}
        className={`mt-3 text-sm ${colors.text} hover:underline flex items-center gap-1`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add ingredient
      </button>
    </div>
  );
}
