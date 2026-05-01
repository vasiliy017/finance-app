import { useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import {
  selectHydrated,
  selectTransactions,
  type Transaction,
  type TransactionType,
  useTransactionStore,
} from '@/entities/transaction';
import { Spacing } from '@/shared/config';
import { getDayKey } from '@/shared/lib/date';
import { EmptyState, LoadingState } from '@/shared/ui';
import { TransactionRow } from './transaction-row';

type TransactionListProps = {
  onAddTransaction: () => void;
  onSelectTransaction: (transaction: Transaction) => void;
  selectedDayKey?: string;
  typeFilter?: TransactionType;
};

export function TransactionList({
  onAddTransaction,
  onSelectTransaction,
  selectedDayKey,
  typeFilter,
}: TransactionListProps) {
  const hydrated = useTransactionStore(selectHydrated);
  const transactions = useTransactionStore(selectTransactions);
  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        if (typeFilter && transaction.type !== typeFilter) {
          return false;
        }

        if (selectedDayKey && getDayKey(transaction.date) !== selectedDayKey) {
          return false;
        }

        return true;
      }),
    [selectedDayKey, transactions, typeFilter]
  );

  if (!hydrated) {
    return <LoadingState label="Restoring your transaction history..." />;
  }

  if (filteredTransactions.length === 0) {
    return (
      <EmptyState
        actionLabel="Add transaction"
        description="Add a transaction for this view to populate the list."
        onAction={onAddTransaction}
        title="No transactions yet"
      />
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={filteredTransactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TransactionRow transaction={item} onPress={() => onSelectTransaction(item)} />
      )}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Spacing.xl,
  },
  list: {
    flex: 1,
  },
});