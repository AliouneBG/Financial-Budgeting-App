import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartData } from 'chart.js';
import type { Category, Transaction } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SpendingChartProps {
  transactions: Transaction[];
  categories: Category[];
}

const SpendingChart: React.FC<SpendingChartProps> = ({ transactions, categories }) => {
  // Get unique transaction categories with actual spending
  const spendingCategories = Array.from(
    new Set(
      transactions
        .filter(tx => tx.amount < 0)
        .map(tx => tx.category)
    )
  );

  // Process data for chart
  const categorySpending = spendingCategories.map(categoryName => {
    const spent = transactions
      .filter(tx => tx.category === categoryName && tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const category = categories.find(c => c.name === categoryName);
    
    return {
      name: categoryName,
      amount: spent,
      color: category?.color || 'bg-gray-100 text-gray-800'
    };
  }).filter(item => item.amount > 0);

  // Calculate total spending for percentage calculation
  const totalSpending = categorySpending.reduce((sum, item) => sum + item.amount, 0);

  // Prepare chart data
  const data: ChartData<"pie", number[], string> = {
    labels: categorySpending.map(item => item.name).filter((label): label is string => !!label),
    datasets: [
      {
        data: categorySpending.map(item => item.amount),
        backgroundColor: categorySpending.map(item => {
          const colorClass = item.color.split(' ')[0];
          if (colorClass === 'bg-blue-100') return 'rgba(59, 130, 246, 0.7)';
          if (colorClass === 'bg-green-100') return 'rgba(16, 185, 129, 0.7)';
          if (colorClass === 'bg-yellow-100') return 'rgba(234, 179, 8, 0.7)';
          if (colorClass === 'bg-purple-100') return 'rgba(139, 92, 246, 0.7)';
          if (colorClass === 'bg-red-100') return 'rgba(239, 68, 68, 0.7)';
          if (colorClass === 'bg-pink-100') return 'rgba(236, 72, 153, 0.7)';
          if (colorClass === 'bg-indigo-100') return 'rgba(99, 102, 241, 0.7)';
          if (colorClass === 'bg-emerald-100') return 'rgba(16, 185, 129, 0.7)';
          return 'rgba(156, 163, 175, 0.7)';
        }),
        borderColor: categorySpending.map(item => {
          const colorClass = item.color.split(' ')[0];
          if (colorClass === 'bg-blue-100') return 'rgb(59, 130, 246)';
          if (colorClass === 'bg-green-100') return 'rgb(16, 185, 129)';
          if (colorClass === 'bg-yellow-100') return 'rgb(234, 179, 8)';
          if (colorClass === 'bg-purple-100') return 'rgb(139, 92, 246)';
          if (colorClass === 'bg-red-100') return 'rgb(239, 68, 68)';
          if (colorClass === 'bg-pink-100') return 'rgb(236, 72, 153)';
          if (colorClass === 'bg-indigo-100') return 'rgb(99, 102, 241)';
          if (colorClass === 'bg-emerald-100') return 'rgb(16, 185, 129)';
          return 'rgb(156, 163, 175)';
        }),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Spending Distribution</h2>
      {categorySpending.length > 0 ? (
        <div className="h-64">
          <Pie 
            data={data} 
            options={{ 
              maintainAspectRatio: false,
              plugins: {
                legend: { 
                  position: 'right',
                  labels: {
                    generateLabels: (chart) => {
                      const datasets = chart.data.datasets;
                      if (datasets.length === 0) return [];
                      
                      const bgColors = datasets[0].backgroundColor as string[];
                      const borderColors = datasets[0].borderColor as string[];
                      const dataPoints = datasets[0].data as number[];
                      
                      const total = dataPoints.reduce((a, b) => a + b, 0);
                      
                      return chart.data.labels!.map((label, i) => {
                        const value = dataPoints[i];
                        const percentage = total > 0 
                          ? Math.round((value / total) * 100) 
                          : 0;
                          
                        return {
                          text: `${label}: ${percentage}%`,
                          fillStyle: bgColors[i],
                          strokeStyle: borderColors[i],
                          lineWidth: 1,
                          hidden: false,
                          index: i
                        };
                      });
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const value = context.parsed;
                      const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                      const percentage = total > 0 
                        ? Math.round((value / total) * 100) 
                        : 0;
                      return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                    }
                  }
                }
              }
            }} 
          />
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No spending data to display
        </div>
      )}
    </div>
  );
};

export default SpendingChart;