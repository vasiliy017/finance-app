import { act, renderHook } from '@testing-library/react-native';

import {
    clearPendingCategorySelection,
    setPendingCategorySelection,
    usePendingCategorySelection,
} from '../category-selection';

afterEach(() => {
  clearPendingCategorySelection();
});

describe('pending category selection', () => {
  test('initial snapshot is null', () => {
    const { result } = renderHook(() => usePendingCategorySelection());
    expect(result.current).toBeNull();
  });

  test('setPendingCategorySelection notifies subscribers', () => {
    const { result } = renderHook(() => usePendingCategorySelection());

    act(() => {
      setPendingCategorySelection({ category: 'food', type: 'expense' });
    });

    expect(result.current).toEqual({ category: 'food', type: 'expense' });
  });

  test('clearPendingCategorySelection resets snapshot to null', () => {
    setPendingCategorySelection({ category: 'salary', type: 'income' });
    const { result } = renderHook(() => usePendingCategorySelection());
    expect(result.current).toEqual({ category: 'salary', type: 'income' });

    act(() => {
      clearPendingCategorySelection();
    });

    expect(result.current).toBeNull();
  });

  test('subscribers unsubscribe on unmount', () => {
    const { result, unmount } = renderHook(() => usePendingCategorySelection());

    act(() => {
      setPendingCategorySelection({ category: 'food', type: 'expense' });
    });
    expect(result.current).not.toBeNull();

    unmount();

    // Should not throw, just no observable consequence here.
    act(() => {
      setPendingCategorySelection({ category: 'transport', type: 'expense' });
    });
  });
});
