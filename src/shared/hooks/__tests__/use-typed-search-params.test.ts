import { renderHook } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { pickParam, useTypedSearchParams } from '../use-typed-search-params';

const mockedUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;

describe('pickParam', () => {
  test('returns undefined for undefined input', () => {
    expect(pickParam(undefined)).toBeUndefined();
  });

  test('returns undefined for empty string', () => {
    expect(pickParam('')).toBeUndefined();
  });

  test('returns the string as-is for a non-empty single value', () => {
    expect(pickParam('abc')).toBe('abc');
  });

  test('returns the first array element', () => {
    expect(pickParam(['first', 'second'])).toBe('first');
  });

  test('returns undefined when array is empty', () => {
    expect(pickParam([])).toBeUndefined();
  });
});

describe('useTypedSearchParams', () => {
  beforeEach(() => {
    mockedUseLocalSearchParams.mockReset();
  });

  test('picks every requested key', () => {
    mockedUseLocalSearchParams.mockReturnValue({ id: 'tx-1', extra: 'ignored' });

    const { result } = renderHook(() =>
      useTypedSearchParams(['id', 'missing'] as const)
    );

    expect(result.current).toEqual({ id: 'tx-1', missing: undefined });
  });

  test('coerces array params via pickParam', () => {
    mockedUseLocalSearchParams.mockReturnValue({ id: ['first', 'second'] });

    const { result } = renderHook(() => useTypedSearchParams(['id'] as const));

    expect(result.current.id).toBe('first');
  });
});
