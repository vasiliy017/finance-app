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
import { isValidCategoryForType, useCategoriesByType } from '@/shared/config';
import { formatDateInput, parseDateInput } from '@/shared/lib/date';
import {
    deletePersistedReceiptPhotosAsync,
    persistReceiptPhotosAsync,
} from '@/shared/lib/receipt-storage';

const MAX_TRANSACTION_PHOTOS = 3;

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
    errors.amount = 'Enter a positive amount';
  }

  if (!values.category) {
    errors.category = 'Select a category';
  }

  if (!parsedDate) {
    errors.dateInput = 'Use YYYY-MM-DD';
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
        await deletePersistedReceiptPhotosAsync(removedPhotos);
      } else {
        addTransaction(nextTransaction);
      }

      onCompleted?.();
    } catch {
      Alert.alert('Photo save failed', 'The selected receipt could not be saved locally. Please try again.');
    }
  }

  async function handleAddPhoto() {
    if (values.photos.length >= MAX_TRANSACTION_PHOTOS) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Photos permission needed',
        'Allow photo library access to attach receipt images to a transaction.'
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

    Alert.alert('Delete transaction', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePersistedReceiptPhotosAsync(transaction.photos ?? []);
          deleteTransaction(transaction.id);
          onCompleted?.();
        },
      },
    ]);
  }

  const isValid = !!buildTransactionInput(values).data;

  return {
    categories,
    handleAddPhoto,
    errors,
    handleDelete,
    handleRemovePhoto,
    handleSubmit,
    isDirty: JSON.stringify(values) !== JSON.stringify(createInitialValues(transaction)),
    isValid,
    setField,
    values,
  };
}