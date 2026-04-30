import { TRANSACTION_STORAGE_KEY, transactionStorage } from '@/shared/lib/storage';
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

function createTransactionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
      storage: transactionStorage,
      partialize: (state) => ({ transactions: state.transactions }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const selectHydrated = (state: TransactionStore) => state.hydrated;
export const selectTransactions = (state: TransactionStore) => state.transactions;
export const selectTransactionById = (id?: string) => (state: TransactionStore) =>
  state.transactions.find((transaction) => transaction.id === id);