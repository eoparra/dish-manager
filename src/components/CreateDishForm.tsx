import { useState } from 'react';
import type { Dish, CategoryName } from '../types';
import { CATEGORIES } from '../constants';
import { CategoryIngredients } from './CategoryIngredients';
import { validateDish } from '../utils/validation';
import type { ValidationError } from '../utils/validation';

interface CreateDishFormProps {
  dishes: Dish[];
  onSave: (dish: Omit<Dish, 'id' | 'createdAt'>) => void;
  editingDish: Dish | null;
  onCancelEdit: () => void;
}

type IngredientsState = Record<CategoryName, string[]>;

const getEmptyIngredients = (): IngredientsState => ({
  'Fruit shop': [''],
  'Butchery': [''],
  'Supermarket': [''],
});

export function CreateDishForm({ dishes, onSave, editingDish, onCancelEdit }: CreateDishFormProps) {
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<IngredientsState>(getEmptyIngredients());
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [prevEditingDishId, setPrevEditingDishId] = useState<string | null>(null);

  const currentEditingDishId = editingDish?.id ?? null;
  if (currentEditingDishId !== prevEditingDishId) {
    setPrevEditingDishId(currentEditingDishId);
    if (editingDish) {
      setName(editingDish.name);
      setIngredients({
        'Fruit shop': editingDish.ingredients['Fruit shop'].length > 0
          ? [...editingDish.ingredients['Fruit shop']]
          : [''],
        'Butchery': editingDish.ingredients['Butchery'].length > 0
          ? [...editingDish.ingredients['Butchery']]
          : [''],
        'Supermarket': editingDish.ingredients['Supermarket'].length > 0
          ? [...editingDish.ingredients['Supermarket']]
          : [''],
      });
      setErrors([]);
    } else {
      setName('');
      setIngredients(getEmptyIngredients());
      setErrors([]);
    }
  }

  const resetForm = () => {
    setName('');
    setIngredients(getEmptyIngredients());
    setErrors([]);
  };

  const handleCategoryChange = (category: CategoryName, newIngredients: string[]) => {
    setIngredients(prev => ({
      ...prev,
      [category]: newIngredients,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedIngredients: IngredientsState = {
      'Fruit shop': ingredients['Fruit shop'].map(i => i.trim()).filter(i => i !== ''),
      'Butchery': ingredients['Butchery'].map(i => i.trim()).filter(i => i !== ''),
      'Supermarket': ingredients['Supermarket'].map(i => i.trim()).filter(i => i !== ''),
    };

    const validationErrors = validateDish(name, cleanedIngredients, dishes, editingDish?.id);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      name: name.trim(),
      ingredients: cleanedIngredients,
    });

    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit();
  };

  const getFieldError = (field: string) => errors.find(e => e.field === field)?.message;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="dishName" className="block text-sm font-medium text-gray-700 mb-1">
          Dish Name
        </label>
        <input
          id="dishName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Spaghetti Bolognese"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${
            getFieldError('name') ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {getFieldError('name') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Ingredients by Category</h2>
        {getFieldError('ingredients') && (
          <p className="text-sm text-red-600">{getFieldError('ingredients')}</p>
        )}
        {CATEGORIES.map(category => (
          <CategoryIngredients
            key={category}
            category={category}
            ingredients={ingredients[category]}
            onChange={(newIngredients) => handleCategoryChange(category, newIngredients)}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          {editingDish ? 'Update Dish' : 'Save Dish'}
        </button>
        {editingDish && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
