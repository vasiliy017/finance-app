import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import {
  calculateTransactionTotals,
  selectTransactions,
  useTransactionStore,
} from '@/src/entities/transaction';
import { formatCurrency } from '@/src/shared/lib/currency';
import { Card } from '@/src/shared/ui/card';

export function BalanceSummary() {
  const transactions = useTransactionStore(selectTransactions);
  const totals = useMemo(() => calculateTransactionTotals(transactions), [transactions]);

  return (
    <View style={styles.container}>
      <Card style={styles.heroCard}>
        <ThemedText>Net balance</ThemedText>
        <ThemedText type="title">{formatCurrency(totals.balance)}</ThemedText>
      </Card>

      <View style={styles.grid}>
        <Card style={styles.metricCard}>
          <ThemedText>Income total</ThemedText>
          <ThemedText type="subtitle" style={styles.positive}>
            {formatCurrency(totals.income)}
          </ThemedText>
        </Card>

        <Card style={styles.metricCard}>
          <ThemedText>Expense total</ThemedText>
          <ThemedText type="subtitle" style={styles.negative}>
            {formatCurrency(totals.expense)}
          </ThemedText>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.m - Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.m - Spacing.xs,
  },
  heroCard: {
    gap: Spacing.s,
  },
  metricCard: {
    flex: 1,
    gap: Spacing.s - Spacing.xs / 2,
  },
  negative: {
    color: Colors.dark.danger,
  },
  positive: {
    color: Colors.dark.success,
  },
});