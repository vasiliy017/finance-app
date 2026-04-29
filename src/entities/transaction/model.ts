import { getDayKey } from '@/src/shared/lib/date';

export type TransactionType = 'expense' | 'income';

type CategoryDefinition = {
  id: string;
  label: string;
  type: TransactionType;
  icon: string;
  color: string;
};

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food', type: 'expense', icon: 'restaurant', color: '#C23AE0' },
  { id: 'transport', label: 'Transport', type: 'expense', icon: 'directions-car', color: '#7A4A1A' },
  { id: 'home', label: 'Home', type: 'expense', icon: 'home', color: '#FDB14B' },
  { id: 'health', label: 'Health', type: 'expense', icon: 'favorite', color: '#F16D6A' },
  { id: 'shopping', label: 'Shopping', type: 'expense', icon: 'shopping-cart', color: '#8A68C7' },
  { id: 'entertainment', label: 'Entertainment', type: 'expense', icon: 'sports-esports', color: '#7ED78C' },
  { id: 'bills', label: 'Bills', type: 'expense', icon: 'receipt-long', color: '#5D96E6' },
  { id: 'education', label: 'Education', type: 'expense', icon: 'school', color: '#F3D65C' },
  { id: 'other-expense', label: 'Other', type: 'expense', icon: 'more-horiz', color: '#5D96E6' },
] as const satisfies readonly CategoryDefinition[];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', type: 'income', icon: 'payments', color: '#61C2B1' },
  { id: 'freelance', label: 'Freelance', type: 'income', icon: 'work', color: '#E0B84E' },
  { id: 'gift', label: 'Gift', type: 'income', icon: 'card-giftcard', color: '#F16D6A' },
  { id: 'refund', label: 'Refund', type: 'income', icon: 'replay', color: '#5D96E6' },
  { id: 'investment', label: 'Investment', type: 'income', icon: 'trending-up', color: '#8A68C7' },
  { id: 'other-income', label: 'Other', type: 'income', icon: 'add-circle-outline', color: '#7ED78C' },
] as const satisfies readonly CategoryDefinition[];

export const TRANSACTION_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number]['id'];

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: number;
  note?: string;
  photos?: string[];
};

export type TransactionInput = Omit<Transaction, 'id'>;

export type TransactionSection = {
  dayKey: string;
  subtotal: number;
  data: Transaction[];
};

export type CategoryTotal = {
  category: TransactionCategory;
  total: number;
  type: TransactionType;
};

export type TransactionTotals = {
  income: number;
  expense: number;
  balance: number;
};

export function getCategoriesByType(type: TransactionType) {
  return TRANSACTION_CATEGORIES.filter((category) => category.type === type);
}

export function getCategoryLabel(categoryId: TransactionCategory) {
  return TRANSACTION_CATEGORIES.find((category) => category.id === categoryId)?.label ?? categoryId;
}

export function getCategoryDefinition(categoryId: TransactionCategory) {
  return TRANSACTION_CATEGORIES.find((category) => category.id === categoryId);
}

export function isValidCategoryForType(categoryId: string, type: TransactionType): categoryId is TransactionCategory {
  return getCategoriesByType(type).some((category) => category.id === categoryId);
}

export function sortTransactionsByDateDesc(transactions: Transaction[]) {
  return [...transactions].sort((left, right) => right.date - left.date);
}

export function getRecentTransactions(transactions: Transaction[], limit = 3) {
  return sortTransactionsByDateDesc(transactions).slice(0, limit);
}

export function calculateTransactionTotals(transactions: Transaction[]): TransactionTotals {
  return transactions.reduce<TransactionTotals>(
    (totals, transaction) => {
      if (transaction.type === 'income') {
        totals.income += transaction.amount;
      } else {
        totals.expense += transaction.amount;
      }

      totals.balance = totals.income - totals.expense;

      return totals;
    },
    { income: 0, expense: 0, balance: 0 }
  );
}

export function groupTransactionsByDay(transactions: Transaction[]) {
  const sections = new Map<string, TransactionSection>();

  for (const transaction of sortTransactionsByDateDesc(transactions)) {
    const dayKey = getDayKey(transaction.date);
    const existing = sections.get(dayKey);

    if (existing) {
      existing.data.push(transaction);
      existing.subtotal += transaction.type === 'income' ? transaction.amount : -transaction.amount;
      continue;
    }

    sections.set(dayKey, {
      dayKey,
      subtotal: transaction.type === 'income' ? transaction.amount : -transaction.amount,
      data: [transaction],
    });
  }

  return [...sections.values()];
}

export function calculateCategoryTotals(
  transactions: Transaction[],
  type?: TransactionType
): CategoryTotal[] {
  const totals = new Map<TransactionCategory, CategoryTotal>();

  for (const transaction of transactions) {
    if (type && transaction.type !== type) {
      continue;
    }

    const current = totals.get(transaction.category);

    if (current) {
      current.total += transaction.amount;
      continue;
    }

    totals.set(transaction.category, {
      category: transaction.category,
      total: transaction.amount,
      type: transaction.type,
    });
  }

  return [...totals.values()].sort((left, right) => right.total - left.total);
}