import { useState, useMemo } from 'react';
import type { Dish } from '../types';
import { MAX_SELECTED_DISHES } from '../constants';
import { SearchBar } from './SearchBar';
import { DishList } from './DishList';
import { ConsolidatedList } from './ConsolidatedList';
import { ConfirmDialog } from './ConfirmDialog';
import { consolidateIngredients } from '../utils/consolidation';

interface BrowseDishesProps {
  dishes: Dish[];
  onEdit: (dish: Dish) => void;
  onDelete: (id: string) => void;
}

export function BrowseDishes({ dishes, onEdit, onDelete }: BrowseDishesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);

  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return dishes;
    const query = searchQuery.toLowerCase();
    return dishes.filter(dish =>
      dish.name.toLowerCase().includes(query)
    );
  }, [dishes, searchQuery]);

  const selectedDishes = useMemo(() =>
    dishes.filter(d => selectedIds.has(d.id)),
    [dishes, selectedIds]
  );

  const consolidatedList = useMemo(() =>
    consolidateIngredients(selectedDishes),
    [selectedDishes]
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (newSet.size >= MAX_SELECTED_DISHES) {
          alert(`You can select a maximum of ${MAX_SELECTED_DISHES} dishes`);
          return prev;
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeleteRequest = (dish: Dish) => {
    setDishToDelete(dish);
  };

  const handleConfirmDelete = () => {
    if (dishToDelete) {
      onDelete(dishToDelete.id);
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(dishToDelete.id);
        return newSet;
      });
      setDishToDelete(null);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        {selectedIds.size > 0 && (
          <button
            onClick={handleClearSelection}
            className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
          >
            Clear selection ({selectedIds.size})
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Your Dishes ({filteredDishes.length})
          </h2>
          <DishList
            dishes={filteredDishes}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onEdit={onEdit}
            onDelete={handleDeleteRequest}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Consolidated Shopping List
          </h2>
          <ConsolidatedList
            list={consolidatedList}
            selectedCount={selectedIds.size}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={dishToDelete !== null}
        title="Delete Dish"
        message={`Are you sure you want to delete "${dishToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDishToDelete(null)}
      />
    </div>
  );
}
