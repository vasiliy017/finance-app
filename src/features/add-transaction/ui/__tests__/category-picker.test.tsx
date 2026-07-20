import { fireEvent, render } from '@testing-library/react-native';

import { BackgroundColors } from '@/shared/config';
import { CategoryPicker } from '../category-picker';

const cat = (id: string, label: string, icon = 'shopping-cart', color = '#fff') => ({
  id: id as never,
  label,
  icon,
  color,
});

const many = [
  cat('food', 'Food'),
  cat('transport', 'Transport'),
  cat('shopping', 'Shopping'),
  cat('home', 'Home'),
  cat('fun', 'Fun'),
  cat('gifts', 'Gifts'),
  cat('health', 'Health'),
  cat('extra', 'Extra'),
  cat('other-expense', 'Other', 'more-horiz', BackgroundColors.blue),
];

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
}));

describe('CategoryPicker', () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  test('calls onChange when a category tile is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <CategoryPicker
        categories={[cat('food', 'Food'), cat('transport', 'Transport')]}
        onChange={onChange}
        type="expense"
      />
    );

    fireEvent.press(getByText('Transport'));
    expect(onChange).toHaveBeenCalledWith('transport');
  });

  test('renders Other overflow when categories exceed the compact limit', () => {
    const { getByText } = render(
      <CategoryPicker categories={many} onChange={jest.fn()} type="expense" />
    );
    expect(getByText('Other')).toBeTruthy();
  });

  test('Other overflow navigates to the category screen', () => {
    const { getByText } = render(
      <CategoryPicker categories={many} onChange={jest.fn()} value="food" type="expense" />
    );
    fireEvent.press(getByText('Other'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/category',
      params: { category: 'food', type: 'expense' },
    });
  });

  test('renders error message when provided', () => {
    const { getByText } = render(
      <CategoryPicker
        categories={[cat('food', 'Food')]}
        onChange={jest.fn()}
        type="expense"
        error="Pick a category"
      />
    );
    expect(getByText('Pick a category')).toBeTruthy();
  });

  test('Create tile fires onCreate when showAll & showCreateTile', () => {
    const onCreate = jest.fn();
    const { getByText } = render(
      <CategoryPicker
        categories={[cat('food', 'Food')]}
        onChange={jest.fn()}
        type="expense"
        showAll
        showCreateTile
        onCreate={onCreate}
      />
    );
    fireEvent.press(getByText('Create'));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
