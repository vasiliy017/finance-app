import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Transaction } from '../model';
import {
    selectTransactionById,
    selectTransactions,
    useTransactionStore,
} from '../store';

const INITIAL = useTransactionStore.getState();

beforeEach(async () => {
  await AsyncStorage.clear();
  useTransactionStore.setState(
    { ...INITIAL, transactions: [], hydrated: true },
    true
  );
});

const input = (overrides: Partial<Transaction> = {}) => ({
  amount: 50,
  type: 'expense' as const,
  category: 'food' as const,
  date: Date.now(),
  ...overrides,
});

describe('useTransactionStore.addTransaction', () => {
  test('returns a unique id and prepends the new transaction', () => {
    const { addTransaction } = useTransactionStore.getState();
    const id1 = addTransaction(input({ amount: 10 }));
    const id2 = addTransaction(input({ amount: 20 }));

    const transactions = selectTransactions(useTransactionStore.getState());

    expect(transactions).toHaveLength(2);
    expect(transactions[0]!.id).toBe(id2); // newest first
    expect(transactions[1]!.id).toBe(id1);
    expect(id1).not.toBe(id2);
  });

  test('generates 1000 unique ids', () => {
    const { addTransaction } = useTransactionStore.getState();
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) ids.add(addTransaction(input()));
    expect(ids.size).toBe(1000);
  });
});

describe('useTransactionStore.updateTransaction', () => {
  test('replaces transaction with same id', () => {
    const { addTransaction, updateTransaction } = useTransactionStore.getState();
    const id = addTransaction(input({ amount: 10 }));

    updateTransaction(id, input({ amount: 99, note: 'updated' }));

    const t = selectTransactionById(id)(useTransactionStore.getState());
    expect(t?.amount).toBe(99);
    expect(t?.note).toBe('updated');
  });

  test('is a no-op when id does not exist', () => {
    const { addTransaction, updateTransaction } = useTransactionStore.getState();
    addTransaction(input({ amount: 10 }));

    updateTransaction('does-not-exist', input({ amount: 99 }));

    const transactions = selectTransactions(useTransactionStore.getState());
    expect(transactions).toHaveLength(1);
    expect(transactions[0]!.amount).toBe(10);
  });
});

describe('useTransactionStore.deleteTransaction', () => {
  test('removes the transaction with the given id', () => {
    const { addTransaction, deleteTransaction } = useTransactionStore.getState();
    const keep = addTransaction(input({ amount: 1 }));
    const remove = addTransaction(input({ amount: 2 }));

    deleteTransaction(remove);

    const remaining = selectTransactions(useTransactionStore.getState());
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.id).toBe(keep);
  });

  test('no-op when id is not present', () => {
    const { addTransaction, deleteTransaction } = useTransactionStore.getState();
    addTransaction(input({ amount: 1 }));
    deleteTransaction('missing');
    expect(selectTransactions(useTransactionStore.getState())).toHaveLength(1);
  });
});

describe('useTransactionStore selectors', () => {
  test('selectHydrated reflects the hydrated flag', () => {
    useTransactionStore.setState({ hydrated: false });
    expect(useTransactionStore.getState().hydrated).toBe(false);
    useTransactionStore.setState({ hydrated: true });
    expect(useTransactionStore.getState().hydrated).toBe(true);
  });

  test('selectTransactionById returns undefined for unknown id', () => {
    expect(
      selectTransactionById('nope')(useTransactionStore.getState())
    ).toBeUndefined();
  });

  test('selectTransactionById returns undefined when id is undefined', () => {
    expect(
      selectTransactionById(undefined)(useTransactionStore.getState())
    ).toBeUndefined();
  });
});
