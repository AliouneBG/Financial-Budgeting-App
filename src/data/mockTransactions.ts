import type { Transaction } from '../types';

export const mockTransactions: Transaction[] = [
  {
    id: '101',
    date: '2023-10-18',
    merchant: 'Starbucks',
    amount: -5.75,
    category: 'Dining'
  },
  {
    id: '102',
    date: '2023-10-17',
    merchant: 'Apple Store',
    amount: -1299.00,
    category: 'Electronics'
  },
  {
    id: '103',
    date: '2023-10-16',
    merchant: 'Target',
    amount: -87.43,
    category: 'Shopping'
  },
  {
    id: '104',
    date: '2023-10-15',
    merchant: 'Freelance Work',
    amount: 1200.00,
    category: 'Income'
  },
];