import { Stack, router, useLocalSearchParams } from 'expo-router';

import { selectHydrated, selectTransactionById, useTransactionStore } from '@/entities/transaction';
import { TransactionForm } from '@/features/add-transaction';
import { EmptyState, LoadingState, Screen } from '@/shared/ui';

export function TransactionScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const transactionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const hydrated = useTransactionStore(selectHydrated);
  const transaction = useTransactionStore(selectTransactionById(transactionId));
  const mode = transactionId ? 'edit' : 'create';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {!hydrated ? (
        <Screen>
          <LoadingState label="Opening transaction form..." />
        </Screen>
      ) : mode === 'edit' && !transaction ? (
        <Screen>
          <EmptyState
            actionLabel="Close"
            description="This transaction could not be found. It may have been deleted already."
            onAction={() => router.back()}
            title="Transaction not found"
          />
        </Screen>
      ) : (
        <TransactionForm
          mode={mode}
          onCancel={() => router.back()}
          onCompleted={() => router.back()}
          transaction={transaction}
        />
      )}
    </>
  );
}