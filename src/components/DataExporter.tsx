import React, { useState, useMemo, useCallback } from 'react';
import type { Transaction, Category, MonthlyReport } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CSVLink } from 'react-csv';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MonthlyReportPDF from './MonthlyReportPDF';

interface DataExporterProps {
  transactions: Transaction[];
  categories: Category[];
}

const DataExporter: React.FC<DataExporterProps> = ({ transactions, categories }) => {
  const [exportType, setExportType] = useState<'csv' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Prepare CSV data
  const prepareCSVData = useCallback(() => {
    return transactions
      .filter(tx => {
        const txDate = new Date(tx.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return txDate >= startDate && txDate <= endDate;
      })
      .map(tx => ({
        Date: formatDate(tx.date),
        Merchant: tx.merchant,
        Amount: tx.amount, // Keep as number for proper sorting in CSV
        Category: tx.category || 'Uncategorized',
        Description: tx.description || '',
        Type: tx.amount >= 0 ? 'Income' : 'Expense'
      }));
  }, [transactions, dateRange]);

  // Generate monthly report data - now pure function without state
  const generateMonthlyReport = useCallback((): MonthlyReport => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    // Add 1 day to include the end date
    const endDatePlusOne = new Date(endDate);
    endDatePlusOne.setDate(endDate.getDate() + 1);
    
    const monthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate < endDatePlusOne;
    });
    
    const income = monthTransactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expenses = monthTransactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const categoryBreakdown: Record<string, { budget: number; spent: number }> = {};
    
    categories.forEach(cat => {
      const spent = monthTransactions
        .filter(tx => tx.category === cat.name && tx.amount < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
      // Ensure budget is always a number
      const budget = typeof cat.budget === 'number' ? cat.budget : 0;
      
      categoryBreakdown[cat.name] = {
        budget,
        spent
      };
    });
    
    return {
      period: `${startDate.toLocaleString('default', { month: 'long' })} ${startDate.getFullYear()}`,
      startDate: dateRange.start,
      endDate: dateRange.end,
      income,
      expenses,
      net: income - expenses,
      categories: categoryBreakdown,
      transactions: monthTransactions
    };
  }, [transactions, categories, dateRange]);

  // Memoize the report for PDF
  const pdfReport = useMemo(() => {
    if (exportType === 'pdf') {
      return generateMonthlyReport();
    }
    return null;
  }, [exportType, generateMonthlyReport]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Export Data</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Export Type
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              className={`px-4 py-2 border rounded-md ${
                exportType === 'csv' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-300'
              }`}
              onClick={() => setExportType('csv')}
            >
              CSV Export
            </button>
            <button
              type="button"
              className={`px-4 py-2 border rounded-md ${
                exportType === 'pdf' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-300'
              }`}
              onClick={() => setExportType('pdf')}
            >
              PDF Report
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="pt-4">
          {exportType === 'csv' ? (
            <CSVLink
              data={prepareCSVData()}
              filename={`budgetwise-export-${dateRange.start}-to-${dateRange.end}.csv`}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV
            </CSVLink>
          ) : (
            <PDFDownloadLink
              document={<MonthlyReportPDF report={pdfReport} />}
              fileName={`budgetwise-report-${dateRange.start}-to-${dateRange.end}.pdf`}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center"
            >
              {({ loading }) => (
                loading ? 'Preparing document...' : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF Report
                  </>
                )
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataExporter;