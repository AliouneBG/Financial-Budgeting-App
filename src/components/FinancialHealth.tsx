import React, { useMemo } from 'react';
import type { Transaction } from '../types';

interface FinancialHealthProps {
  transactions: Transaction[];
}
const formatCurrency = (value: number): string => {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

const FinancialHealth: React.FC<FinancialHealthProps> = ({ transactions }) => {
  // Calculate metrics
  const metrics = useMemo(() => {
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const assets = 0; // Would come from account integration
    const debts = 0; // Would come from account integration
    
    return {
      netWorth: assets - debts,
      debtToIncome: income > 0 ? (debts / income) : 0,
      savingsRate: income > 0 ? ((income - expenses) / income) : 0,
      financialHealthScore: Math.min(
        100, 
        80 + (20 * (1 - Math.min(1, debts / (income || 1)))))
    };
  }, [transactions]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Financial Health</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium">Net Worth</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(metrics.netWorth)}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium">Savings Rate</h3>
          <p className="text-2xl font-bold">
            {(metrics.savingsRate * 100).toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg">
          <h3 className="font-medium">Debt-to-Income</h3>
          <p className="text-2xl font-bold">
            {(metrics.debtToIncome * 100).toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-medium">Health Score</h3>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${metrics.financialHealthScore}%` }}
              ></div>
            </div>
            <span className="ml-2 font-bold">
              {Math.round(metrics.financialHealthScore)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};