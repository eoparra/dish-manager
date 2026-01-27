import { useState } from 'react';
import type { Dish, TabType } from './types';
import { STORAGE_KEY } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { CreateDishForm } from './components/CreateDishForm';
import { BrowseDishes } from './components/BrowseDishes';

function App() {
  const [dishes, setDishes] = useLocalStorage<Dish[]>(STORAGE_KEY, []);
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const handleSaveDish = (dishData: Omit<Dish, 'id' | 'createdAt'>) => {
    if (editingDish) {
      setDishes(prev =>
        prev.map(dish =>
          dish.id === editingDish.id
            ? { ...dish, ...dishData }
            : dish
        )
      );
      setEditingDish(null);
    } else {
      const newDish: Dish = {
        ...dishData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setDishes(prev => [...prev, newDish]);
    }
  };

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setActiveTab('create');
  };

  const handleDeleteDish = (id: string) => {
    setDishes(prev => prev.filter(dish => dish.id !== id));
    if (editingDish?.id === id) {
      setEditingDish(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingDish(null);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'browse') {
      setEditingDish(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        {activeTab === 'create' && (
          <CreateDishForm
            dishes={dishes}
            onSave={handleSaveDish}
            editingDish={editingDish}
            onCancelEdit={handleCancelEdit}
          />
        )}

        {activeTab === 'browse' && (
          <BrowseDishes
            dishes={dishes}
            onEdit={handleEditDish}
            onDelete={handleDeleteDish}
          />
        )}
      </main>
    </div>
  );
}

export default App;
