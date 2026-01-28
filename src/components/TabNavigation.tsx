import type { TabType } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex border-b border-gray-200">
      <button
        onClick={() => onTabChange('create')}
        className={`px-6 py-3 font-medium text-sm transition-colors ${
          activeTab === 'create'
            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
      >
        Create Dish
      </button>
      <button
        onClick={() => onTabChange('browse')}
        className={`px-6 py-3 font-medium text-sm transition-colors ${
          activeTab === 'browse'
            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
      >
        Browse Dishes
      </button>
    </div>
  );
}
