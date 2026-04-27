import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getCategoryLabel, type Transaction } from '@/src/entities/transaction';
import { formatCurrency } from '@/src/shared/lib/currency';
import { formatTransactionDate } from '@/src/shared/lib/date';
import { Card } from '@/src/shared/ui/card';

type TransactionRowProps = {
  transaction: Transaction;
  onPress?: () => void;
};

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const amountColor = transaction.type === 'income' ? styles.positive : styles.negative;

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <Card style={styles.card}>
        <View style={styles.mainRow}>
          <View style={styles.textGroup}>
            <ThemedText type="defaultSemiBold">{getCategoryLabel(transaction.category)}</ThemedText>
            <ThemedText>{transaction.note?.trim() || formatTransactionDate(transaction.date)}</ThemedText>
          </View>
          <View style={styles.amountGroup}>
            <ThemedText style={[styles.amount, amountColor]}>
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </ThemedText>
            <ThemedText>{transaction.type === 'income' ? 'Income' : 'Expense'}</ThemedText>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontWeight: '700',
  },
  amountGroup: {
    alignItems: 'flex-end',
    gap: 2,
  },
  card: {
    gap: 0,
  },
  mainRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  negative: {
    color: '#C0392B',
  },
  positive: {
    color: '#1F8A4D',
  },
  pressable: {
    marginBottom: 10,
  },
  textGroup: {
    flex: 1,
    gap: 2,
    paddingRight: 12,
  },
});