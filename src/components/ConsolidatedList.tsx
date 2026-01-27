import { useState } from 'react';
import type { ConsolidatedList as ConsolidatedListType, CategoryName } from '../types';
import { CATEGORIES } from '../constants';
import { formatConsolidatedListForClipboard } from '../utils/consolidation';

interface ConsolidatedListProps {
  list: ConsolidatedListType;
  selectedCount: number;
}

const CATEGORY_STYLES: Record<CategoryName, { bg: string; border: string; header: string }> = {
  'Fruit shop': { bg: 'bg-green-50', border: 'border-green-200', header: 'text-green-700' },
  'Butchery': { bg: 'bg-red-50', border: 'border-red-200', header: 'text-red-700' },
  'Supermarket': { bg: 'bg-blue-50', border: 'border-blue-200', header: 'text-blue-700' },
};

export function ConsolidatedList({ list, selectedCount }: ConsolidatedListProps) {
  const [copied, setCopied] = useState(false);

  const totalItems = CATEGORIES.reduce((sum, cat) => sum + list[cat].length, 0);

  const handleCopy = async () => {
    const text = formatConsolidatedListForClipboard(list);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (selectedCount === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <svg
          className="mx-auto h-10 w-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="mt-3 text-gray-500">Select dishes to generate a shopping list</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900">Shopping List</h3>
          <p className="text-sm text-gray-500">
            {selectedCount} dish{selectedCount !== 1 ? 'es' : ''} selected, {totalItems} item{totalItems !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy List
            </>
          )}
        </button>
      </div>

      <div className="p-4 space-y-4 bg-gray-50">
        {CATEGORIES.map(category => {
          const items = list[category];
          if (items.length === 0) return null;

          const styles = CATEGORY_STYLES[category];
          return (
            <div key={category} className={`rounded-lg border ${styles.border} ${styles.bg} p-4`}>
              <h4 className={`font-semibold mb-2 ${styles.header}`}>{category}</h4>
              <ul className="space-y-1">
                {items.map(item => (
                  <li key={item.name} className="text-gray-700 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    {item.display}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
