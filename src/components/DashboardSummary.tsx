// src/components/DashboardSummary.tsx
import React from 'react';
import type{ Transaction } from '../types';

const DashboardSummary: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  // Calculate financial metrics
 const calculateMetrics = () => {
  let income = 0;
  let expenses = 0;
  const categoryTotals: Record<string, number> = {};

  transactions.forEach(transaction => {
    if (transaction.amount >= 0) {
      income += transaction.amount;
    } else {
      expenses += Math.abs(transaction.amount);
      
      // Use the category name directly
      const category = transaction.category || 'Uncategorized';
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);
    }
  });

    const net = income - expenses;
    
    // Get top 3 spending categories
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, amount]) => ({ name, amount }));

    return { income, expenses, net, topCategories };
  };

  const { income, expenses, net, topCategories } = calculateMetrics();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-green-800 text-sm font-medium mb-1">Income</div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(income)}</div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-red-800 text-sm font-medium mb-1">Expenses</div>
          <div className="text-2xl font-bold text-red-700">{formatCurrency(expenses)}</div>
        </div>
        
        <div className={`rounded-lg p-4 ${
          net >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
        }`}>
          <div className="text-sm font-medium mb-1">Net Savings</div>
          <div className="text-2xl font-bold">
            {net >= 0 ? '+' : ''}{formatCurrency(net)}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium text-gray-700 mb-3">Top Spending Categories</h3>
        <div className="space-y-4">
          {topCategories.length > 0 ? (
            topCategories.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{category.name}</span>
                  <span className="font-medium">{formatCurrency(category.amount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(category.amount / expenses) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-2">No spending data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;