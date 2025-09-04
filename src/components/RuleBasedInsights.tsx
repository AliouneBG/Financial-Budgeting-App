import React, { useMemo } from 'react';
import type { Transaction, Category, RuleBasedInsight, InsightRule } from '../types';
import { formatCurrency } from '../utils/formatters';

interface RuleBasedInsightsProps {
  transactions: Transaction[];
  categories: Category[];
}

const RuleBasedInsights: React.FC<RuleBasedInsightsProps> = ({ transactions, categories }) => {
  // Define insight rules
  const insightRules: InsightRule[] = useMemo(() => [
    {
      id: 'high-spending-category',
      name: 'High Spending in Category',
      description: 'Warn when spending in a category exceeds a threshold',
      condition: (transactions, categories) => {
        const categorySpending: Record<string, number> = {};
        
        transactions.forEach(tx => {
          if (tx.amount < 0 && tx.category) {
            categorySpending[tx.category] = (categorySpending[tx.category] || 0) + Math.abs(tx.amount);
          }
        });
        
        return Object.values(categorySpending).some(amount => amount > 500);
      },
      generateMessage: (transactions, categories) => {
        const categorySpending: Record<string, number> = {};
        
        transactions.forEach(tx => {
          if (tx.amount < 0 && tx.category) {
            categorySpending[tx.category] = (categorySpending[tx.category] || 0) + Math.abs(tx.amount);
          }
        });
        
        const highSpendingCategories = Object.entries(categorySpending)
          .filter(([_, amount]) => amount > 500)
          .map(([category, amount]) => `${category} (${formatCurrency(amount)})`);
        
        return `High spending detected in: ${highSpendingCategories.join(', ')}. Consider reviewing these categories.`;
      },
      type: 'warning'
    },
    {
      id: 'budget-exceeded',
      name: 'Budget Exceeded',
      description: 'Alert when spending exceeds budget in any category',
      condition: (transactions, categories) => {
        const categorySpending: Record<string, number> = {};
        
        transactions.forEach(tx => {
          if (tx.amount < 0 && tx.category) {
            categorySpending[tx.category] = (categorySpending[tx.category] || 0) + Math.abs(tx.amount);
          }
        });
        
        return categories.some(category => {
          if (!category.budget) return false;
          const spent = categorySpending[category.name] || 0;
          return spent > category.budget;
        });
      },
      generateMessage: (transactions, categories) => {
        const categorySpending: Record<string, number> = {};
        
        transactions.forEach(tx => {
          if (tx.amount < 0 && tx.category) {
            categorySpending[tx.category] = (categorySpending[tx.category] || 0) + Math.abs(tx.amount);
          }
        });
        
        const exceededCategories = categories
          .filter(category => {
            if (!category.budget) return false;
            const spent = categorySpending[category.name] || 0;
            return spent > category.budget;
          })
          .map(category => {
            const spent = categorySpending[category.name] || 0;
            return `${category.name} (${formatCurrency(spent)} / ${formatCurrency(category.budget!)})`;
          });
        
        return `Budget exceeded in: ${exceededCategories.join(', ')}. Consider adjusting your spending or budget.`;
      },
      type: 'warning'
    },
    {
      id: 'recurring-expense-detected',
      name: 'Recurring Expense Detected',
      description: 'Identify potential recurring expenses',
      condition: (transactions, categories) => {
        const merchantCount: Record<string, number> = {};
        
        transactions.forEach(tx => {
          if (tx.amount < 0) {
            merchantCount[tx.merchant] = (merchantCount[tx.merchant] || 0) + 1;
          }
        });
        
        return Object.values(merchantCount).some(count => count >= 3);
      },
      generateMessage: (transactions, categories) => {
        const merchantCount: Record<string, number> = {};
        
        transactions.forEach(tx => {
          if (tx.amount < 0) {
            merchantCount[tx.merchant] = (merchantCount[tx.merchant] || 0) + 1;
          }
        });
        
        const recurringMerchants = Object.entries(merchantCount)
          .filter(([_, count]) => count >= 3)
          .map(([merchant, count]) => `${merchant} (${count} transactions)`);
        
        return `Potential recurring expenses detected: ${recurringMerchants.join(', ')}. Consider setting up a budget for these.`;
      },
      type: 'info'
    },
    {
      id: 'savings-opportunity',
      name: 'Savings Opportunity',
      description: 'Identify areas where you can save money',
      condition: (transactions, categories) => {
        const categorySpending: Record<string, number> = {};
        
        transactions.forEach(tx => {
          if (tx.amount < 0 && tx.category) {
            categorySpending[tx.category] = (categorySpending[tx.category] || 0) + Math.abs(tx.amount);
          }
        });
        
        // Check if there's significant spending in discretionary categories
        const discretionaryCategories = ['Dining', 'Entertainment', 'Shopping'];
        return discretionaryCategories.some(category => 
          categorySpending[category] > 300
        );
      },
      generateMessage: (transactions, categories) => {
        const categorySpending: Record<string, number> = {};
        
        transactions.forEach(tx => {
          if (tx.amount < 0 && tx.category) {
            categorySpending[tx.category] = (categorySpending[tx.category] || 0) + Math.abs(tx.amount);
          }
        });
        
        const highSpendingCategories = Object.entries(categorySpending)
          .filter(([category, amount]) => 
            ['Dining', 'Entertainment', 'Shopping'].includes(category) && amount > 300
          )
          .map(([category, amount]) => `${category} (${formatCurrency(amount)})`);
        
        return `Savings opportunity: High spending in discretionary categories: ${highSpendingCategories.join(', ')}. Consider reducing these expenses.`;
      },
      type: 'info'
    },
    {
      id: 'positive-net-flow',
      name: 'Positive Cash Flow',
      description: 'Celebrate positive net cash flow',
      condition: (transactions, categories) => {
        const income = transactions
          .filter(tx => tx.amount > 0)
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        const expenses = transactions
          .filter(tx => tx.amount < 0)
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        
        return income > expenses;
      },
      generateMessage: (transactions, categories) => {
        const income = transactions
          .filter(tx => tx.amount > 0)
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        const expenses = transactions
          .filter(tx => tx.amount < 0)
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        
        const net = income - expenses;
        
        return `Great job! You have a positive net cash flow of ${formatCurrency(net)} this month.`;
      },
      type: 'success'
    }
  ], []);

  // Generate insights based on rules
  const insights = useMemo(() => {
    const generatedInsights: RuleBasedInsight[] = [];
    
    insightRules.forEach(rule => {
      if (rule.condition(transactions, categories)) {
        generatedInsights.push({
          id: rule.id,
          title: rule.name,
          message: rule.generateMessage(transactions, categories),
          type: rule.type,
          date: new Date().toISOString()
        });
      }
    });
    
    return generatedInsights;
  }, [transactions, categories, insightRules]);

  if (insights.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-amber-800';
      case 'info': return 'text-blue-800';
      case 'success': return 'text-green-800';
      default: return 'text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Rule-Based Insights</h2>
      <div className="space-y-3">
        {insights.map(insight => (
          <div 
            key={insight.id}
            className={`p-4 rounded-lg border ${getBgColor(insight.type)} ${getTextColor(insight.type)}`}
          >
            <div className="flex items-start">
              <span className="text-lg mr-2">{getIcon(insight.type)}</span>
              <div>
                <h3 className="font-medium">{insight.title}</h3>
                <p className="text-sm mt-1">{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RuleBasedInsights;