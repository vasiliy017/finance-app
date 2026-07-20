import { act, fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import {
    useTransactionStore,
    type Transaction,
} from '@/entities/transaction';
import { HomeScreen } from '../home';

const mockRouter = router as jest.Mocked<typeof router>;
const INITIAL = useTransactionStore.getState();

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: Math.random().toString(36).slice(2),
    amount: 100,
    type: 'expense',
    category: 'food',
    date: Date.now(),
    ...overrides,
  };
}

function seed(transactions: Transaction[], hydrated = true) {
  act(() => {
    useTransactionStore.setState({ ...INITIAL, transactions, hydrated });
  });
}

describe('HomeScreen', () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
  });
  afterEach(() => {
    act(() => {
      useTransactionStore.setState(INITIAL, true);
    });
  });

  test('shows empty state when hydrated with no transactions', () => {
    seed([]);
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/No category data yet/i)).toBeTruthy();
  });

  test('shows loading inside the chart card before hydration', () => {
    seed([], false);
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/Calculating category totals/i)).toBeTruthy();
  });

  test('renders category breakdown when transactions exist', () => {
    seed([
      tx({ id: '1', amount: 10, category: 'food' }),
      tx({ id: '2', amount: 25, category: 'transport' }),
    ]);
    const { getAllByText } = render(<HomeScreen />);
    // Both category labels appear in the breakdown list.
    expect(getAllByText('Food').length).toBeGreaterThan(0);
    expect(getAllByText('Transport').length).toBeGreaterThan(0);
  });

  test('floating + button navigates to /transaction', () => {
    seed([]);
    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('Add transaction'));
    expect(mockRouter.push).toHaveBeenCalledWith('/transaction');
  });

  test('receipt icon navigates to transactions tab', () => {
    seed([]);
    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('Open transactions list'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/transactions');
  });

  test('Income tab toggles activeType', () => {
    seed([
      tx({ id: 'i', amount: 100, type: 'income', category: 'salary' as never }),
      tx({ id: 'e', amount: 30, type: 'expense', category: 'food' }),
    ]);
    const { getByLabelText, queryAllByText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('Show income'));
    // After switching to income, "Salary" category should be in the breakdown.
    expect(queryAllByText(/salary/i).length).toBeGreaterThan(0);
  });
});
