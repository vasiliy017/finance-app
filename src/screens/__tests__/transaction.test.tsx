import { act, render } from '@testing-library/react-native';

import {
    useTransactionStore,
    type Transaction,
} from '@/entities/transaction';
import { router } from 'expo-router';
import { TransactionScreen } from '../transaction.tsx';

const mockRouter = router as jest.Mocked<typeof router>;
const useLocalSearchParams = jest.requireMock('expo-router').useLocalSearchParams as jest.Mock;

const INITIAL = useTransactionStore.getState();

function reset() {
  act(() => {
    useTransactionStore.setState(INITIAL, true);
  });
  mockRouter.back.mockClear();
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  useLocalSearchParams.mockReset();
  useLocalSearchParams.mockReturnValue({});
}

describe('TransactionScreen', () => {
  beforeEach(reset);
  afterEach(reset);

  test('shows loading state before hydration', () => {
    act(() => {
      useTransactionStore.setState({ ...INITIAL, hydrated: false });
    });
    const { getByText } = render(<TransactionScreen />);
    expect(getByText(/Opening transaction form/i)).toBeTruthy();
  });

  test('renders create form when no id param', () => {
    act(() => {
      useTransactionStore.setState({ ...INITIAL, hydrated: true });
    });
    const { getByText } = render(<TransactionScreen />);
    expect(getByText('Add')).toBeTruthy();
  });

  test('renders not-found EmptyState when id is unknown in edit mode', () => {
    useLocalSearchParams.mockReturnValue({ id: 'nope' });
    act(() => {
      useTransactionStore.setState({ ...INITIAL, hydrated: true });
    });
    const { getByText } = render(<TransactionScreen />);
    expect(getByText(/Transaction not found/i)).toBeTruthy();
  });

  test('renders edit form with existing transaction', () => {
    const tx: Transaction = {
      id: 'tx-1',
      amount: 9.99,
      type: 'expense',
      category: 'food',
      date: Date.now(),
    };
    act(() => {
      useTransactionStore.setState({
        ...INITIAL,
        hydrated: true,
        transactions: [tx],
      });
    });
    useLocalSearchParams.mockReturnValue({ id: 'tx-1' });

    const { getByDisplayValue, getByText } = render(<TransactionScreen />);
    expect(getByDisplayValue('9.99')).toBeTruthy();
    expect(getByText('Save')).toBeTruthy();
  });
});
