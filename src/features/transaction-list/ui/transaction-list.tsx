import { useMemo } from 'react';
import { SectionList, StyleSheet } from 'react-native';

import {
  groupTransactionsByDay,
  selectHydrated,
  selectTransactions,
  type Transaction,
  useTransactionStore,
} from '@/src/entities/transaction';
import { DaySectionHeader } from '@/src/features/transaction-list/ui/day-section-header';
import { TransactionRow } from '@/src/features/transaction-list/ui/transaction-row';
import { EmptyState, LoadingState } from '@/src/shared/ui';

type TransactionListProps = {
  onAddTransaction: () => void;
  onSelectTransaction: (transaction: Transaction) => void;
};

export function TransactionList({ onAddTransaction, onSelectTransaction }: TransactionListProps) {
  const hydrated = useTransactionStore(selectHydrated);
  const transactions = useTransactionStore(selectTransactions);
  const sections = useMemo(() => groupTransactionsByDay(transactions), [transactions]);

  if (!hydrated) {
    return <LoadingState label="Restoring your transaction history..." />;
  }

  if (sections.length === 0) {
    return (
      <EmptyState
        actionLabel="Add transaction"
        description="Track your first income or expense to start building your history."
        onAction={onAddTransaction}
        title="No transactions yet"
      />
    );
  }

  return (
    <SectionList
      contentContainerStyle={styles.content}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TransactionRow transaction={item} onPress={() => onSelectTransaction(item)} />
      )}
      renderSectionHeader={({ section }) => (
        <DaySectionHeader dayKey={section.dayKey} subtotal={section.subtotal} />
      )}
      sections={sections}
      style={styles.list}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 12,
  },
  list: {
    flex: 1,
  },
});