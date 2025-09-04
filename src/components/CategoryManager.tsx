// src/components/CategoryManager.tsx
import React, { useState } from 'react';
import type { Category } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (category: Category) => void;
  onUpdate: (id: string, updates: Partial<Category>) => void;
  onDelete: (id: string) => void; // Required prop
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  categories, 
  onAdd, 
  onUpdate,
  onDelete // Must be provided by parent
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Category>>({});
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

const handleAddCategory = () => {
  if (newCategory.trim()) {
    const uniqueColor = generateUniqueColorPair(categories.map(c => c.color));

    onAdd({
      id: Date.now().toString(),
      name: newCategory.trim(),
      color: uniqueColor,
    });

    setNewCategory('');
    setShowForm(false);
  }
};

const COLOR_BASES = [
  'blue', 'green', 'red', 'yellow', 'purple', 'pink', 'indigo', 'emerald', 'orange', 'teal'
];

function generateUniqueColorPair(existingColors: string[]): string {
  const available = COLOR_BASES.filter(base =>
    !existingColors.some(color => color.includes(base))
  );

  const base = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : COLOR_BASES[Math.floor(Math.random() * COLOR_BASES.length)];

  return `bg-${base}-100 text-${base}-800`;
}


  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditValues({ name: category.name });
  };

  const saveEdit = (id: string) => {
    if (editValues.name?.trim()) {
      onUpdate(id, { name: editValues.name.trim() });
      setEditingId(null);
    }
  };

  const requestDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      onDelete(deletingId); // Call parent's delete function
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 relative">
      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Category</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Categories</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 flex items-center">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="New category name"
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
      )}

      <div className="space-y-2">
        {categories.map(category => (
          <div 
            key={category.id} 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
          >
            {editingId === category.id ? (
              <div className="flex items-center w-full">
                <input
                  type="text"
                  value={editValues.name || ''}
                  onChange={(e) => setEditValues({ name: e.target.value })}
                  className="flex-grow px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => saveEdit(category.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 bg-gray-200 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${category.color.split(' ')[0]}`}></span>
                  <span className="text-gray-700">{category.name}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditing(category)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => requestDelete(category.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        
        {categories.length === 0 && (
          <p className="text-gray-500 text-center py-4">No categories added yet</p>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;