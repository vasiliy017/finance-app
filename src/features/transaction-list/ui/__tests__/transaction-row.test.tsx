import { fireEvent, render } from '@testing-library/react-native';

import type { Transaction } from '@/entities/transaction';
import { TransactionRow } from '../transaction-row';

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 't1',
    amount: 1234.5,
    type: 'expense',
    category: 'food',
    date: new Date(2025, 5, 17, 15, 30).getTime(),
    ...overrides,
  };
}

describe('TransactionRow', () => {
  test('renders category label and amount', () => {
    const { getByText } = render(<TransactionRow transaction={tx()} />);
    expect(getByText('Food')).toBeTruthy();
    // Amount text is locale-formatted — assert contains the integer digits.
    expect(getByText(/1[\s,.\u00a0]?234/)).toBeTruthy();
  });

  test('a11y label combines category, type and amount', () => {
    const { getByLabelText } = render(<TransactionRow transaction={tx()} />);
    expect(getByLabelText(/Food/)).toBeTruthy();
    expect(getByLabelText(/expense/)).toBeTruthy();
  });

  test('renders note when present', () => {
    const { getByText } = render(
      <TransactionRow transaction={tx({ note: 'lunch with team' })} />
    );
    expect(getByText('lunch with team')).toBeTruthy();
  });

  test('omits note row when note is blank/whitespace', () => {
    const { queryByText } = render(
      <TransactionRow transaction={tx({ note: '   ' })} />
    );
    expect(queryByText('   ')).toBeNull();
  });

  test('fires onPress', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <TransactionRow transaction={tx()} onPress={onPress} />
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('falls back to category id when definition is unknown', () => {
    const unknown = tx({ category: 'totally-unknown' as never });
    const { getByText } = render(<TransactionRow transaction={unknown} />);
    expect(getByText('totally-unknown')).toBeTruthy();
  });
});
