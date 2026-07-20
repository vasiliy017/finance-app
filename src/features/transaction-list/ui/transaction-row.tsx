import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { type Transaction } from '@/entities/transaction';
import {
    BackgroundColors,
    CURRENCY_SYMBOL,
    getCategoryDefinition,
    LOCALE,
    Spacing,
    TextColors,
} from '@/shared/config';
import { formatTransactionTime } from '@/shared/lib/date';
import { ThemedText } from '@/shared/ui';

type TransactionRowProps = {
  transaction: Transaction;
  onPress?: () => void;
};

const rowVerticalInset = Spacing.s + Spacing.xs / 2;
const rowHorizontalInset = Spacing.xs;

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const category = getCategoryDefinition(transaction.category);
  const amountLabel = transaction.amount.toLocaleString(LOCALE, {
    maximumFractionDigits: 2,
  });
  const accessibilityLabel = `${category?.label ?? transaction.category}, ${transaction.type === 'income' ? 'income' : 'expense'} ${amountLabel} ${CURRENCY_SYMBOL}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.pressable}
      testID={`tx-row-${transaction.id}`}
    >
      <View style={styles.row}>
        <View style={styles.leadingGroup}>
          <View style={[styles.iconBadge, { backgroundColor: category?.color ?? BackgroundColors.blue }]}>
            <MaterialIcons
              color={BackgroundColors.white}
              name={(category?.icon as keyof typeof MaterialIcons.glyphMap) ?? 'more-horiz'}
              size={20}
            />
          </View>
          <ThemedText numberOfLines={1} style={styles.labelText}>
            {category?.label ?? transaction.category}
          </ThemedText>
        </View>
        <View style={styles.trailingGroup}>
          <ThemedText style={styles.timeText}>{formatTransactionTime(transaction.date)}</ThemedText>
          <View style={styles.amountGroup}>
            <ThemedText numberOfLines={1} style={styles.amount}>
              {amountLabel}
            </ThemedText>
            <ThemedText style={styles.currencyText}>{CURRENCY_SYMBOL}</ThemedText>
          </View>
        </View>
      </View>
      {transaction.note?.trim() ? (
        <View style={styles.noteRow}>
          <ThemedText numberOfLines={1} style={styles.noteText}>
            {transaction.note}
          </ThemedText>
        </View>
      ) : null}
      <View style={styles.divider} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  amount: {
    color: BackgroundColors.white,
    flexShrink: 1,
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'right',
  },
  amountGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  currencyText: {
    color: BackgroundColors.white,
    fontSize: 18,
    lineHeight: 22,
  },
  divider: {
    backgroundColor: 'rgba(251, 252, 253, 0.72)',
    height: 1,
    marginTop: rowVerticalInset,
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  labelText: {
    color: BackgroundColors.white,
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
  },
  leadingGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.s + Spacing.xs / 2,
    minWidth: 0,
    paddingRight: Spacing.s,
  },
  noteRow: {
    paddingLeft: 49,
    paddingTop: Spacing.xs,
  },
  noteText: {
    color: TextColors.body,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.72,
  },
  pressable: {
    paddingHorizontal: rowHorizontalInset,
    paddingTop: rowVerticalInset,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  timeText: {
    color: BackgroundColors.white,
    fontSize: 16,
    lineHeight: 20,
    minWidth: 74,
    textAlign: 'right',
  },
  trailingGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.m,
    justifyContent: 'flex-end',
  },
});