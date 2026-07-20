import { act, fireEvent, render } from '@testing-library/react-native';

import {
    useTransactionStore,
    type Transaction,
} from '@/entities/transaction';
import { TransactionList } from '../transaction-list';

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: Math.random().toString(36).slice(2),
    amount: 100,
    type: 'expense',
    category: 'food',
    date: new Date(2025, 5, 17, 12, 0).getTime(),
    ...overrides,
  };
}

const INITIAL = useTransactionStore.getState();

function seed(transactions: Transaction[], hydrated = true) {
  act(() => {
    useTransactionStore.setState({ ...INITIAL, transactions, hydrated });
  });
}

describe('TransactionList', () => {
  afterEach(() => {
    act(() => {
      useTransactionStore.setState(INITIAL, true);
    });
  });

  test('shows loading state before hydration', () => {
    seed([], false);
    const { getByText } = render(
      <TransactionList onAddTransaction={jest.fn()} onSelectTransaction={jest.fn()} />
    );
    expect(getByText(/Restoring/i)).toBeTruthy();
  });

  test('shows empty state when no transactions', () => {
    seed([]);
    const onAdd = jest.fn();
    const { getByText } = render(
      <TransactionList onAddTransaction={onAdd} onSelectTransaction={jest.fn()} />
    );
    expect(getByText(/No transactions yet/i)).toBeTruthy();
    fireEvent.press(getByText(/Add transaction/i));
    expect(onAdd).toHaveBeenCalled();
  });

  test('renders rows and fires onSelectTransaction', () => {
    const a = tx({ id: 'a', amount: 12 });
    const b = tx({ id: 'b', amount: 34, category: 'transport' });
    seed([a, b]);
    const onSelect = jest.fn();

    const { getAllByRole } = render(
      <TransactionList onAddTransaction={jest.fn()} onSelectTransaction={onSelect} />
    );

    const rows = getAllByRole('button');
    expect(rows.length).toBe(2);
    fireEvent.press(rows[0]!);
    // FlatList renders newest first via store sort; but we seeded raw — just assert
    // some transaction was forwarded.
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect([a, b]).toContainEqual(onSelect.mock.calls[0]![0]);
  });

  test('filters by type', () => {
    seed([
      tx({ id: 'e', type: 'expense' }),
      tx({ id: 'i', type: 'income', category: 'salary' as never }),
    ]);

    const { getAllByRole } = render(
      <TransactionList
        onAddTransaction={jest.fn()}
        onSelectTransaction={jest.fn()}
        typeFilter="income"
      />
    );
    expect(getAllByRole('button').length).toBe(1);
  });
});
