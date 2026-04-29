import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BackgroundColors, Colors, Spacing, TextColors } from '@/constants/theme';
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

const compactGap = Spacing.s - Spacing.xs / 2;
const fieldGap = Spacing.s + Spacing.xs / 2;
const horizontalInset = Spacing.m + Spacing.xs / 2;
const sectionGap = Spacing.l - Spacing.xs / 2;
const verticalInset = Spacing.m - Spacing.xs / 2;

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
          <MaterialIcons color={TextColors.brand} name="arrow-back-ios-new" size={20} />
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
          placeholderTextColor={Colors.dark.muted}
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
    backgroundColor: BackgroundColors.window,
    borderRadius: 22,
    flexDirection: 'row',
    gap: compactGap,
    justifyContent: 'center',
    minHeight: 84,
    paddingHorizontal: horizontalInset,
    width: 162,
  },
  amountFieldError: {
    borderColor: BackgroundColors.red,
    borderWidth: 2,
  },
  amountInput: {
    color: TextColors.brand,
    fontSize: 32,
    fontWeight: '600',
    minWidth: 72,
    paddingVertical: 0,
    textAlign: 'center',
  },
  amountPrefix: {
    color: TextColors.brand,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
  },
  amountSection: {
    alignItems: 'center',
    gap: Spacing.s,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: BackgroundColors.window,
    borderRadius: 20,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  commentInput: {
    backgroundColor: BackgroundColors.window,
    borderRadius: 20,
    color: TextColors.brand,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: Spacing.m,
    paddingVertical: verticalInset,
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
    minHeight: 112,
  },
  photoImage: {
    borderRadius: 26,
    height: '100%',
    width: '100%',
  },
  photoTile: {
    alignItems: 'center',
    backgroundColor: BackgroundColors.lightGray,
    borderRadius: 26,
    height: 112,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: 112,
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
  submitButton: {
    alignSelf: 'center',
    minWidth: 260,
    width: '72%',
  },
  titlePill: {
    backgroundColor: BackgroundColors.window,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: horizontalInset,
  },
  titleText: {
    color: TextColors.brand,
    fontSize: 16,
    lineHeight: 20,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.m - Spacing.xs,
  },
});