import { createSafeStorage, TRANSACTION_STORAGE_KEY } from '@/shared/lib/storage';
import {
  type Transaction,
  type TransactionInput,
} from './model';

type ZustandModule = typeof import('zustand');
type ZustandMiddlewareModule = typeof import('zustand/middleware');

declare const require: <T = unknown>(moduleId: string) => T;

const { create } = require<ZustandModule>('zustand');
const { persist } = require<ZustandMiddlewareModule>('zustand/middleware');

type TransactionStore = {
  hydrated: boolean;
  transactions: Transaction[];
  setHydrated: (hydrated: boolean) => void;
  addTransaction: (transaction: TransactionInput) => string;
  updateTransaction: (id: string, transaction: TransactionInput) => void;
  deleteTransaction: (id: string) => void;
};

type PersistedTransactionState = { transactions: Transaction[] };

function isPersistedTransactionState(value: unknown): value is PersistedTransactionState {
  if (!value || typeof value !== 'object') return false;
  const candidate = (value as { transactions?: unknown }).transactions;
  return Array.isArray(candidate) && candidate.every(isTransaction);
}

function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== 'object') return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.amount === 'number' &&
    (t.type === 'income' || t.type === 'expense') &&
    typeof t.category === 'string' &&
    typeof t.date === 'number'
  );
}

function createTransactionId() {
  const cryptoRef = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoRef?.randomUUID) {
    return cryptoRef.randomUUID();
  }
  // Fallback: 122-bit random ID with timestamp prefix to avoid ever-colliding
  // even on legacy runtimes without crypto.randomUUID.
  const random = `${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
  return `${Date.now().toString(36)}-${random}`;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      hydrated: false,
      transactions: [],
      setHydrated: (hydrated) => set({ hydrated }),
      addTransaction: (transaction) => {
        const id = createTransactionId();

        set((state) => ({
          transactions: [{ id, ...transaction }, ...state.transactions],
        }));

        return id;
      },
      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((current) =>
            current.id === id ? { id, ...transaction } : current
          ),
        }));
      },
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((transaction) => transaction.id !== id),
        }));
      },
    }),
    {
      name: TRANSACTION_STORAGE_KEY,
      storage: createSafeStorage(isPersistedTransactionState),
      partialize: (state) => ({ transactions: state.transactions }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('[transaction-store] rehydrate error', error);
        }
        state?.setHydrated(true);
      },
    }
  )
);

export const selectHydrated = (state: TransactionStore) => state.hydrated;
export const selectTransactions = (state: TransactionStore) => state.transactions;
export const selectTransactionById = (id?: string) => (state: TransactionStore) =>
  state.transactions.find((transaction) => transaction.id === id);