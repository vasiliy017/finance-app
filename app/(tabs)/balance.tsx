import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { selectHydrated, useTransactionStore } from '@/src/entities/transaction';
import { BalanceSummary } from '@/src/features/balance';
import { Button, LoadingState, Screen } from '@/src/shared/ui';

export default function BalanceScreen() {
  const hydrated = useTransactionStore(selectHydrated);

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="title">Balance</ThemedText>
        <ThemedText>Your totals are calculated from the same local transaction history.</ThemedText>
      </View>

      {!hydrated ? <LoadingState label="Calculating your balance..." /> : <BalanceSummary />}

      <Button label="Add transaction" onPress={() => router.push('/transaction')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.s - Spacing.xs / 2,
  },
});