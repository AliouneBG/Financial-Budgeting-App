import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import type { MonthlyReport, Transaction } from '../types';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
    paddingBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937'
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 4
  },
  summaryBox: {
    alignItems: 'center',
    width: '30%'
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280'
  },
  positive: {
    color: '#10B981'
  },
  negative: {
    color: '#EF4444'
  },
  tableContainer: {
    marginBottom: 15
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 8
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  tableCell: {
    fontSize: 10,
    flex: 1
  },
  headerCell: {
    fontSize: 10,
    fontWeight: 'bold',
    flex: 1
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444'
  }
});

interface MonthlyReportPDFProps {
  report: MonthlyReport | null;
}

// Helper function to safely format dates
const safeDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

// Helper function to safely convert to number
const toNumber = (value: any, fallback = 0) => {
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? fallback : num;
};

const MonthlyReportPDF: React.FC<MonthlyReportPDFProps> = ({ report }) => {
  // Handle completely missing report
  if (!report) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Error: Report data is not available
            </Text>
            <Text style={styles.errorText}>
              Please try generating the report again
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  try {
    // Validate critical report properties
    if (!report.period || !report.startDate || !report.endDate) {
      throw new Error('Report data is incomplete');
    }

    // Safely calculate financial summary values
    const income = toNumber(report.income);
    const expenses = toNumber(report.expenses);
    const net = toNumber(report.net, income - expenses);

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>BudgetWise</Text>
              <Text style={styles.subtitle}>Monthly Financial Report</Text>
            </View>
            <Text style={styles.subtitle}>
              {report.period} ({safeDate(report.startDate)} - {safeDate(report.endDate)})
            </Text>
          </View>

          {/* Financial Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial Summary</Text>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryValue}>
                  ${income.toFixed(2)}
                </Text>
                <Text style={styles.summaryLabel}>Total Income</Text>
              </View>
              
              <View style={styles.summaryBox}>
                <Text style={[styles.summaryValue, styles.negative]}>
                  ${expenses.toFixed(2)}
                </Text>
                <Text style={styles.summaryLabel}>Total Expenses</Text>
              </View>
              
              <View style={styles.summaryBox}>
                <Text style={[
                  styles.summaryValue,
                  net >= 0 ? styles.positive : styles.negative
                ]}>
                  ${net.toFixed(2)}
                </Text>
                <Text style={styles.summaryLabel}>Net Savings</Text>
              </View>
            </View>
          </View>

          {/* Category Breakdown */}
          {report.categories && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category Breakdown</Text>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={styles.headerCell}>Category</Text>
                  <Text style={styles.headerCell}>Budget</Text>
                  <Text style={styles.headerCell}>Spent</Text>
                  <Text style={styles.headerCell}>Remaining</Text>
                  <Text style={styles.headerCell}>% Spent</Text>
                </View>
                
                {Object.entries(report.categories).map(([category, data]) => {
                  // Safely convert to numbers with fallbacks
                  const budget = toNumber(data.budget);
                  const spent = toNumber(data.spent);
                  const remaining = budget - spent;
                  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                  
                  return (
                    <View key={category} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{category}</Text>
                      <Text style={styles.tableCell}>${budget.toFixed(2)}</Text>
                      <Text style={styles.tableCell}>${spent.toFixed(2)}</Text>
                      <Text style={styles.tableCell}>${remaining.toFixed(2)}</Text>
                      <Text style={styles.tableCell}>
                        {budget > 0 ? percentage.toFixed(0) + '%' : 'N/A'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Transactions Preview */}
          {report.transactions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={styles.headerCell}>Date</Text>
                  <Text style={styles.headerCell}>Merchant</Text>
                  <Text style={styles.headerCell}>Amount</Text>
                  <Text style={styles.headerCell}>Category</Text>
                </View>
                
                {report.transactions.slice(0, 10).map((tx: Transaction) => (
                  <View key={tx.id} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{safeDate(tx.date)}</Text>
                    <Text style={styles.tableCell}>{tx.merchant || 'N/A'}</Text>
                    <Text style={[
                      styles.tableCell,
                      tx.amount >= 0 ? styles.positive : styles.negative
                    ]}>
                      ${Math.abs(toNumber(tx.amount)).toFixed(2)}
                    </Text>
                    <Text style={styles.tableCell}>{tx.category || 'Uncategorized'}</Text>
                  </View>
                ))}
              </View>
              {report.transactions.length > 10 && (
                <Text style={{ fontSize: 10, marginTop: 5, textAlign: 'center' }}>
                  Showing 10 of {report.transactions.length} transactions
                </Text>
              )}
            </View>
          )}

          <View style={styles.footer}>
            <Text>Generated on {new Date().toLocaleDateString()} by BudgetWise • Confidential</Text>
          </View>
        </Page>
      </Document>
    );
  } catch (error) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Error generating PDF report
            </Text>
            <Text style={styles.errorText}>
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </Text>
          </View>
        </Page>
      </Document>
    );
  }
};

export default MonthlyReportPDF;