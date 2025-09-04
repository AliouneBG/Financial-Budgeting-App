import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import CategoryManager from '../components/CategoryManager';
import DashboardSummary from '../components/DashboardSummary';
import BudgetTracker from '../components/BudgetTracker';
import DataExporter from '../components/DataExporter';
import SpendingChart from '../components/SpendingChart';
import AIAssistant from '../components/AIAssistant';
import RuleBasedInsights from '../components/RuleBasedInsights'; // Add this import
import type { Transaction, Category } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, categoriesRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/categories')
        ]);
        
        // Ensure consistent category names
        const categoryMap = new Map(categoriesRes.data.map(c => [c.id, c.name]));
        
        const transactionsWithCategories = transactionsRes.data.map(tx => ({
          ...tx,
          // Use consistent category names
          category: tx.category_id ? categoryMap.get(tx.category_id) || 'Uncategorized' : 'Uncategorized'
        }));
        
        setTransactions(transactionsWithCategories);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddTransaction = async (transaction: Transaction) => {
    try {
      // Convert category name to ID
      const categoryObj = categories.find(c => c.name === transaction.category);
      if (!categoryObj) return;
  
      // Create new transaction with category_id
      const txWithCategoryId = {
        ...transaction,
        category_id: categoryObj.id
      };
  
      const response = await api.post('/transactions', txWithCategoryId);
      
      // Add category name to the response
      const newTx = {
        ...response.data,
        category: categoryObj.name
      };
      
      setTransactions(prev => [...prev, newTx]);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };
  
  const handleEditTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      // If updating category, convert to ID
      let updatePayload = {...updates};
      if (updates.category) {
        const categoryObj = categories.find(c => c.name === updates.category);
        if (!categoryObj) return;
        
        updatePayload = {
          ...updates,
          category_id: categoryObj.id,
          category: undefined // Remove the name from payload
        };
      }
  
      const response = await api.put(`/transactions/${id}`, updatePayload);
      
      // Update local state with category name
      const updatedTx = {
        ...response.data,
        category: updates.category || 
                 transactions.find(t => t.id === id)?.category ||
                 categories.find(c => c.id === response.data.category_id)?.name
      };
  
      setTransactions(prev => 
        prev.map(tx => tx.id === id ? updatedTx : tx)
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };
  
    const handleDeleteTransaction = async (id: string) => {
      try {
        await api.delete(`/transactions/${id}`);
        setTransactions(prev => prev.filter(tx => tx.id !== id));
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    };
  
  const handleCategoryChange = async (id: string, category: string) => {
    try {
      const categoryObj = categories.find(c => c.name === category);
      if (!categoryObj) return;
  
      // Find the current transaction
      const currentTx = transactions.find(t => t.id === id);
      if (!currentTx) return;
  
      // Send all required fields + updated category_id
      await api.put(`/transactions/${id}`, {
        ...currentTx,
        category_id: categoryObj.id.toString()  // Ensure ID is string
      });
      
      // Update local state
      setTransactions(prev => 
        prev.map(tx => tx.id === id ? { ...tx, category } : tx)
      );
    } catch (error: any) {
      console.error('Error updating category:', 
        error.response?.data || error.message
      );
    }
  };
  
const handleAddCategory = async (category: Category) => {
  try {
    // Prevent duplicate category names
    if (categories.some(c => c.name.toLowerCase() === category.name.toLowerCase())) {
      console.error('Category name already exists');
      return;
    }
    
    // Send the category data to the server
    const response = await api.post('/categories', {
      name: category.name,
      color: category.color,
      budget: category.budget // Add a default budget value
    });
    
    // Update local state with the response from server
    setCategories(prev => [...prev, response.data]);
  } catch (error) {
    console.error('Error adding category:', error);
  }
};
  
    const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
      try {
        const response = await api.put(`/categories/${id}`, updates);
        setCategories(prev => 
          prev.map(cat => cat.id === id ? { ...cat, ...response.data } : cat)
        );
      } catch (error) {
        console.error('Error updating category:', error);
      }
    };
  
    const handleDeleteCategory = async (id: string) => {
      try {
        await api.delete(`/categories/${id}`);
        setCategories(prev => prev.filter(cat => cat.id !== id));
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    };
  
    const handleResetAllTransactions = async () => {
      try {
        await api.delete('/transactions');
        setTransactions([]);
      } catch (error) {
        console.error('Error resetting transactions:', error);
      }
    };
  
  const handleBudgetChange = async (categoryId: string, budget: number) => {
    try {
      // Find the category by ID
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;
  
      // Send only the necessary fields to the server
      const payload = {
        budget: budget,
        name: category.name, // Keep existing name
        color: category.color // Keep existing color
      };
  
      const response = await api.put(`/categories/${categoryId}`, payload);
      
      // Update local state with the response data
      setCategories(prev => 
        prev.map(cat => cat.id === categoryId ? response.data : cat)
      );
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };
  
    if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
  
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-indigo-700">BudgetWise</h1>
              <nav className="flex space-x-4">
                <span className="text-gray-700 font-medium">Welcome, {user?.username}</span>
                <button 
                  onClick={logout}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </header>
  
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* AI Assistant */}
              <AIAssistant transactions={transactions} />
              
              {/* Rule-Based Insights - Add this component */}
              <RuleBasedInsights 
                transactions={transactions}
                categories={categories}
              />
              
              <DashboardSummary transactions={transactions} />
              <SpendingChart 
                transactions={transactions}
                categories={categories}
              />
  
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>
                  <span className="text-sm text-gray-500">
                    {transactions.length} transactions
                  </span>
                </div>
                <TransactionList
                  transactions={transactions}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                  onCategoryChange={handleCategoryChange}
                  categories={categories.map(c => c.name)}
                  onResetAll={handleResetAllTransactions}
                />
              </div>
  
              <TransactionForm 
                onSubmit={handleAddTransaction} 
                categories={categories.map(c => c.name)}
              />
            </div>
  
            <div className="lg:col-span-1 space-y-8">
              <BudgetTracker
                categories={categories}
                transactions={transactions}
                onBudgetChange={handleBudgetChange}
              />
  
              <DataExporter
                transactions={transactions}
                categories={categories}
              />
  
              <CategoryManager
                categories={categories}
                onAdd={handleAddCategory}
                onUpdate={handleUpdateCategory}
                onDelete={handleDeleteCategory}
              />
            </div>
          </div>
        </main>
  
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} BudgetWise. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  };
  
  export default Dashboard;