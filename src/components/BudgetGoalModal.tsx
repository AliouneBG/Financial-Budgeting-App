import React, { useState } from 'react';
import type { Category } from '../types';

interface BudgetGoalModalProps {
  category: Category;
  onSave: (budget: number, categoryName?: string) => void;
  onCancel: () => void;
  availableCategories: string[];
  onDelete?: () => void; // Added delete handler
}

const BudgetGoalModal: React.FC<BudgetGoalModalProps> = ({
  category,
  onSave,
  onCancel,
  availableCategories,
  onDelete // Receive delete handler
}) => {
  const [budget, setBudget] = useState<number>(category.budget || 0);
  const [categoryName, setCategoryName] = useState<string>(category.name || '');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'biweekly'>('monthly');
  const [isRecurring, setIsRecurring] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    
    if (category.id === 'new') {
      if (!categoryName) {
        setError('Please select a category');
        return;
      }
      
      if (!availableCategories.includes(categoryName)) {
        setError('This category already has a budget');
        return;
      }
    }
    
    if (budget <= 0) {
      setError('Budget must be greater than zero');
      return;
    }
    
    onSave(budget, category.id === 'new' ? categoryName : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {category.id === 'new' ? 'Create Budget Goal' : `Edit ${category.name} Budget`}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {category.id === 'new' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                  min="0"
                  step="1" // Changed to whole dollars
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Period
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['weekly', 'biweekly', 'monthly'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`px-3 py-2 border rounded-md text-sm ${
                      period === option
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300'
                    }`}
                    onClick={() => setPeriod(option as typeof period)}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                Recurring monthly budget
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            {/* Delete button for existing budgets */}
            {category.id !== 'new' && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="mr-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Budget
              </button>
            )}
            
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              disabled={budget <= 0 || (category.id === 'new' && !categoryName)}
            >
              Save Budget
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetGoalModal;