import { useState } from 'react';
import type { Dish, TabType } from './types';
import { useFirestore } from './hooks/useFirestore';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { CreateDishForm } from './components/CreateDishForm';
import { BrowseDishes } from './components/BrowseDishes';

function App() {
  const { dishes, loading, error, addDish, updateDish, deleteDish } = useFirestore();
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const handleSaveDish = async (dishData: Omit<Dish, 'id' | 'createdAt'>) => {
    if (editingDish) {
      await updateDish({ ...editingDish, ...dishData });
      setEditingDish(null);
    } else {
      const newDish: Dish = {
        ...dishData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      await addDish(newDish);
    }
  };

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setActiveTab('create');
  };

  const handleDeleteDish = async (id: string) => {
    await deleteDish(id);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dishes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Make sure you have created a Firebase project and added your configuration to .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

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
