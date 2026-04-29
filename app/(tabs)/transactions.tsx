import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { TransactionList } from '@/src/features/transaction-list';
import { Button, Screen } from '@/src/shared/ui';

export default function TransactionsScreen() {
  return (
    <Screen scroll={false} style={styles.screen}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <ThemedText type="title">Transactions</ThemedText>
          <ThemedText>Grouped by day so you can scan recent history quickly.</ThemedText>
        </View>
        <Button label="Add" onPress={() => router.push('/transaction')} variant="secondary" />
      </View>

      <View style={styles.listContainer}>
        <TransactionList
          onAddTransaction={() => router.push('/transaction')}
          onSelectTransaction={(transaction) =>
            router.push({ pathname: '/transaction', params: { id: transaction.id } })
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCopy: {
    flex: 1,
    gap: Spacing.s - Spacing.xs / 2,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.m - Spacing.xs,
  },
  listContainer: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});