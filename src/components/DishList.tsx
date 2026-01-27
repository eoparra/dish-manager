import type { Dish } from '../types';
import { DishCard } from './DishCard';

interface DishListProps {
  dishes: Dish[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
}

export function DishList({ dishes, selectedIds, onToggleSelect, onEdit, onDelete }: DishListProps) {
  if (dishes.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p className="mt-4 text-gray-500">No dishes found</p>
        <p className="text-sm text-gray-400">Create your first dish in the "Create Dish" tab</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {dishes.map(dish => (
        <DishCard
          key={dish.id}
          dish={dish}
          isSelected={selectedIds.has(dish.id)}
          onToggleSelect={() => onToggleSelect(dish.id)}
          onEdit={() => onEdit(dish)}
          onDelete={() => onDelete(dish)}
        />
      ))}
    </div>
  );
}
