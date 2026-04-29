import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  calculateCategoryTotals,
  calculateTransactionTotals,
  getCategoryDefinition,
  getRecentTransactions,
  selectHydrated,
  selectTransactions,
  type TransactionType,
  useTransactionStore,
} from '@/src/entities/transaction';
import { TransactionRow } from '@/src/features/transaction-list';
import { formatCurrency } from '@/src/shared/lib/currency';
import { formatTransactionDate } from '@/src/shared/lib/date';
import { Button, Card, EmptyState, LoadingState, Screen } from '@/src/shared/ui';

const PERIOD_LABELS = ['Day', 'Week', 'Month', 'Year', 'Date'] as const;

export default function HomeScreen() {
  const hydrated = useTransactionStore(selectHydrated);
  const transactions = useTransactionStore(selectTransactions);
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const recentTransactions = useMemo(() => getRecentTransactions(transactions), [transactions]);
  const totals = useMemo(() => calculateTransactionTotals(transactions), [transactions]);
  const categoryTotals = useMemo(
    () => calculateCategoryTotals(transactions, activeType).slice(0, 4),
    [activeType, transactions]
  );

  const featuredTotal = activeType === 'expense' ? totals.expense : totals.income;

  function openCreateTransaction() {
    router.push('/transaction');
  }

  return (
    <Screen>
      <View style={styles.heroHeader}>
        <View style={styles.totalWrap}>
          <View style={styles.titleRow}>
            <MaterialIcons color="#E0B84E" name="lightbulb-outline" size={24} />
            <ThemedText type="subtitle">Total</ThemedText>
          </View>
          <ThemedText type="title" style={styles.totalAmount}>
            {formatCurrency(totals.balance)}
          </ThemedText>
        </View>

        <View style={styles.quickMetrics}>
          <View style={styles.metricChip}>
            <ThemedText style={styles.metricLabel}>Income</ThemedText>
            <ThemedText type="defaultSemiBold">{formatCurrency(totals.income)}</ThemedText>
          </View>
          <View style={styles.metricChip}>
            <ThemedText style={styles.metricLabel}>Expense</ThemedText>
            <ThemedText type="defaultSemiBold">{formatCurrency(totals.expense)}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.typeTabs}>
        <Pressable onPress={() => setActiveType('expense')} style={styles.typeTab}>
          <ThemedText style={activeType === 'expense' ? styles.typeTabActive : styles.typeTabIdle}>
            Expenses
          </ThemedText>
        </Pressable>
        <Pressable onPress={() => setActiveType('income')} style={styles.typeTab}>
          <ThemedText style={activeType === 'income' ? styles.typeTabActive : styles.typeTabIdle}>
            Income
          </ThemedText>
        </Pressable>
      </View>

      <Card style={styles.analyticsCard}>
        <View style={styles.periodRow}>
          {PERIOD_LABELS.map((label, index) => (
            <View key={label} style={[styles.periodChip, index === 0 && styles.periodChipActive]}>
              <ThemedText style={index === 0 ? styles.periodChipTextActive : styles.periodChipText}>
                {label}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.dateRow}>
          <MaterialIcons color="#A9C2DD" name="chevron-left" size={28} />
          <ThemedText type="subtitle" style={styles.dateLabel}>
            {formatTransactionDate(Date.now())}
          </ThemedText>
          <MaterialIcons color="#A9C2DD" name="chevron-right" size={28} />
        </View>

        <View style={styles.chartShell}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <ThemedText style={styles.chartValue}>{formatCurrency(featuredTotal)}</ThemedText>
            </View>
          </View>
        </View>

        {!hydrated ? (
          <LoadingState label="Calculating category totals..." />
        ) : categoryTotals.length === 0 ? (
          <EmptyState
            actionLabel="Add transaction"
            description="Add a few transactions to start building your spending mix."
            onAction={openCreateTransaction}
            title="No category data yet"
          />
        ) : (
          <View style={styles.categoryList}>
            {categoryTotals.map((item) => {
              const category = getCategoryDefinition(item.category);

              return (
                <View key={item.category} style={styles.categoryRow}>
                  <View style={styles.categoryLeading}>
                    <View style={[styles.categoryBadge, { backgroundColor: category?.color ?? '#5D96E6' }]}>
                      <MaterialIcons
                        color="#FFFFFF"
                        name={(category?.icon as keyof typeof MaterialIcons.glyphMap) ?? 'more-horiz'}
                        size={20}
                      />
                    </View>
                    <ThemedText type="defaultSemiBold">{category?.label ?? item.category}</ThemedText>
                  </View>
                  <ThemedText type="defaultSemiBold">{formatCurrency(item.total)}</ThemedText>
                </View>
              );
            })}
          </View>
        )}

        <Pressable accessibilityRole="button" onPress={openCreateTransaction} style={styles.floatingAddButton}>
          <MaterialIcons color="#0B2E57" name="add" size={28} />
        </Pressable>
      </Card>

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
          <ThemedText style={styles.sectionCopy}>Latest 3 items</ThemedText>
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
  analyticsCard: {
    overflow: 'hidden',
    paddingBottom: 28,
    position: 'relative',
  },
  categoryBadge: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  categoryLeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  categoryList: {
    gap: 12,
    paddingRight: 56,
  },
  categoryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartShell: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  chartValue: {
    color: '#E0B84E',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    textAlign: 'center',
  },
  dateLabel: {
    textDecorationLine: 'underline',
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  floatingAddButton: {
    alignItems: 'center',
    backgroundColor: '#E0B84E',
    borderRadius: 24,
    bottom: 18,
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    width: 48,
  },
  heroHeader: {
    alignItems: 'center',
    gap: 18,
  },
  metricChip: {
    backgroundColor: '#113B68',
    borderColor: '#2A5A86',
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  metricLabel: {
    color: '#A9C2DD',
    fontSize: 13,
    lineHeight: 18,
  },
  periodChip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  periodChipActive: {
    backgroundColor: '#E0B84E',
  },
  periodChipText: {
    color: '#A9C2DD',
    fontSize: 13,
    lineHeight: 18,
  },
  periodChipTextActive: {
    color: '#0B2E57',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  ringInner: {
    alignItems: 'center',
    backgroundColor: '#113B68',
    borderRadius: 72,
    height: 144,
    justifyContent: 'center',
    width: 144,
  },
  ringOuter: {
    alignItems: 'center',
    backgroundColor: '#5D96E6',
    borderRadius: 96,
    height: 192,
    justifyContent: 'center',
    width: 192,
  },
  sectionCopy: {
    color: '#A9C2DD',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    gap: 4,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  totalAmount: {
    color: '#E0B84E',
    textAlign: 'center',
  },
  totalWrap: {
    alignItems: 'center',
    gap: 8,
  },
  typeTab: {
    paddingBottom: 8,
  },
  typeTabActive: {
    color: '#61C2B1',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    textDecorationLine: 'underline',
  },
  typeTabIdle: {
    color: '#F5F7FB',
    fontSize: 18,
    lineHeight: 24,
  },
  typeTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
});
