import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import { useCustomCategoryStore } from '@/entities/category';
import type { Transaction } from '@/entities/transaction';
import { useTransactionStore } from '@/entities/transaction';
import { logCrash } from '@/shared/lib/crash-logger';
import {
    ReceiptStorageError,
    deletePersistedReceiptPhotosAsync,
    persistReceiptPhotosAsync,
} from '@/shared/lib/receipt-storage';

import { useTransactionForm } from '../use-transaction-form';

jest.mock('@/shared/lib/receipt-storage', () => ({
  __esModule: true,
  ReceiptStorageError: jest.requireActual('@/shared/lib/receipt-storage').ReceiptStorageError,
  persistReceiptPhotosAsync: jest.fn(async (uris: string[]) => uris),
  deletePersistedReceiptPhotosAsync: jest.fn(async () => undefined),
}));

jest.mock('@/shared/lib/crash-logger', () => ({
  __esModule: true,
  logCrash: jest.fn(),
}));

const persistMock = persistReceiptPhotosAsync as jest.MockedFunction<
  typeof persistReceiptPhotosAsync
>;
const deleteMock = deletePersistedReceiptPhotosAsync as jest.MockedFunction<
  typeof deletePersistedReceiptPhotosAsync
>;
const logCrashMock = logCrash as jest.MockedFunction<typeof logCrash>;
let alertMock: jest.SpyInstance<ReturnType<typeof Alert.alert>, Parameters<typeof Alert.alert>>;
const permissionMock = ImagePicker.requestMediaLibraryPermissionsAsync as jest.MockedFunction<
  typeof ImagePicker.requestMediaLibraryPermissionsAsync
>;
const launchMock = ImagePicker.launchImageLibraryAsync as jest.MockedFunction<
  typeof ImagePicker.launchImageLibraryAsync
>;

const TX_INITIAL = useTransactionStore.getState();
const CAT_INITIAL = useCustomCategoryStore.getState();

beforeEach(() => {
  useTransactionStore.setState({ ...TX_INITIAL, transactions: [], hydrated: true }, true);
  useCustomCategoryStore.setState({ ...CAT_INITIAL, categories: [], hydrated: true }, true);
  persistMock.mockReset().mockImplementation(async (uris) => uris);
  deleteMock.mockReset().mockResolvedValue(undefined);
  logCrashMock.mockReset();
  alertMock = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  permissionMock.mockReset();
  launchMock.mockReset();
});

function mountCreate(onCompleted = jest.fn()) {
  const hook = renderHook(() => useTransactionForm({ mode: 'create', onCompleted }));
  return { ...hook, onCompleted };
}

function mountEdit(transaction: Transaction, onCompleted = jest.fn()) {
  const hook = renderHook(() =>
    useTransactionForm({ mode: 'edit', transaction, onCompleted })
  );
  return { ...hook, onCompleted };
}

describe('useTransactionForm — validation', () => {
  test('flags missing amount, category, and bad date on submit', async () => {
    const { result } = mountCreate();

    act(() => {
      result.current.setField('dateInput', 'invalid');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.amount).toBeDefined();
    expect(result.current.errors.category).toBeDefined();
    expect(result.current.errors.dateInput).toBeDefined();
    expect(useTransactionStore.getState().transactions).toHaveLength(0);
  });

  test('rejects non-positive and NaN amounts', async () => {
    const { result } = mountCreate();
    for (const bad of ['0', '-5', 'abc']) {
      act(() => {
        result.current.setField('amount', bad);
        result.current.setField('category', 'food');
      });
      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(result.current.errors.amount).toBeDefined();
    }
  });

  test('rejects amount above MAX_TRANSACTION_AMOUNT', async () => {
    const { result } = mountCreate();
    act(() => {
      result.current.setField('amount', '1000000001');
      result.current.setField('category', 'food');
    });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.errors.amount).toBeDefined();
    expect(useTransactionStore.getState().transactions).toHaveLength(0);
  });

  test('rejects dates more than 24h in the future', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2025, 5, 17, 12, 0, 0));
    try {
      const { result } = mountCreate();
      act(() => {
        result.current.setField('amount', '10');
        result.current.setField('category', 'food');
        result.current.setField('dateInput', '2025-06-19'); // >24h ahead
      });
      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(result.current.errors.dateInput).toBeDefined();
    } finally {
      jest.useRealTimers();
    }
  });

  test('setField does not surface errors until first submit attempt', () => {
    const { result } = mountCreate();
    act(() => {
      result.current.setField('amount', '-5');
    });
    expect(result.current.errors).toEqual({});
  });

  test('setField revalidates after first submit attempt', async () => {
    const { result } = mountCreate();
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.errors.amount).toBeDefined();

    act(() => {
      result.current.setField('amount', '10');
    });
    act(() => {
      result.current.setField('category', 'food');
    });
    expect(result.current.errors.amount).toBeUndefined();
    expect(result.current.errors.category).toBeUndefined();
  });

  test('clears category when type switches to a mismatching kind', async () => {
    const { result } = mountCreate();
    act(() => {
      result.current.setField('category', 'food'); // expense
    });
    expect(result.current.values.category).toBe('food');

    act(() => {
      result.current.setField('type', 'income');
    });
    await waitFor(() => expect(result.current.values.category).toBeUndefined());
  });
});

describe('useTransactionForm — submit (create)', () => {
  test('persists photos, adds the transaction, and fires onCompleted', async () => {
    persistMock.mockResolvedValueOnce(['file:///mock-documents/transaction-receipts/a.jpg']);

    const onCompleted = jest.fn();
    const { result } = mountCreate(onCompleted);

    act(() => {
      result.current.setField('amount', '42');
      result.current.setField('category', 'food');
      result.current.setField('note', '  lunch  ');
      result.current.setField('photos', ['file:///tmp/raw.jpg']);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    const transactions = useTransactionStore.getState().transactions;
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({
      amount: 42,
      type: 'expense',
      category: 'food',
      note: 'lunch',
      photos: ['file:///mock-documents/transaction-receipts/a.jpg'],
    });
    await waitFor(() => expect(onCompleted).toHaveBeenCalledTimes(1));
  });

  test('isDirty flips to false after successful submit (regression for usePreventRemove bug)', async () => {
    const { result } = mountCreate();
    act(() => {
      result.current.setField('amount', '10');
      result.current.setField('category', 'food');
    });
    expect(result.current.isDirty).toBe(true);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.isDirty).toBe(false);
  });
});

describe('useTransactionForm — submit (edit)', () => {
  const existing: Transaction = {
    id: 'tx-1',
    amount: 10,
    type: 'expense',
    category: 'food',
    date: Date.now(),
    photos: [
      'file:///mock-documents/transaction-receipts/keep.jpg',
      'file:///mock-documents/transaction-receipts/remove.jpg',
    ],
  };

  beforeEach(() => {
    useTransactionStore.setState({ transactions: [existing], hydrated: true });
  });

  test('updates the existing record', async () => {
    persistMock.mockImplementationOnce(async (uris) => uris);

    const onCompleted = jest.fn();
    const { result } = mountEdit(existing, onCompleted);

    act(() => {
      result.current.setField('amount', '15');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(useTransactionStore.getState().transactions[0]!.amount).toBe(15);
    await waitFor(() => expect(onCompleted).toHaveBeenCalled());
  });

  test('schedules cleanup of removed photo uris (orphan delete)', async () => {
    persistMock.mockImplementationOnce(async (uris) => uris);

    const { result } = mountEdit(existing);

    act(() => {
      // Drop one of the photos
      result.current.setField('photos', [
        'file:///mock-documents/transaction-receipts/keep.jpg',
      ]);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(deleteMock).toHaveBeenCalledWith([
      'file:///mock-documents/transaction-receipts/remove.jpg',
    ]);
  });
});

describe('useTransactionForm — submit errors', () => {
  test('ReceiptStorageError surfaces user alert and skips logCrash', async () => {
    persistMock.mockRejectedValueOnce(
      new ReceiptStorageError('TOO_LARGE', 'Too big')
    );

    const { result } = mountCreate();
    act(() => {
      result.current.setField('amount', '10');
      result.current.setField('category', 'food');
      result.current.setField('photos', ['file:///tmp/big.jpg']);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(alertMock).toHaveBeenCalled();
    expect(logCrashMock).not.toHaveBeenCalled();
    expect(useTransactionStore.getState().transactions).toHaveLength(0);
  });

  test('unknown error triggers alert AND logCrash', async () => {
    persistMock.mockRejectedValueOnce(new Error('out of memory'));

    const { result } = mountCreate();
    act(() => {
      result.current.setField('amount', '10');
      result.current.setField('category', 'food');
      result.current.setField('photos', ['file:///tmp/a.jpg']);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(alertMock).toHaveBeenCalled();
    expect(logCrashMock).toHaveBeenCalledTimes(1);
  });
});

describe('useTransactionForm — photos', () => {
  test('handleAddPhoto refuses when at MAX_TRANSACTION_PHOTOS', async () => {
    const { result } = mountCreate();
    act(() => {
      result.current.setField('photos', ['a', 'b', 'c']);
    });

    await act(async () => {
      await result.current.handleAddPhoto();
    });

    expect(permissionMock).not.toHaveBeenCalled();
    expect(launchMock).not.toHaveBeenCalled();
  });

  test('handleAddPhoto shows alert when permission denied', async () => {
    permissionMock.mockResolvedValueOnce({
      granted: false,
      status: ImagePicker.PermissionStatus.DENIED,
      canAskAgain: false,
      expires: 'never',
    });

    const { result } = mountCreate();
    await act(async () => {
      await result.current.handleAddPhoto();
    });

    expect(alertMock).toHaveBeenCalled();
    expect(launchMock).not.toHaveBeenCalled();
    expect(result.current.values.photos).toEqual([]);
  });

  test('handleAddPhoto appends selected photo uri on success', async () => {
    permissionMock.mockResolvedValueOnce({
      granted: true,
      status: ImagePicker.PermissionStatus.GRANTED,
      canAskAgain: true,
      expires: 'never',
    });
    launchMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///tmp/new.jpg' } as never],
    });

    const { result } = mountCreate();
    await act(async () => {
      await result.current.handleAddPhoto();
    });

    expect(result.current.values.photos).toEqual(['file:///tmp/new.jpg']);
  });

  test('handleAddPhoto does nothing when picker canceled', async () => {
    permissionMock.mockResolvedValueOnce({
      granted: true,
      status: ImagePicker.PermissionStatus.GRANTED,
      canAskAgain: true,
      expires: 'never',
    });
    launchMock.mockResolvedValueOnce({ canceled: true, assets: null });

    const { result } = mountCreate();
    await act(async () => {
      await result.current.handleAddPhoto();
    });

    expect(result.current.values.photos).toEqual([]);
  });

  test('handleRemovePhoto filters by uri', () => {
    const { result } = mountCreate();
    act(() => {
      result.current.setField('photos', ['a', 'b', 'c']);
    });
    act(() => {
      result.current.handleRemovePhoto('b');
    });
    expect(result.current.values.photos).toEqual(['a', 'c']);
  });
});

describe('useTransactionForm — delete', () => {
  const existing: Transaction = {
    id: 'tx-9',
    amount: 5,
    type: 'expense',
    category: 'food',
    date: Date.now(),
    photos: ['file:///mock-documents/transaction-receipts/a.jpg'],
  };

  beforeEach(() => {
    useTransactionStore.setState({ transactions: [existing], hydrated: true });
  });

  test('confirm path deletes from store, cleans photos, and fires onCompleted', async () => {
    // Simulate user tapping the destructive button.
    alertMock.mockImplementationOnce((_title, _msg, buttons) => {
      const destructive = (buttons as { style?: string; onPress?: () => void }[] | undefined)?.find(
        (b) => b.style === 'destructive'
      );
      destructive?.onPress?.();
    });

    const onCompleted = jest.fn();
    const { result } = mountEdit(existing, onCompleted);

    await act(async () => {
      result.current.handleDelete();
    });

    await waitFor(() => {
      expect(useTransactionStore.getState().transactions).toHaveLength(0);
    });
    expect(deleteMock).toHaveBeenCalledWith(existing.photos);
    await waitFor(() => expect(onCompleted).toHaveBeenCalled());
  });

  test('cancel path leaves store untouched', async () => {
    alertMock.mockImplementationOnce((_title, _msg, buttons) => {
      const cancel = (buttons as { style?: string; onPress?: () => void }[] | undefined)?.find(
        (b) => b.style === 'cancel'
      );
      cancel?.onPress?.();
    });

    const onCompleted = jest.fn();
    const { result } = mountEdit(existing, onCompleted);

    await act(async () => {
      result.current.handleDelete();
    });

    expect(useTransactionStore.getState().transactions).toHaveLength(1);
    expect(onCompleted).not.toHaveBeenCalled();
  });

  test('handleDelete is a no-op when no transaction is bound', () => {
    const { result } = mountCreate();
    expect(() => result.current.handleDelete()).not.toThrow();
    expect(alertMock).not.toHaveBeenCalled();
  });
});
