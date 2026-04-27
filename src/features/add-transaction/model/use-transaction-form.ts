import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import {
  getCategoriesByType,
  isValidCategoryForType,
  type Transaction,
  type TransactionCategory,
  type TransactionInput,
  type TransactionType,
  useTransactionStore,
} from '@/src/entities/transaction';
import { formatDateInput, parseDateInput } from '@/src/shared/lib/date';

export type TransactionFormMode = 'create' | 'edit';

export type TransactionFormValues = {
  amount: string;
  type: TransactionType;
  category?: TransactionCategory;
  dateInput: string;
  note: string;
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
    };
  }

  return {
    amount: String(transaction.amount),
    type: transaction.type,
    category: transaction.category,
    dateInput: formatDateInput(transaction.date),
    note: transaction.note ?? '',
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

  const categories = useMemo(() => getCategoriesByType(values.type), [values.type]);

  function setField<Key extends keyof TransactionFormValues>(field: Key, value: TransactionFormValues[Key]) {
    setValues((current) => ({ ...current, [field]: value }));

    if (submitAttempted) {
      const validation = buildTransactionInput({ ...values, [field]: value });
      setErrors(validation.errors);
    }
  }

  function handleSubmit() {
    setSubmitAttempted(true);

    const validation = buildTransactionInput(values);
    setErrors(validation.errors);

    if (!validation.data) {
      return;
    }

    if (mode === 'edit' && transaction) {
      updateTransaction(transaction.id, validation.data);
    } else {
      addTransaction(validation.data);
    }

    onCompleted?.();
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
        onPress: () => {
          deleteTransaction(transaction.id);
          onCompleted?.();
        },
      },
    ]);
  }

  const isValid = !!buildTransactionInput(values).data;

  return {
    categories,
    errors,
    handleDelete,
    handleSubmit,
    isDirty: JSON.stringify(values) !== JSON.stringify(createInitialValues(transaction)),
    isValid,
    setField,
    values,
  };
}