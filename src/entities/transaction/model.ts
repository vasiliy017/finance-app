import { getDayKey } from '@/shared/lib/date';

export type TransactionType = 'expense' | 'income';
export type TransactionCategory =
  | 'food'
  | 'transport'
  | 'home'
  | 'health'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'education'
  | 'other-expense'
  | 'salary'
  | 'freelance'
  | 'gift'
  | 'refund'
  | 'investment'
  | 'other-income';

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