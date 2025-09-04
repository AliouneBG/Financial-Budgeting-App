import React, { createContext, useContext, useEffect, useReducer, type Dispatch } from 'react';
import { type AppState, type Transaction, type Category, Recurrence, type AuditLog } from '../types';

const LOCAL_STORAGE_KEY = 'budgetwise-app-state';

// Initial state
const initialState: AppState = {
  transactions: [],
  categories: [
    { id: '1', name: 'Housing', color: 'bg-blue-100 text-blue-800' },
    { id: '2', name: 'Food', color: 'bg-green-100 text-green-800' },
    { id: '3', name: 'Transportation', color: 'bg-yellow-100 text-yellow-800' },
    { id: '4', name: 'Entertainment', color: 'bg-purple-100 text-purple-800' },
    { id: '5', name: 'Utilities', color: 'bg-red-100 text-red-800' },
    { id: '6', name: 'Healthcare', color: 'bg-pink-100 text-pink-800' },
    { id: '7', name: 'Income', color: 'bg-emerald-100 text-emerald-800' },
  ],
  auditLogs: [],
};

// Action types
type Action =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<Category> } }
  | { type: 'DELETE_CATEGORY'; payload: string } // ✅ Added
  | { type: 'RESET_ALL_TRANSACTIONS' };

// Reducer function
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      const tx = action.payload;
      const auditLog: AuditLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: 'CREATE',
        entityType: 'TRANSACTION',
        entityId: tx.id,
      };

      if (tx.recurrence !== Recurrence.NONE) {
        const occurrences = generateOccurrences(tx);
        return {
          ...state,
          transactions: [...state.transactions, ...occurrences],
          auditLogs: [...state.auditLogs, auditLog],
        };
      }

      return {
        ...state,
        transactions: [...state.transactions, tx],
        auditLogs: [...state.auditLogs, auditLog],
      };
    }

    case 'UPDATE_TRANSACTION': {
      const { id, updates } = action.payload;
      return {
        ...state,
        transactions: state.transactions.map(tx =>
          tx.id === id ? { ...tx, ...updates } : tx
        ),
      };
    }

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(tx => tx.id !== action.payload),
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(cat =>
          cat.id === action.payload.id ? { ...cat, ...action.payload.updates } : cat
        ),
      };

    case 'DELETE_CATEGORY': {
      const updatedCategories = state.categories.filter(cat => cat.id !== action.payload);
      const updatedTransactions = state.transactions.map(tx =>
        tx.category === action.payload ? { ...tx, category: undefined } : tx
      );

      const auditLog: AuditLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: 'DELETE_CATEGORY',
        entityType: 'CATEGORY',
        entityId: action.payload,
      };

      return {
        ...state,
        categories: updatedCategories,
        transactions: updatedTransactions,
        auditLogs: [...state.auditLogs, auditLog],
      };
    }

    case 'RESET_ALL_TRANSACTIONS':
      return {
        ...state,
        transactions: [],
        auditLogs: [
          ...state.auditLogs,
          {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action: 'RESET',
            entityType: 'ALL_TRANSACTIONS',
            entityId: 'RESET',
          },
        ],
      };

    default:
      return state;
  }
}

// Helper function to generate recurring transactions
function generateOccurrences(tx: Transaction): Transaction[] {
  const occurrences = [];
  const baseDate = new Date(tx.date);

  for (let i = 1; i <= 12; i++) {
    const newDate = new Date(baseDate);

    switch (tx.recurrence) {
      case Recurrence.DAILY:
        newDate.setDate(newDate.getDate() + i);
        break;
      case Recurrence.WEEKLY:
        newDate.setDate(newDate.getDate() + 7 * i);
        break;
      case Recurrence.MONTHLY:
        newDate.setMonth(newDate.getMonth() + i);
        break;
      case Recurrence.YEARLY:
        newDate.setFullYear(newDate.getFullYear() + i);
        break;
    }

    occurrences.push({
      ...tx,
      id: `${tx.id}-${i}`,
      date: newDate.toISOString().split('T')[0],
      nextOccurrence: i === 1 ? newDate.toISOString() : undefined,
    });
  }

  return occurrences;
}

// Create context
const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const savedState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || 'null');
  const [state, dispatch] = useReducer(appReducer, savedState || initialState);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useAppContext = () => useContext(AppContext);
