import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  type Transaction,
  type TransactionCategory,
  type TransactionInput,
  type TransactionType,
  useTransactionStore,
} from '@/entities/transaction';
import { isValidCategoryForType, Strings, useCategoriesByType } from '@/shared/config';
import { logCrash } from '@/shared/lib/crash-logger';
import { formatDateInput, parseDateInput } from '@/shared/lib/date';
import {
  deletePersistedReceiptPhotosAsync,
  persistReceiptPhotosAsync,
  ReceiptStorageError,
} from '@/shared/lib/receipt-storage';

const MAX_TRANSACTION_PHOTOS = 3;
const MAX_TRANSACTION_AMOUNT = 1_000_000_000;
const FUTURE_DATE_TOLERANCE_MS = 24 * 60 * 60 * 1000;

export type TransactionFormMode = 'create' | 'edit';

export type TransactionFormValues = {
  amount: string;
  type: TransactionType;
  category?: TransactionCategory;
  dateInput: string;
  note: string;
  photos: string[];
};

type TransactionFormErrors = Partial<Record<'amount' | 'category' | 'dateInput', string>>;

type UseTransactionFormOptions = {
  mode: TransactionFormMode;
  transaction?: Transaction;
  onCompleted?: () => void;
};

function createInitialValues(transaction?: Transaction): TransactionFormValues {
  if (!transaction) {
    return {
      amount: '',
      type: 'expense',
      category: undefined,
      dateInput: formatDateInput(Date.now()),
      note: '',
      photos: [],
    };
  }

  return {
    amount: String(transaction.amount),
    type: transaction.type,
    category: transaction.category,
    dateInput: formatDateInput(transaction.date),
    note: transaction.note ?? '',
    photos: transaction.photos ?? [],
  };
}

function normalizeAmount(value: string) {
  return Number(value.replace(/,/g, '.').trim());
}

function buildTransactionInput(values: TransactionFormValues): {
  data?: TransactionInput;
  errors: TransactionFormErrors;
} {
  const amount = normalizeAmount(values.amount);
  const parsedDate = parseDateInput(values.dateInput);
  const errors: TransactionFormErrors = {};

  if (!values.amount.trim() || Number.isNaN(amount) || amount <= 0) {
    errors.amount = Strings.transactionForm.errorAmountPositive;
  } else if (amount > MAX_TRANSACTION_AMOUNT) {
    errors.amount = Strings.transactionForm.errorAmountTooLarge;
  }

  if (!values.category) {
    errors.category = Strings.transactionForm.errorCategoryRequired;
  }

  if (!parsedDate) {
    errors.dateInput = Strings.transactionForm.errorDateFormat;
  } else if (parsedDate > Date.now() + FUTURE_DATE_TOLERANCE_MS) {
    errors.dateInput = Strings.transactionForm.errorDateFuture;
  }

  if (Object.keys(errors).length > 0 || !values.category || !parsedDate) {
    return { errors };
  }

  return {
    data: {
      amount,
      type: values.type,
      category: values.category,
      date: parsedDate,
      note: values.note.trim() ? values.note.trim() : undefined,
      photos: values.photos.length > 0 ? values.photos : undefined,
    },
    errors,
  };
}

export function useTransactionForm({ mode, transaction, onCompleted }: UseTransactionFormOptions) {
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const updateTransaction = useTransactionStore((state) => state.updateTransaction);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);
  const [values, setValues] = useState<TransactionFormValues>(() => createInitialValues(transaction));
  const [errors, setErrors] = useState<TransactionFormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  // Becomes `true` after a successful submit or delete. We hand this back to
  // the consumer so the unsaved-changes guard (usePreventRemove) can be
  // disabled before navigation away — otherwise the guard intercepts the
  // post-success router.back() and shows a spurious "Discard changes?" alert.
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setValues(createInitialValues(transaction));
  }, [transaction]);

  useEffect(() => {
    if (values.category && !isValidCategoryForType(values.category, values.type)) {
      setValues((current) => ({ ...current, category: undefined }));
    }
  }, [values.category, values.type]);

  const categories = useCategoriesByType(values.type);

  function setField<Key extends keyof TransactionFormValues>(field: Key, value: TransactionFormValues[Key]) {
    setValues((current) => ({ ...current, [field]: value }));

    if (submitAttempted) {
      const validation = buildTransactionInput({ ...values, [field]: value });
      setErrors(validation.errors);
    }
  }

  async function handleSubmit() {
    setSubmitAttempted(true);

    const validation = buildTransactionInput(values);
    setErrors(validation.errors);

    if (!validation.data) {
      return;
    }

    try {
      const persistedPhotos = await persistReceiptPhotosAsync(validation.data.photos ?? []);
      const nextTransaction = {
        ...validation.data,
        photos: persistedPhotos.length > 0 ? persistedPhotos : undefined,
      } satisfies TransactionInput;

      if (mode === 'edit' && transaction) {
        const removedPhotos = (transaction.photos ?? []).filter(
          (photoUri) => !(nextTransaction.photos ?? []).includes(photoUri)
        );

        updateTransaction(transaction.id, nextTransaction);
        // Fire-and-forget; orphan cleanup must never block UX or surface errors
        // because the source-of-truth update has already succeeded.
        void deletePersistedReceiptPhotosAsync(removedPhotos);
      } else {
        addTransaction(nextTransaction);
      }

      // Flip completed so the next render disables the unsaved-changes guard;
      // the consumer effect then fires onCompleted (router.back()).
      setCompleted(true);
    } catch (error) {
      const message =
        error instanceof ReceiptStorageError
          ? error.message
          : Strings.transactionForm.photoSaveFailedGeneric;
      // Surface to the user, then forward to the crash logger so non-storage
      // failures (which the user can't act on) still reach telemetry.
      Alert.alert(Strings.transactionForm.photoSaveFailedTitle, message);
      if (!(error instanceof ReceiptStorageError)) {
        logCrash(error, { scope: 'TransactionForm.handleSubmit', extra: { mode } });
      }
    }
  }

  async function handleAddPhoto() {
    if (values.photos.length >= MAX_TRANSACTION_PHOTOS) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        Strings.transactionForm.permissionTitle,
        Strings.transactionForm.permissionMessage
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    setField('photos', [...values.photos, result.assets[0].uri]);
  }

  function handleRemovePhoto(uri: string) {
    setField(
      'photos',
      values.photos.filter((currentUri) => currentUri !== uri)
    );
  }

  function handleDelete() {
    if (!transaction) {
      return;
    }

    Alert.alert(Strings.transactionForm.deleteTitle, Strings.transactionForm.deleteMessage, [
      { text: Strings.common.cancel, style: 'cancel' },
      {
        text: Strings.common.delete,
        style: 'destructive',
        onPress: async () => {
          await deletePersistedReceiptPhotosAsync(transaction.photos ?? []);
          deleteTransaction(transaction.id);
          setCompleted(true);
        },
      },
    ]);
  }

  // After a successful save or delete, defer the consumer callback to an
  // effect so the guard's `enabled` flag (derived from isDirty) has flushed
  // to false before router.back() dispatches.
  useEffect(() => {
    if (completed) {
      onCompleted?.();
    }
  }, [completed, onCompleted]);

  const isDirty =
    !completed && JSON.stringify(values) !== JSON.stringify(createInitialValues(transaction));
  const isValid = !!buildTransactionInput(values).data;

  return {
    categories,
    handleAddPhoto,
    errors,
    handleDelete,
    handleRemovePhoto,
    handleSubmit,
    isDirty,
    isValid,
    setField,
    values,
  };
}