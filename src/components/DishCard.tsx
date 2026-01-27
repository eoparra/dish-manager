import type { Dish, CategoryName } from '../types';
import { CATEGORIES } from '../constants';

interface DishCardProps {
  dish: Dish;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CATEGORY_BADGE_COLORS: Record<CategoryName, string> = {
  'Fruit shop': 'bg-green-100 text-green-700',
  'Butchery': 'bg-red-100 text-red-700',
  'Supermarket': 'bg-blue-100 text-blue-700',
};

export function DishCard({ dish, isSelected, onToggleSelect, onEdit, onDelete }: DishCardProps) {
  const totalIngredients = CATEGORIES.reduce(
    (sum, cat) => sum + dish.ingredients[cat].length,
    0
  );

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isSelected ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mt-1 w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{dish.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{totalIngredients} ingredient{totalIngredients !== 1 ? 's' : ''}</p>

          <div className="flex flex-wrap gap-1 mb-3">
            {CATEGORIES.map(category => {
              const count = dish.ingredients[category].length;
              if (count === 0) return null;
              return (
                <span
                  key={category}
                  className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_BADGE_COLORS[category]}`}
                >
                  {category}: {count}
                </span>
              );
            })}
          </div>

          <div className="space-y-2">
            {CATEGORIES.map(category => {
              const items = dish.ingredients[category];
              if (items.length === 0) return null;
              return (
                <div key={category} className="text-sm">
                  <span className="font-medium text-gray-700">{category}:</span>{' '}
                  <span className="text-gray-600">{items.join(', ')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={onEdit}
          className="flex-1 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 py-1.5 rounded transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 py-1.5 rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
