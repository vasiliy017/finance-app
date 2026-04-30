import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { type Transaction } from '@/entities/transaction';
import {
    BackgroundColors,
    Colors,
    getCategoryDefinition,
    Spacing,
    TextColors,
} from '@/shared/config';
import { formatCurrency } from '@/shared/lib/currency';
import { formatTransactionDate } from '@/shared/lib/date';
import { ThemedText } from '@/shared/ui';

type TransactionRowProps = {
  transaction: Transaction;
  onPress?: () => void;
};

const compactGap = Spacing.s - Spacing.xs / 2;
const cardInset = Spacing.m + Spacing.xs / 2;
const cardBlockInset = Spacing.m - Spacing.xs / 2;
const sectionInset = Spacing.m - Spacing.xs;
const tightGap = Spacing.xs / 2;

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const category = getCategoryDefinition(transaction.category);
  const amountColor = transaction.type === 'income' ? styles.positive : styles.negative;

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <View style={styles.card}>
        <View style={styles.mainRow}>
          <View style={styles.leadingGroup}>
            <View style={[styles.iconBadge, { backgroundColor: category?.color ?? BackgroundColors.blue }]}>
              <MaterialIcons color={BackgroundColors.white} name={(category?.icon as keyof typeof MaterialIcons.glyphMap) ?? 'more-horiz'} size={22} />
            </View>
            <View style={styles.textGroup}>
              <ThemedText type="defaultSemiBold" style={styles.labelText}>
                {category?.label ?? transaction.category}
              </ThemedText>
              <ThemedText style={styles.metaText}>
                {transaction.note?.trim() || formatTransactionDate(transaction.date)}
              </ThemedText>
            </View>
          </View>
          <View style={styles.amountGroup}>
            <ThemedText style={[styles.amount, amountColor]}>
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </ThemedText>
            <ThemedText style={styles.metaText}>{transaction.type === 'income' ? 'Income' : 'Expense'}</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontWeight: '700',
  },
  amountGroup: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  card: {
    backgroundColor: BackgroundColors.white,
    borderRadius: 24,
    gap: 0,
    paddingHorizontal: cardInset,
    paddingVertical: cardBlockInset,
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  leadingGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: cardBlockInset,
    paddingRight: sectionInset,
  },
  mainRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    color: TextColors.brand,
  },
  metaText: {
    color: Colors.dark.icon,
    fontSize: 14,
    lineHeight: 20,
  },
  negative: {
    color: Colors.dark.danger,
  },
  positive: {
    color: Colors.dark.success,
  },
  pressable: {
    marginBottom: compactGap,
  },
  textGroup: {
    flex: 1,
    gap: tightGap,
  },
});