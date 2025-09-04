// src/data/mockData.ts
// src/data/mockData.ts
import { Recurrence, type Transaction, type Category } from '../types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Housing', color: 'bg-blue-100 text-blue-800', budget: 1200 },
  { id: '2', name: 'Food', color: 'bg-green-100 text-green-800', budget: 400 },
  { id: '3', name: 'Transportation', color: 'bg-yellow-100 text-yellow-800', budget: 300 },
  { id: '4', name: 'Entertainment', color: 'bg-purple-100 text-purple-800', budget: 200 },
  { id: '5', name: 'Utilities', color: 'bg-red-100 text-red-800', budget: 150 },
  { id: '6', name: 'Healthcare', color: 'bg-pink-100 text-pink-800', budget: 100 },
  { id: '7', name: 'Personal', color: 'bg-indigo-100 text-indigo-800', budget: 100 },
  { id: '8', name: 'Income', color: 'bg-emerald-100 text-emerald-800' },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0],
    merchant: 'Whole Foods',
    amount: -85.32,
    category: 'Food',
    description: 'Weekly groceries',
    recurrence: Recurrence.NONE,
  },
  {
    id: '2',
    date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString().split('T')[0],
    merchant: 'Netflix',
    amount: -15.99,
    category: 'Entertainment',
    description: 'Monthly subscription',
    recurrence: Recurrence.MONTHLY,
    nextOccurrence: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  },
  {
    id: '3',
    date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0],
    merchant: 'Exxon',
    amount: -58.75,
    category: 'Transportation',
    description: 'Gas fill-up',
    recurrence: Recurrence.NONE
  },
  {
    id: '4',
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
    merchant: 'Apple',
    amount: -1299.00,
    category: 'Personal',
    description: 'New MacBook Pro',
    recurrence: Recurrence.NONE
  },
  {
    id: '5',
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
    merchant: 'Employer',
    amount: 2500.00,
    category: 'Income',
    description: 'Monthly salary',
    recurrence: Recurrence.MONTHLY,
    nextOccurrence: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  },
  {
    id: '6',
    date: new Date().toISOString().split('T')[0],
    merchant: 'Amazon',
    amount: -42.50,
    category: 'Personal',
    description: 'Office supplies',
    recurrence: Recurrence.NONE
  },
  {
    id: '7',
    date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0],
    merchant: 'Landlord',
    amount: -1200.00,
    category: 'Housing',
    description: 'Monthly rent',
    recurrence: Recurrence.MONTHLY,
    nextOccurrence: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  },
  {
    id: '8',
    date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString().split('T')[0],
    merchant: 'Comcast',
    amount: -89.99,
    category: 'Utilities',
    description: 'Internet bill',
    recurrence: Recurrence.MONTHLY,
    nextOccurrence: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  },
  {
    id: '9',
    date: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0],
    merchant: 'CVS Pharmacy',
    amount: -35.50,
    category: 'Healthcare',
    description: 'Prescription refill',
    recurrence: Recurrence.NONE
  },
  {
    id: '10',
    date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0],
    merchant: 'Starbucks',
    amount: -5.75,
    category: 'Food',
    description: 'Morning coffee',
    recurrence: Recurrence.NONE
  },
  {
    id: '11',
    date: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString().split('T')[0],
    merchant: 'Uber',
    amount: -22.40,
    category: 'Transportation',
    description: 'Ride to airport',
    recurrence: Recurrence.NONE
  },
  {
    id: '12',
    date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString().split('T')[0],
    merchant: 'Movie Theater',
    amount: -28.00,
    category: 'Entertainment',
    description: 'Weekend movie',
    recurrence: Recurrence.NONE
  },
  {
    id: '13',
    date: new Date(new Date().setDate(new Date().getDate() - 18)).toISOString().split('T')[0],
    merchant: 'Freelance Client',
    amount: 800.00,
    category: 'Income',
    description: 'Website development',
    recurrence: Recurrence.NONE
  }
];