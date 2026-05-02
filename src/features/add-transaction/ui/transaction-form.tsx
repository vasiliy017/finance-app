import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import type { Transaction } from '@/entities/transaction';
import { BackgroundColors, Colors, Spacing, TextColors } from '@/shared/config';
import { Button, Screen, ThemedText } from '@/shared/ui';
import {
  clearPendingCategorySelection,
  usePendingCategorySelection,
} from '../model/category-selection';
import {
  type TransactionFormMode,
  useTransactionForm,
} from '../model/use-transaction-form';
import { CategoryPicker } from './category-picker';
import { DateField } from './date-field';
import { TypeSwitch } from './type-switch';

type TransactionFormProps = {
  mode: TransactionFormMode;
  transaction?: Transaction;
  onCancel: () => void;
  onCompleted: () => void;
};

const compactGap = Spacing.s - Spacing.xs / 2;
const fieldGap = Spacing.s + Spacing.xs / 2;
const horizontalInset = Spacing.m + Spacing.xs / 2;
const sectionGap = Spacing.l - Spacing.xs / 2;

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
  const pendingCategorySelection = usePendingCategorySelection();

  const emptySlots = Math.max(0, 3 - values.photos.length);

  useEffect(() => {
    if (!pendingCategorySelection) {
      return;
    }

    if (values.type !== pendingCategorySelection.type) {
      setField('type', pendingCategorySelection.type);
    }

    if (values.category !== pendingCategorySelection.category) {
      setField('category', pendingCategorySelection.category);
    }

    clearPendingCategorySelection();
  }, [pendingCategorySelection, setField, values.category, values.type]);

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.backButton}>
          <MaterialIcons color={TextColors.brand} name="chevron-left" size={28} />
        </Pressable>

        <View style={styles.titleWrap}>
          <ThemedText numberOfLines={1} style={styles.titleText}>
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
            placeholderTextColor={Colors.dark.muted}
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
        type={values.type}
        value={values.category}
      />

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.sectionTitle}>Date</ThemedText>
        <DateField
          error={errors.dateInput}
          onChange={(value) => setField('dateInput', value)}
          value={values.dateInput}
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.sectionTitle}>Comment</ThemedText>
        <TextInput
          onChangeText={(value) => setField('note', value)}
          placeholder="Dentistry"
          placeholderTextColor={Colors.dark.muted}
          style={styles.commentInput}
          value={values.note}
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.sectionTitle}>Photo</ThemedText>
        <View style={styles.photoGrid}>
          {values.photos.map((photoUri) => (
            <View key={photoUri} style={[styles.photoTile, styles.photoTileFilled]}>
              <Image contentFit="cover" source={{ uri: photoUri }} style={styles.photoImage} />
              <Pressable onPress={() => handleRemovePhoto(photoUri)} style={styles.removePhotoButton}>
                <MaterialIcons color={TextColors.brand} name="close" size={16} />
              </Pressable>
            </View>
          ))}

          {Array.from({ length: emptySlots }).map((_, index) => (
            <Pressable key={`empty-${index}`} onPress={handleAddPhoto} style={styles.photoTile}>
              <MaterialIcons color={BackgroundColors.white} name="add" size={34} />
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!isValid}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          !isValid && styles.submitButtonDisabled,
          pressed && isValid && styles.submitButtonPressed,
        ]}>
        <ThemedText style={styles.submitLabel}>{mode === 'edit' ? 'Save' : 'Add'}</ThemedText>
      </Pressable>

      {mode === 'edit' ? (
        <Button label="Delete transaction" onPress={handleDelete} variant="danger" />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  amountField: {
    alignItems: 'center',
    backgroundColor: BackgroundColors.window,
    borderRadius: 18,
    flexDirection: 'row',
    gap: compactGap,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.s,
    width: 160,
  },
  amountFieldError: {
    borderColor: BackgroundColors.red,
    borderWidth: 2,
  },
  amountInput: {
    color: TextColors.brand,
    fontSize: 20,
    fontWeight: '500',
    minWidth: 72,
    paddingVertical: 0,
    textAlign: 'center',
  },
  amountPrefix: {
    color: TextColors.brand,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  amountSection: {
    alignItems: 'center',
    gap: Spacing.s - Spacing.xs / 2,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 36,
  },
  commentInput: {
    backgroundColor: BackgroundColors.window,
    borderRadius: 16,
    color: TextColors.brand,
    fontSize: 15,
    minHeight: 40,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s + Spacing.xs / 2,
  },
  content: {
    gap: sectionGap,
  },
  errorText: {
    color: BackgroundColors.red,
    fontSize: 13,
    lineHeight: 18,
  },
  fieldGroup: {
    gap: fieldGap,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: Spacing.m,
    justifyContent: 'space-between',
    minHeight: 104,
  },
  photoImage: {
    borderRadius: 20,
    height: '100%',
    width: '100%',
  },
  photoTile: {
    alignItems: 'center',
    backgroundColor: BackgroundColors.lightGray,
    borderRadius: 20,
    height: 96,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: 96,
  },
  photoTileFilled: {
    backgroundColor: BackgroundColors.window,
  },
  removePhotoButton: {
    alignItems: 'center',
    backgroundColor: BackgroundColors.window,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: Spacing.s,
    top: Spacing.s,
    width: 24,
  },
  sectionTitle: {
    color: BackgroundColors.white,
    fontSize: 15,
    lineHeight: 20,
  },
  submitButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: TextColors.tertiary,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 56,
    minWidth: 260,
    shadowColor: BackgroundColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    width: '74%',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  submitLabel: {
    color: BackgroundColors.black,
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 22,
  },
  titleText: {
    color: TextColors.brand,
    fontSize: 16,
    lineHeight: 20,
  },
  titleWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: BackgroundColors.window,
    borderRadius: 18,
    flexDirection: 'row',
    gap: Spacing.s,
    minHeight: 44,
    paddingHorizontal: horizontalInset,
    paddingVertical: Spacing.s + Spacing.xs / 2,
  },
});