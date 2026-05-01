import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { selectTransactions, useTransactionStore, type TransactionType } from '@/entities/transaction';
import { TransactionList } from '@/features/transaction-list';
import { BackgroundColors, Spacing, TextColors } from '@/shared/config';
import { formatMonthDayLabel, getDayKey } from '@/shared/lib/date';
import { Screen, ThemedText } from '@/shared/ui';

const RANGE_OPTIONS = ['Day', 'Week', 'Month', 'Year', 'Date'] as const;

export function TransactionsScreen() {
  const transactions = useTransactionStore(selectTransactions);
  const initialDate = useMemo(
    () => Math.max(...transactions.map((transaction) => transaction.date), Date.now()),
    [transactions]
  );
  const [selectedType, setSelectedType] = useState<TransactionType>('expense');
  const [selectedRange, setSelectedRange] = useState<(typeof RANGE_OPTIONS)[number]>('Day');
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const selectedDayKey = getDayKey(selectedDate);
  const selectedDateLabel = formatMonthDayLabel(selectedDate);

  const shiftSelectedDate = (direction: -1 | 1) => {
    setSelectedDate((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + direction);
      return next.getTime();
    });
  };

  return (
    <Screen scroll={false} style={styles.screen}>
      <Pressable onPress={() => router.replace('/')} style={styles.topBar}>
        <MaterialIcons color={TextColors.brand} name="chevron-left" size={28} />
        <ThemedText type="defaultSemiBold" style={styles.topBarTitle}>
          List
        </ThemedText>
      </Pressable>

      <View style={styles.typeTabs}>
        <Pressable onPress={() => setSelectedType('expense')} style={styles.typeTabButton}>
          <ThemedText
            type="subtitle"
            style={[styles.typeTabLabel, selectedType === 'expense' && styles.typeTabLabelActive]}>
            Expenses
          </ThemedText>
        </Pressable>
        <Pressable onPress={() => setSelectedType('income')} style={styles.typeTabButton}>
          <ThemedText
            type="subtitle"
            style={[styles.typeTabLabel, selectedType === 'income' && styles.typeTabLabelActive]}>
            Income
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.filterCard}>
        <View style={styles.rangeTabs}>
          {RANGE_OPTIONS.map((option) => {
            const active = option === selectedRange;

            return (
              <Pressable key={option} onPress={() => setSelectedRange(option)} style={[styles.rangePill, active && styles.rangePillActive]}>
                <ThemedText style={[styles.rangeLabel, active && styles.rangeLabelActive]}>
                  {option}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.dateNavigator}>
          <Pressable onPress={() => shiftSelectedDate(-1)} style={styles.dateArrow}>
            <MaterialIcons color={TextColors.brand} name="chevron-left" size={28} />
          </Pressable>
          <ThemedText type="defaultSemiBold" style={styles.dateLabel}>
            {selectedDateLabel}
          </ThemedText>
          <Pressable onPress={() => shiftSelectedDate(1)} style={styles.dateArrow}>
            <MaterialIcons color={TextColors.brand} name="chevron-right" size={28} />
          </Pressable>
        </View>
      </View>

      <View style={styles.listContainer}>
        <TransactionList
          onAddTransaction={() => router.push('/transaction')}
          onSelectTransaction={(transaction) =>
            router.push({ pathname: '/transaction', params: { id: transaction.id } })
          }
          selectedDayKey={selectedRange === 'Day' ? selectedDayKey : undefined}
          typeFilter={selectedType}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dateArrow: {
    padding: Spacing.s,
  },
  dateLabel: {
    color: TextColors.brand,
    fontSize: 17,
    lineHeight: 22,
    textDecorationLine: 'underline',
  },
  dateNavigator: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.s,
  },
  filterCard: {
    backgroundColor: BackgroundColors.white,
    borderRadius: 24,
    gap: Spacing.s,
    paddingHorizontal: Spacing.m + Spacing.xs / 2,
    paddingVertical: Spacing.m,
  },
  listContainer: {
    flex: 1,
    marginTop: Spacing.xs,
  },
  rangeLabel: {
    color: TextColors.brand,
    fontSize: 15,
    lineHeight: 18,
  },
  rangeLabelActive: {
    fontWeight: '700',
  },
  rangePill: {
    borderRadius: 999,
    paddingHorizontal: Spacing.s + Spacing.xs / 2,
    paddingVertical: Spacing.s - 2,
  },
  rangePillActive: {
    backgroundColor: TextColors.tertiary,
  },
  rangeTabs: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  screen: {
    backgroundColor: BackgroundColors.bg,
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: BackgroundColors.white,
    borderRadius: 18,
    flexDirection: 'row',
    gap: Spacing.s,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s + Spacing.xs / 2,
  },
  topBarTitle: {
    color: TextColors.brand,
    fontSize: 16,
  },
  typeTabButton: {
    paddingBottom: Spacing.s,
    paddingHorizontal: Spacing.s,
  },
  typeTabLabel: {
    color: BackgroundColors.white,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 24,
    opacity: 0.9,
  },
  typeTabLabelActive: {
    color: TextColors.secondary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  typeTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.s,
  },
});