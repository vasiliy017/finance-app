import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { Transaction } from '@/src/entities/transaction';
import {
  type TransactionFormMode,
  useTransactionForm,
} from '@/src/features/add-transaction/model/use-transaction-form';
import { CategoryPicker } from '@/src/features/add-transaction/ui/category-picker';
import { DateField } from '@/src/features/add-transaction/ui/date-field';
import { TypeSwitch } from '@/src/features/add-transaction/ui/type-switch';
import { Button, Screen } from '@/src/shared/ui';

type TransactionFormProps = {
  mode: TransactionFormMode;
  transaction?: Transaction;
  onCancel: () => void;
  onCompleted: () => void;
};

export function TransactionForm({ mode, transaction, onCancel, onCompleted }: TransactionFormProps) {
  const {
    categories,
    errors,
    handleAddPhoto,
    handleDelete,
    handleRemovePhoto,
    handleSubmit,
    isValid,
    setField,
    values,
  } =
    useTransactionForm({ mode, onCompleted, transaction });

  const emptySlots = Math.max(0, 3 - values.photos.length);

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.backButton}>
          <MaterialIcons color="#102844" name="arrow-back-ios-new" size={20} />
        </Pressable>

        <View style={styles.titlePill}>
          <ThemedText style={styles.titleText}>
            {mode === 'edit' ? 'Edit transaction' : 'Add transactions'}
          </ThemedText>
        </View>
      </View>

      <TypeSwitch value={values.type} onChange={(value) => setField('type', value)} />

      <View style={styles.amountSection}>
        <View style={[styles.amountField, errors.amount ? styles.amountFieldError : undefined]}>
          <ThemedText style={styles.amountPrefix}>$</ThemedText>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={(value) => setField('amount', value)}
            placeholder="0"
            placeholderTextColor="#506B86"
            style={styles.amountInput}
            value={values.amount}
          />
        </View>
        {errors.amount ? <ThemedText style={styles.errorText}>{errors.amount}</ThemedText> : null}
      </View>

      <CategoryPicker
        categories={categories}
        error={errors.category}
        onChange={(value) => setField('category', value)}
        value={values.category}
      />

      <View style={styles.fieldGroup}>
        <ThemedText type="defaultSemiBold">Date</ThemedText>
        <DateField
          error={errors.dateInput}
          onChange={(value) => setField('dateInput', value)}
          value={values.dateInput}
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText type="defaultSemiBold">Comment</ThemedText>
        <TextInput
          onChangeText={(value) => setField('note', value)}
          placeholder="Dentistry"
          placeholderTextColor="#506B86"
          style={styles.commentInput}
          value={values.note}
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText type="defaultSemiBold">Photo</ThemedText>
        <View style={styles.photoGrid}>
          {values.photos.map((photoUri) => (
            <View key={photoUri} style={[styles.photoTile, styles.photoTileFilled]}>
              <Image contentFit="cover" source={{ uri: photoUri }} style={styles.photoImage} />
              <Pressable onPress={() => handleRemovePhoto(photoUri)} style={styles.removePhotoButton}>
                <MaterialIcons color="#102844" name="close" size={16} />
              </Pressable>
            </View>
          ))}

          {Array.from({ length: emptySlots }).map((_, index) => (
            <Pressable key={`empty-${index}`} onPress={handleAddPhoto} style={styles.photoTile}>
              <MaterialIcons color="#FFFFFF" name="add" size={34} />
            </Pressable>
          ))}
        </View>
      </View>

      <Button
        disabled={!isValid}
        label={mode === 'edit' ? 'Save' : 'Add'}
        onPress={handleSubmit}
        style={styles.submitButton}
      />

      {mode === 'edit' ? (
        <Button label="Delete transaction" onPress={handleDelete} variant="danger" />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  amountField: {
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    borderRadius: 22,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 84,
    paddingHorizontal: 18,
    width: 162,
  },
  amountFieldError: {
    borderColor: '#FF9085',
    borderWidth: 2,
  },
  amountInput: {
    color: '#214C79',
    fontSize: 32,
    fontWeight: '600',
    minWidth: 72,
    paddingVertical: 0,
    textAlign: 'center',
  },
  amountPrefix: {
    color: '#214C79',
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
  },
  amountSection: {
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    borderRadius: 20,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  commentInput: {
    backgroundColor: '#F5F7FB',
    borderRadius: 20,
    color: '#102844',
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  content: {
    gap: 22,
  },
  errorText: {
    color: '#FF9085',
    fontSize: 13,
    lineHeight: 18,
  },
  fieldGroup: {
    gap: 10,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    minHeight: 112,
  },
  photoImage: {
    borderRadius: 26,
    height: '100%',
    width: '100%',
  },
  photoTile: {
    alignItems: 'center',
    backgroundColor: '#B8BDC3',
    borderRadius: 26,
    height: 112,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: 112,
  },
  photoTileFilled: {
    backgroundColor: '#E8EBEF',
  },
  removePhotoButton: {
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 24,
  },
  submitButton: {
    alignSelf: 'center',
    minWidth: 260,
    width: '72%',
  },
  titlePill: {
    backgroundColor: '#F5F7FB',
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 18,
  },
  titleText: {
    color: '#102844',
    fontSize: 16,
    lineHeight: 20,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
});