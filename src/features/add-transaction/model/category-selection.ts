import { useSyncExternalStore } from 'react';

import type { TransactionCategory, TransactionType } from '@/entities/transaction';

export type PendingCategorySelection = {
  category: TransactionCategory;
  type: TransactionType;
};

let snapshot: PendingCategorySelection | null = null;

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function setPendingCategorySelection(selection: PendingCategorySelection | null) {
  snapshot = selection;
  emitChange();
}

export function clearPendingCategorySelection() {
  setPendingCategorySelection(null);
}

export function usePendingCategorySelection() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    () => snapshot,
    () => snapshot
  );
}