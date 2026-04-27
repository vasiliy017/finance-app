import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { Transaction } from '@/src/entities/transaction';
import { CategoryPicker } from '@/src/features/add-transaction/ui/category-picker';
import { DateField } from '@/src/features/add-transaction/ui/date-field';
import { TypeSwitch } from '@/src/features/add-transaction/ui/type-switch';
import {
  type TransactionFormMode,
  useTransactionForm,
} from '@/src/features/add-transaction/model/use-transaction-form';
import { Button, Card, Screen, TextField } from '@/src/shared/ui';

type TransactionFormProps = {
  mode: TransactionFormMode;
  transaction?: Transaction;
  onCancel: () => void;
  onCompleted: () => void;
};

export function TransactionForm({ mode, transaction, onCancel, onCompleted }: TransactionFormProps) {
  const { categories, errors, handleDelete, handleSubmit, isValid, setField, values } =
    useTransactionForm({ mode, onCompleted, transaction });

  return (
    <Screen>
      <Card>
        <View style={styles.header}>
          <ThemedText type="subtitle">
            {mode === 'edit' ? 'Update transaction' : 'Track a new transaction'}
          </ThemedText>
          <ThemedText>
            Save expenses and income locally. Your changes are available offline immediately.
          </ThemedText>
        </View>
      </Card>

      <TextField
        error={errors.amount}
        keyboardType="decimal-pad"
        label="Amount"
        onChangeText={(value) => setField('amount', value)}
        placeholder="0"
        value={values.amount}
      />

      <View style={styles.fieldGroup}>
        <ThemedText type="defaultSemiBold">Type</ThemedText>
        <TypeSwitch value={values.type} onChange={(value) => setField('type', value)} />
      </View>

      <CategoryPicker
        categories={categories}
        error={errors.category}
        onChange={(value) => setField('category', value)}
        value={values.category}
      />

      <DateField
        error={errors.dateInput}
        onChange={(value) => setField('dateInput', value)}
        value={values.dateInput}
      />

      <TextField
        label="Note"
        multiline
        numberOfLines={4}
        onChangeText={(value) => setField('note', value)}
        placeholder="Optional note"
        style={styles.noteInput}
        textAlignVertical="top"
        value={values.note}
      />

      <View style={styles.actions}>
        <Button label="Cancel" onPress={onCancel} variant="secondary" />
        <Button
          disabled={!isValid}
          label={mode === 'edit' ? 'Save changes' : 'Add transaction'}
          onPress={handleSubmit}
        />
      </View>

      {mode === 'edit' ? <Button label="Delete transaction" onPress={handleDelete} variant="danger" /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldGroup: {
    gap: 8,
  },
  header: {
    gap: 6,
  },
  noteInput: {
    minHeight: 112,
  },
});