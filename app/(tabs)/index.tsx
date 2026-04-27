import { useMemo } from 'react';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  getRecentTransactions,
  selectHydrated,
  selectTransactions,
  useTransactionStore,
} from '@/src/entities/transaction';
import { BalanceSummary } from '@/src/features/balance';
import { TransactionRow } from '@/src/features/transaction-list';
import { Button, Card, EmptyState, LoadingState, Screen } from '@/src/shared/ui';

export default function HomeScreen() {
  const hydrated = useTransactionStore(selectHydrated);
  const transactions = useTransactionStore(selectTransactions);
  const recentTransactions = useMemo(() => getRecentTransactions(transactions), [transactions]);

  function openCreateTransaction() {
    router.push('/transaction');
  }

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="title">Overview</ThemedText>
        <ThemedText>Track money offline and keep your daily balance in sync.</ThemedText>
      </View>

      {!hydrated ? <LoadingState label="Restoring your finance data..." /> : <BalanceSummary />}

      <View style={styles.actions}>
        <Button label="Add transaction" onPress={openCreateTransaction} style={styles.actionButton} />
        <Button
          label="See all"
          onPress={() => router.push('/transactions')}
          style={styles.actionButton}
          variant="secondary"
        />
      </View>

      <Card>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Recent transactions</ThemedText>
          <ThemedText>Latest 3 items</ThemedText>
        </View>

        {!hydrated ? (
          <LoadingState label="Loading recent activity..." />
        ) : recentTransactions.length === 0 ? (
          <EmptyState
            actionLabel="Add transaction"
            description="Start by adding your first income or expense."
            onAction={openCreateTransaction}
            title="No recent activity"
          />
        ) : (
          recentTransactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              onPress={() =>
                router.push({ pathname: '/transaction', params: { id: transaction.id } })
              }
              transaction={transaction}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  header: {
    gap: 6,
  },
  sectionHeader: {
    gap: 4,
  },
});
