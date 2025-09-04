
export enum Recurrence {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}
export interface Transaction {
  id: string;
  date: string; // ISO format: YYYY-MM-DD
  merchant: string;
  amount: number;
  category?: string;
  description?: string;
  recurrence: Recurrence;
  nextOccurrence?: string; // ISO date
}


export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESET' | 'DELETE_CATEGORY';
  entityType: 'TRANSACTION' | 'CATEGORY' | 'BUDGET' | 'ALL_TRANSACTIONS';
  entityId: string;
  previousState?: string;
  newState?: string;
}

export interface Category {
  id: string;
  name: string;
  budget?: number; 
  color: string;
  spent?: number; 
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  auditLogs: AuditLog[];
}

export interface CategoryBreakdown {
  [key: string]: {
    budget: number;
    spent: number;
  };
}

export interface MonthlyReport {
  period: string;
  startDate: string;
  endDate: string;
  income: number;
  expenses: number;
  net: number;
  categories: CategoryBreakdown;
  transactions: Transaction[];
}

export interface BudgetAlert {
  id: string;
  message: string;
  date: string;
  resolved: boolean;
}

export interface RuleBasedInsight {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  category?: string;
  amount?: number;
  date: string;
}

export interface InsightRule {
  id: string;
  name: string;
  description: string;
  condition: (transactions: Transaction[], categories: Category[]) => boolean;
  generateMessage: (transactions: Transaction[], categories: Category[]) => string;
  type: 'warning' | 'info' | 'success';
}