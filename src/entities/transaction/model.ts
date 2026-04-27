import { getDayKey } from '@/src/shared/lib/date';

export type TransactionType = 'expense' | 'income';

type CategoryDefinition = {
  id: string;
  label: string;
  type: TransactionType;
};

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food', type: 'expense' },
  { id: 'transport', label: 'Transport', type: 'expense' },
  { id: 'home', label: 'Home', type: 'expense' },
  { id: 'health', label: 'Health', type: 'expense' },
  { id: 'shopping', label: 'Shopping', type: 'expense' },
  { id: 'entertainment', label: 'Entertainment', type: 'expense' },
  { id: 'bills', label: 'Bills', type: 'expense' },
  { id: 'education', label: 'Education', type: 'expense' },
  { id: 'other-expense', label: 'Other', type: 'expense' },
] as const satisfies readonly CategoryDefinition[];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', type: 'income' },
  { id: 'freelance', label: 'Freelance', type: 'income' },
  { id: 'gift', label: 'Gift', type: 'income' },
  { id: 'refund', label: 'Refund', type: 'income' },
  { id: 'investment', label: 'Investment', type: 'income' },
  { id: 'other-income', label: 'Other', type: 'income' },
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
};

export type TransactionInput = Omit<Transaction, 'id'>;

export type TransactionSection = {
  dayKey: string;
  subtotal: number;
  data: Transaction[];
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