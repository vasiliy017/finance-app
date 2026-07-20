import type { Transaction } from '@/entities/transaction';

import {
    calculateCategoryTotals,
    calculateTransactionTotals,
    getRecentTransactions,
    groupTransactionsByDay,
    sortTransactionsByDateDesc,
} from '../model';

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    amount: 10,
    type: 'expense',
    category: 'food',
    date: Date.now(),
    ...overrides,
  };
}

const day = (y: number, m: number, d: number, h = 12) =>
  new Date(y, m - 1, d, h, 0, 0).getTime();

describe('sortTransactionsByDateDesc', () => {
  test('returns a new array sorted newest → oldest', () => {
    const a = tx({ id: 'a', date: day(2025, 1, 1) });
    const b = tx({ id: 'b', date: day(2025, 6, 1) });
    const c = tx({ id: 'c', date: day(2025, 3, 1) });
    const input = [a, b, c];

    const sorted = sortTransactionsByDateDesc(input);

    expect(sorted.map((t) => t.id)).toEqual(['b', 'c', 'a']);
    expect(input.map((t) => t.id)).toEqual(['a', 'b', 'c']); // original untouched
  });

  test('handles empty array', () => {
    expect(sortTransactionsByDateDesc([])).toEqual([]);
  });
});

describe('getRecentTransactions', () => {
  test('default limit is 3', () => {
    const list = [1, 2, 3, 4, 5].map((n) =>
      tx({ id: String(n), date: day(2025, 1, n) })
    );
    expect(getRecentTransactions(list)).toHaveLength(3);
  });

  test('respects custom limit', () => {
    const list = [1, 2, 3, 4, 5].map((n) =>
      tx({ id: String(n), date: day(2025, 1, n) })
    );
    expect(getRecentTransactions(list, 1).map((t) => t.id)).toEqual(['5']);
  });
});

describe('calculateTransactionTotals', () => {
  test('zero totals for empty list', () => {
    expect(calculateTransactionTotals([])).toEqual({ income: 0, expense: 0, balance: 0 });
  });

  test('income-only', () => {
    const result = calculateTransactionTotals([
      tx({ type: 'income', amount: 100 }),
      tx({ type: 'income', amount: 50 }),
    ]);
    expect(result).toEqual({ income: 150, expense: 0, balance: 150 });
  });

  test('expense-only', () => {
    const result = calculateTransactionTotals([
      tx({ type: 'expense', amount: 30 }),
      tx({ type: 'expense', amount: 20 }),
    ]);
    expect(result).toEqual({ income: 0, expense: 50, balance: -50 });
  });

  test('mixed', () => {
    const result = calculateTransactionTotals([
      tx({ type: 'income', amount: 100 }),
      tx({ type: 'expense', amount: 30 }),
      tx({ type: 'expense', amount: 20 }),
    ]);
    expect(result).toEqual({ income: 100, expense: 50, balance: 50 });
  });
});

describe('groupTransactionsByDay', () => {
  test('returns empty array for no transactions', () => {
    expect(groupTransactionsByDay([])).toEqual([]);
  });

  test('groups by day-key, newest first, with signed subtotals', () => {
    const sections = groupTransactionsByDay([
      tx({ id: 'a', date: day(2025, 1, 1), type: 'expense', amount: 10 }),
      tx({ id: 'b', date: day(2025, 1, 1), type: 'income', amount: 5 }),
      tx({ id: 'c', date: day(2025, 1, 2), type: 'income', amount: 7 }),
    ]);

    expect(sections.map((s) => s.dayKey)).toEqual(['2025-01-02', '2025-01-01']);
    expect(sections[0]!.subtotal).toBe(7);
    expect(sections[1]!.subtotal).toBe(-5); // 5 income - 10 expense
    expect(sections[1]!.data).toHaveLength(2);
  });
});

describe('calculateCategoryTotals', () => {
  test('aggregates by category and sorts by total desc', () => {
    const result = calculateCategoryTotals([
      tx({ category: 'food', type: 'expense', amount: 10 }),
      tx({ category: 'food', type: 'expense', amount: 30 }),
      tx({ category: 'transport', type: 'expense', amount: 25 }),
    ]);

    expect(result).toEqual([
      { category: 'food', total: 40, type: 'expense' },
      { category: 'transport', total: 25, type: 'expense' },
    ]);
  });

  test('filters by type when provided', () => {
    const result = calculateCategoryTotals(
      [
        tx({ category: 'food', type: 'expense', amount: 10 }),
        tx({ category: 'salary', type: 'income', amount: 100 }),
      ],
      'income'
    );
    expect(result).toEqual([{ category: 'salary', total: 100, type: 'income' }]);
  });

  test('returns empty when type filter matches nothing', () => {
    expect(
      calculateCategoryTotals([tx({ type: 'expense' })], 'income')
    ).toEqual([]);
  });
});
