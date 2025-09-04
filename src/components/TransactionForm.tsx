// src/components/TransactionForm.tsx
import React, { useState, useEffect } from 'react';
import { type Transaction, Recurrence } from '../types';
import { ALL_CATEGORIES } from '../constants/categories';

interface TransactionFormProps {
  onSubmit: (transaction: Transaction) => void;
  transactionToEdit?: Transaction | null;
  onCancel?: () => void;
  categories: string[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onSubmit, 
  transactionToEdit,
  onCancel,
  categories
}) => {
  const [isOpen, setIsOpen] = useState(!transactionToEdit);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    amount: 0,
    category: '',
    description: '',
    recurrence: Recurrence.NONE,
    nextOccurrence: undefined
  });

  // Initialize form when editing
  useEffect(() => {
    if (transactionToEdit) {
      const { id, ...rest } = transactionToEdit;
      setFormData(rest);
      setIsOpen(true);
    }
  }, [transactionToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Clear errors when user corrects them
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleRecurrenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const recurrence = e.target.value as Recurrence;
    
    setFormData(prev => ({
      ...prev,
      recurrence,
      nextOccurrence: recurrence !== Recurrence.NONE 
        ? calculateNextDate(prev.date, recurrence) 
        : undefined
    }));
  };

  const calculateNextDate = (date: string, recurrence: Recurrence): string => {
    const baseDate = new Date(date);
    
    switch (recurrence) {
      case Recurrence.DAILY:
        baseDate.setDate(baseDate.getDate() + 1);
        break;
      case Recurrence.WEEKLY:
        baseDate.setDate(baseDate.getDate() + 7);
        break;
      case Recurrence.MONTHLY:
        baseDate.setMonth(baseDate.getMonth() + 1);
        break;
      case Recurrence.YEARLY:
        baseDate.setFullYear(baseDate.getFullYear() + 1);
        break;
    }
    
    return baseDate.toISOString().split('T')[0];
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.merchant.trim()) {
      newErrors.merchant = 'Merchant is required';
    }
    
    if (formData.amount === 0) {
      newErrors.amount = 'Amount cannot be zero';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit({
      ...formData,
      id: transactionToEdit?.id || Date.now().toString()
    });
    
    // Reset form unless we're in edit mode
    if (!transactionToEdit) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        merchant: '',
        amount: 0,
        category: '',
        description: '',
        recurrence: Recurrence.NONE,
        nextOccurrence: undefined
      });
    }
    
    setIsOpen(false);
    if (onCancel) onCancel();
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (onCancel) onCancel();
  };

  if (!isOpen) {
    return (
      <div className="text-center py-4">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Add new transaction"
        >
          + Add New Transaction
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {transactionToEdit ? 'Edit Transaction' : 'Add Transaction'}
        </h3>
        <button 
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close form"
        >
          ✕
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              required
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? "date-error" : undefined}
            />
            {errors.date && (
              <p id="date-error" className="mt-1 text-sm text-red-600">
                {errors.date}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                $
              </span>
              <input
                type="number"
                name="amount"
                value={formData.amount || ''}
                onChange={handleChange}
                step="1"
                className={`w-full pl-8 pr-3 py-2 border ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                placeholder="0.00"
                required
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? "amount-error" : undefined}
              />
            </div>
            {errors.amount && (
              <p id="amount-error" className="mt-1 text-sm text-red-600">
                {errors.amount}
              </p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Merchant *
          </label>
          <input
            type="text"
            name="merchant"
            value={formData.merchant}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.merchant ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder="Where was this transaction?"
            required
            aria-invalid={!!errors.merchant}
            aria-describedby={errors.merchant ? "merchant-error" : undefined}
          />
          {errors.merchant && (
            <p id="merchant-error" className="mt-1 text-sm text-red-600">
              {errors.merchant}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              required
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? "category-error" : undefined}
            >
             <option value="">Select a category</option>
 {categories.map(cat => (
  <option key={cat} value={cat}>{cat}</option>
))}
            </select>
            {errors.category && (
              <p id="category-error" className="mt-1 text-sm text-red-600">
                {errors.category}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurrence
            </label>
            <select
              name="recurrence"
              value={formData.recurrence}
              onChange={handleRecurrenceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={Recurrence.NONE}>None</option>
              <option value={Recurrence.DAILY}>Daily</option>
              <option value={Recurrence.WEEKLY}>Weekly</option>
              <option value={Recurrence.MONTHLY}>Monthly</option>
              <option value={Recurrence.YEARLY}>Yearly</option>
            </select>
          </div>
        </div>
        
        {formData.recurrence !== Recurrence.NONE && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Occurrence
            </label>
            <input
              type="date"
              name="nextOccurrence"
              value={formData.nextOccurrence || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={formData.recurrence as Recurrence !== Recurrence.NONE}
            />
            <p className="mt-1 text-xs text-gray-500">
              Next occurrence calculated automatically
            </p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Add any additional details"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {transactionToEdit ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;