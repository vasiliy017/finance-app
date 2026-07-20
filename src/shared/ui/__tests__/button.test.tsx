import { fireEvent, render } from '@testing-library/react-native';

import { Button } from '../button';

describe('Button', () => {
  test('renders label and fires onPress', () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = render(<Button label="Save" onPress={onPress} />);

    expect(getByText('Save')).toBeTruthy();
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('disabled blocks onPress', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Save" onPress={onPress} disabled />);

    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  test.each(['primary', 'secondary', 'danger', 'ghost'] as const)(
    'renders %s variant',
    (variant) => {
      const { getByText } = render(
        <Button label="Btn" onPress={jest.fn()} variant={variant} />
      );
      expect(getByText('Btn')).toBeTruthy();
    }
  );
});
