import { fireEvent, render } from '@testing-library/react-native';

import { TextField } from '../text-field';

describe('TextField', () => {
  test('renders label and forwards typing', () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue, getByText } = render(
      <TextField label="Amount" value="42" onChangeText={onChangeText} />
    );

    expect(getByText('Amount')).toBeTruthy();
    const input = getByDisplayValue('42');
    fireEvent.changeText(input, '99');
    expect(onChangeText).toHaveBeenCalledWith('99');
  });

  test('shows error message and hides hint when error is present', () => {
    const { getByText, queryByText } = render(
      <TextField label="Date" value="" error="Bad date" hint="YYYY-MM-DD" />
    );

    expect(getByText('Bad date')).toBeTruthy();
    expect(queryByText('YYYY-MM-DD')).toBeNull();
  });

  test('shows hint when no error', () => {
    const { getByText } = render(
      <TextField label="Date" value="" hint="YYYY-MM-DD" />
    );
    expect(getByText('YYYY-MM-DD')).toBeTruthy();
  });
});
