import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import memoize from 'memoize-one';
import type { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onCategoryChange: (id: string, category: string) => void;
  categories: string[];
  onResetAll: () => void;
}

// Create memoized function for formatting currency
const formatCurrency = memoize((amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
});

// Create memoized function for formatting dates
const formatDate = memoize((dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
});

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  onEdit, 
  onDelete,
  onCategoryChange,
  categories,
  onResetAll
}) => {
  const [sortConfig, setSortConfig] = useState<{key: keyof Transaction, direction: 'asc' | 'desc'}>({
    key: 'date',
    direction: 'desc'
  });
  
  const [filter, setFilter] = useState({
    search: '',
    category: 'all'
  });

  // State for edit modal
  const [isEditing, setIsEditing] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<Partial<Transaction>>({});

  // State for reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Initialize form data when editing transaction changes
  React.useEffect(() => {
    if (editingTransaction) {
      setFormData({ ...editingTransaction });
    }
  }, [editingTransaction]);

  // Memoized processed transactions with proper sorting
  const processedTransactions = useMemo(() => {
    const filtered = transactions.filter(tx => {
      const matchesSearch = tx.merchant.toLowerCase().includes(filter.search.toLowerCase());
      const matchesCategory = filter.category === 'all' || tx.category === filter.category;
      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
      const key = sortConfig.key;
      let aVal = a[key];
      let bVal = b[key];

      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bVal === undefined) return sortConfig.direction === 'asc' ? -1 : 1;

      if (key === 'date') {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      } else if (key === 'merchant') {
        aVal = (aVal as string).toLowerCase();
        bVal = (bVal as string).toLowerCase();
      } else if (key === 'amount') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [transactions, sortConfig, filter]);

  // Handle sorting
  const handleSort = useCallback((key: keyof Transaction) => {
    setSortConfig(prev => {
      // If same key, toggle direction
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      // New key, default to descending
      return {
        key,
        direction: 'desc'
      };
    });
  }, []);

  // Handle edit button click
  const handleEditClick = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditing(true);
  }, []);

  // Handle form submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      onEdit(editingTransaction.id, formData);
      setIsEditing(false);
    }
  };

  // Handle reset confirmation
  const handleResetConfirm = () => {
    onResetAll();
    setShowResetConfirm(false);
    setFilter({ search: '', category: 'all' });
    setSortConfig({ key: 'date', direction: 'desc' });
  };

  // Virtualized row renderer
  const Row = useCallback(({ index, style }: {index: number; style: React.CSSProperties}) => {
    const transaction = processedTransactions[index];
    
    return (
      <div style={style} className="hover:bg-gray-50">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b items-center">
          <div className="col-span-2 text-sm text-gray-500">
            {formatDate(transaction.date)}
          </div>
          
          <div className="col-span-3 font-medium text-gray-900 text-sm">
            {transaction.merchant}
          </div>
          
          <div className={`col-span-2 font-medium text-sm ${
            transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(transaction.amount)}
          </div>
          
          <div className="col-span-3">
            <select
              value={transaction.category || ''}
              onChange={(e) => onCategoryChange(transaction.id, e.target.value)}
              className="w-full border rounded px-2 py-1 bg-gray-50 text-sm"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-2 flex space-x-2">
            <button 
              className="text-indigo-600 hover:text-indigo-900 text-sm"
              onClick={() => handleEditClick(transaction)}
            >
              Edit
            </button>
            <button 
              className="text-red-600 hover:text-red-900 text-sm"
              onClick={() => onDelete(transaction.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }, [categories, onCategoryChange, onDelete, handleEditClick, processedTransactions]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filter Controls */}
      <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search transactions..."
          className="px-3 py-2 border rounded-md flex-grow max-w-md text-sm"
          value={filter.search}
          onChange={(e) => setFilter(prev => ({...prev, search: e.target.value}))}
          aria-label="Search transactions"
        />
        
        <div className="flex flex-wrap gap-2">
          <select 
            className="px-3 py-2 border rounded-md text-sm"
            value={filter.category}
            onChange={(e) => setFilter(prev => ({...prev, category: e.target.value}))}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <button 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            onClick={() => {
              setFilter({search: '', category: 'all'});
              setSortConfig({key: 'date', direction: 'desc'});
            }}
            aria-label="Reset filters"
          >
            Reset Filters
          </button>
          
          {/* Reset All Button */}
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            onClick={() => setShowResetConfirm(true)}
            aria-label="Reset all transactions"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b">
        <div 
          className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer flex items-center"
          onClick={() => handleSort('date')}
          role="columnheader"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleSort('date')}
        >
          Date
          {sortConfig.key === 'date' && (
            <span className="ml-1">
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
        
        <div 
          className="col-span-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer flex items-center"
          onClick={() => handleSort('merchant')}
          role="columnheader"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleSort('merchant')}
        >
          Merchant
          {sortConfig.key === 'merchant' && (
            <span className="ml-1">
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
        
        <div 
          className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer flex items-center"
          onClick={() => handleSort('amount')}
          role="columnheader"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleSort('amount')}
        >
          Amount
          {sortConfig.key === 'amount' && (
            <span className="ml-1">
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
        
        <div className="col-span-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Category
        </div>
        
        <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </div>
      </div>

      {/* Virtualized List Body */}
      <div className="h-[400px] min-h-full">
        {processedTransactions.length > 0 ? (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={processedTransactions.length}
                itemSize={65} // Height of each row
                width={width}
                itemKey={(index) => processedTransactions[index].id}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
            {filter.search || filter.category !== 'all' ? (
              <button 
                className="mt-2 text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                onClick={() => setFilter({search: '', category: 'all'})}
                aria-label="Clear filters"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {isEditing && editingTransaction && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsEditing(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-medium mb-4">Edit Transaction</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    date: e.target.value
                  }))}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant
                </label>
                <input
                  type="text"
                  value={formData.merchant || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    merchant: e.target.value
                  }))}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    amount: parseFloat(e.target.value)
                  }))}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    category: e.target.value
                  }))}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset All Confirmation Modal */}
      {showResetConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowResetConfirm(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-medium mb-4">Confirm Reset</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete ALL transactions? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Delete All Transactions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(TransactionList);