import React, { useState, useEffect, useMemo } from 'react';
import type { Category, Transaction, BudgetAlert } from '../types';
import { formatCurrency } from '../utils/formatters';
import BudgetGoalModal from './BudgetGoalModal';

interface BudgetTrackerProps {
  categories: Category[];
  transactions: Transaction[];
  onBudgetChange: (categoryId: string, budget: number) => void;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ 
  categories, 
  transactions,
  onBudgetChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [spendingData, setSpendingData] = useState<Record<string, number>>({});
  const [monthlyReport, setMonthlyReport] = useState<{month: string, year: number, income: number, expenses: number, net: number} | null>(null);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);

  // Get categories without budgets for new goal creation
  const availableCategories = useMemo(() => {
    return categories
      .filter(cat => !cat.budget || cat.budget <= 0)
      .map(cat => cat.name);
  }, [categories]);

  // Calculate spending per category for current month
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const newSpendingData: Record<string, number> = {};
    const newAlerts: BudgetAlert[] = [];
    
    categories.forEach(category => {
      const spent = transactions
        .filter(tx => 
          tx.category === category.name && 
          tx.amount < 0 &&
          new Date(tx.date).getMonth() === currentMonth &&
          new Date(tx.date).getFullYear() === currentYear
        )
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
      newSpendingData[category.id] = spent;
      
      // Generate alerts for overspending
      if (category.budget && spent > category.budget) {
        const overspendAmount = spent - category.budget;
        newAlerts.push({
          id: `${category.id}-${Date.now()}`,
          message: `Overspent ${formatCurrency(overspendAmount)} on ${category.name} this month!`,
          date: new Date().toISOString(),
          resolved: false
        });
      }
    });
    
    setSpendingData(newSpendingData);
    setAlerts(newAlerts);
    generateMonthlyReport(currentMonth, currentYear);
  }, [categories, transactions]);

  const generateMonthlyReport = (month: number, year: number) => {
    const monthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === month && txDate.getFullYear() === year;
    });
    
    const income = monthTransactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expenses = monthTransactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    setMonthlyReport({
      month: new Date(year, month).toLocaleString('default', { month: 'long' }),
      year,
      income,
      expenses,
      net: income - expenses
    });
  };

  const handleOpenBudgetModal = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleDeleteBudget = (categoryId: string) => {
    onBudgetChange(categoryId, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Budget Goals</h2>
        {alerts.length > 0 && (
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute -top-1 -right-1"></div>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {alerts.length} alerts
            </span>
          </div>
        )}
      </div>

      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
          <h3 className="font-medium text-red-800 mb-1">Budget Alerts</h3>
          <ul className="list-disc pl-5 text-sm text-red-700">
            {alerts.map((alert) => (
              <li key={alert.id}>{alert.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Budget Progress */}
      <div className="space-y-5">
        {categories
          .filter(cat => cat.budget !== undefined && cat.budget > 0)
          .map(category => {
            const spent = spendingData[category.id] || 0;
            const budget = category.budget || 0;
            const percentage = Math.min(100, (spent / budget) * 100);
            const statusColor = percentage > 90 ? 'bg-red-500' : 
                              percentage > 75 ? 'bg-yellow-500' : 'bg-green-500';
            
            return (
              <div key={category.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    ></span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(spent)} / {formatCurrency(budget)}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${statusColor}`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {percentage.toFixed(0)}% spent • {formatCurrency(budget - spent)} remaining
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleOpenBudgetModal(category)}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Adjust
                    </button>
                    <button 
                      onClick={() => handleDeleteBudget(category.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        
        <div className="pt-2">
          <button 
            onClick={() => handleOpenBudgetModal({
              id: 'new',
              name: '',
              color: '#9CA3AF',
              budget: 0
            })}
            className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Budget Goal
          </button>
        </div>
      </div>

      {/* Monthly Report Preview */}
      {monthlyReport && (
        <div className="mt-6 pt-4 border-t">
          <h3 className="font-medium text-gray-700 mb-2">
            {monthlyReport.month} {monthlyReport.year} Report
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">Income:</div>
            <div className="text-right font-medium">{formatCurrency(monthlyReport.income)}</div>
            
            <div className="text-gray-600">Expenses:</div>
            <div className="text-right font-medium text-red-600">{formatCurrency(monthlyReport.expenses)}</div>
            
            <div className="text-gray-600">Net Savings:</div>
            <div className={`text-right font-medium ${
              monthlyReport.net >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(monthlyReport.net)}
            </div>
          </div>
        </div>
      )}

      {/* Budget Goal Modal */}
      {selectedCategory && (
        <BudgetGoalModal 
          category={selectedCategory}
          availableCategories={availableCategories}
          onSave={(budget, categoryName) => {
            if (selectedCategory.id === 'new' && categoryName) {
              const actualCategory = categories.find(c => c.name === categoryName);
              if (actualCategory) {
                onBudgetChange(actualCategory.id, budget);
              }
            } else {
              onBudgetChange(selectedCategory.id, budget);
            }
            setSelectedCategory(null);
          }}
          onCancel={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
};

export default BudgetTracker;