import { act, fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';

import {
  useTransactionStore,
  type Transaction,
} from '@/entities/transaction';
import { TransactionForm } from '../transaction-form';

const TX_INITIAL = useTransactionStore.getState();

function resetStore() {
  act(() => {
    useTransactionStore.setState(TX_INITIAL, true);
  });
}

describe('TransactionForm — integration', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    resetStore();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });
  afterEach(() => {
    alertSpy.mockRestore();
    resetStore();
  });

  test('create flow: fill amount & category, submit adds tx and calls onCompleted', async () => {
    const onCompleted = jest.fn();
    const onCancel = jest.fn();

    const { getByPlaceholderText, getByText, UNSAFE_getAllByType } = render(
      <TransactionForm mode="create" onCancel={onCancel} onCompleted={onCompleted} />
    );

    // amount
    fireEvent.changeText(getByPlaceholderText('0'), '42.5');
    // pick a category — Food is in the default expense set.
    fireEvent.press(getByText('Food'));

    const submit = getByText('Add');
    await act(async () => {
      fireEvent.press(submit);
    });

    expect(onCompleted).toHaveBeenCalledTimes(1);
    expect(alertSpy).not.toHaveBeenCalled();
    const stored = useTransactionStore.getState().transactions;
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ amount: 42.5, type: 'expense', category: 'food' });
    // Silence unused warning.
    expect(UNSAFE_getAllByType).toBeDefined();
  });

  test('Add button is disabled until form is valid', () => {
    const onCompleted = jest.fn();
    const { getByPlaceholderText, getByRole, getByText } = render(
      <TransactionForm mode="create" onCancel={jest.fn()} onCompleted={onCompleted} />
    );

    expect(getByRole('button', { name: 'Add' }).props.accessibilityState).toMatchObject({
      disabled: true,
    });

    fireEvent.changeText(getByPlaceholderText('0'), '5');
    fireEvent.press(getByText('Food'));

    expect(getByRole('button', { name: 'Add' }).props.accessibilityState).toMatchObject({
      disabled: false,
    });
    expect(onCompleted).not.toHaveBeenCalled();
    expect(useTransactionStore.getState().transactions).toHaveLength(0);
  });

  test('edit flow: prefilled values; delete confirms via Alert then removes tx', async () => {
    const seed: Transaction = {
      id: 'tx-edit',
      amount: 12.5,
      type: 'expense',
      category: 'food',
      date: new Date(2025, 5, 17, 12, 0).getTime(),
    };
    act(() => {
      useTransactionStore.setState({
        ...TX_INITIAL,
        transactions: [seed],
        hydrated: true,
      });
    });

    const onCompleted = jest.fn();
    const { getByDisplayValue, getByText } = render(
      <TransactionForm
        mode="edit"
        transaction={seed}
        onCancel={jest.fn()}
        onCompleted={onCompleted}
      />
    );

    expect(getByDisplayValue('12.5')).toBeTruthy();

    fireEvent.press(getByText('Delete transaction'));
    expect(alertSpy).toHaveBeenCalledTimes(1);

    // Invoke the destructive button passed to Alert.alert.
    const [, , buttons] = alertSpy.mock.calls[0]!;
    const destructive = (buttons as Array<{ style?: string; onPress?: () => void | Promise<void> }>).find(
      (b) => b.style === 'destructive'
    );
    expect(destructive?.onPress).toBeDefined();
    await act(async () => {
      await destructive!.onPress!();
    });

    expect(useTransactionStore.getState().transactions).toHaveLength(0);
    expect(onCompleted).toHaveBeenCalledTimes(1);
  });

  test('regression: submit when isDirty=true does NOT trigger Discard alert', async () => {
    // This guards the bug fix: completed flag flips isDirty=false before the
    // onCompleted-triggered navigation runs, so usePreventRemove stays inert.
    const { getByPlaceholderText, getByText } = render(
      <TransactionForm mode="create" onCancel={jest.fn()} onCompleted={jest.fn()} />
    );

    fireEvent.changeText(getByPlaceholderText('0'), '7');
    fireEvent.press(getByText('Food'));

    await act(async () => {
      fireEvent.press(getByText('Add'));
    });

    // The only Alert.alert allowed is the Discard one. None of the success path
    // should have surfaced it.
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
