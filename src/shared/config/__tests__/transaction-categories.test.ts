import { renderHook } from '@testing-library/react-native';
import { act } from 'react';

import { useCustomCategoryStore } from '@/entities/category';

import {
    CUSTOM_CATEGORY_ID_PREFIX,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    getCategoryDefinition,
    getCategoryLabel,
    isValidCategoryForType,
    useCategoriesByType,
} from '../transaction-categories';

beforeEach(() => {
  useCustomCategoryStore.setState({ categories: [], hydrated: true });
});

describe('getCategoryDefinition', () => {
  test('returns a built-in expense category', () => {
    expect(getCategoryDefinition('food')?.type).toBe('expense');
  });

  test('returns a built-in income category', () => {
    expect(getCategoryDefinition('salary')?.type).toBe('income');
  });

  test('returns undefined for unknown id', () => {
    expect(getCategoryDefinition('does-not-exist' as never)).toBeUndefined();
  });

  test('returns custom category when one is registered', () => {
    const id = `${CUSTOM_CATEGORY_ID_PREFIX}coffee` as const;
    useCustomCategoryStore.setState({
      categories: [
        {
          id,
          label: 'Coffee',
          type: 'expense',
          icon: 'local-cafe',
          color: '#abcdef',
          createdAt: Date.now(),
        },
      ],
      hydrated: true,
    });

    const def = getCategoryDefinition(id);
    expect(def?.label).toBe('Coffee');
    expect(def?.type).toBe('expense');
  });
});

describe('getCategoryLabel', () => {
  test('returns label for known id', () => {
    expect(getCategoryLabel('food')).toBe('Food');
  });

  test('falls back to id for unknown', () => {
    expect(getCategoryLabel('unknown' as never)).toBe('unknown');
  });
});

describe('isValidCategoryForType', () => {
  test('true when category type matches', () => {
    expect(isValidCategoryForType('food', 'expense')).toBe(true);
    expect(isValidCategoryForType('salary', 'income')).toBe(true);
  });

  test('false when category type mismatches', () => {
    expect(isValidCategoryForType('food', 'income')).toBe(false);
  });

  test('false for unknown ids', () => {
    expect(isValidCategoryForType('nope', 'expense')).toBe(false);
  });

  test('respects custom-category type', () => {
    const id = `${CUSTOM_CATEGORY_ID_PREFIX}gym` as const;
    useCustomCategoryStore.setState({
      categories: [
        { id, label: 'Gym', type: 'expense', icon: 'sports', color: '#fff', createdAt: 0 },
      ],
      hydrated: true,
    });
    expect(isValidCategoryForType(id, 'expense')).toBe(true);
    expect(isValidCategoryForType(id, 'income')).toBe(false);
  });
});

describe('useCategoriesByType', () => {
  test('returns built-in expense categories when store is empty', () => {
    const { result } = renderHook(() => useCategoriesByType('expense'));
    expect(result.current).toHaveLength(EXPENSE_CATEGORIES.length);
    expect(result.current.every((c) => c.type === 'expense')).toBe(true);
  });

  test('merges custom categories of the requested type', () => {
    const { result, rerender } = renderHook(({ type }) => useCategoriesByType(type), {
      initialProps: { type: 'expense' as const },
    });

    act(() => {
      useCustomCategoryStore.setState({
        categories: [
          {
            id: `${CUSTOM_CATEGORY_ID_PREFIX}gym`,
            label: 'Gym',
            type: 'expense',
            icon: 'sports',
            color: '#fff',
            createdAt: 0,
          },
          {
            id: `${CUSTOM_CATEGORY_ID_PREFIX}bonus`,
            label: 'Bonus',
            type: 'income',
            icon: 'paid',
            color: '#0f0',
            createdAt: 0,
          },
        ],
        hydrated: true,
      });
    });

    rerender({ type: 'expense' });
    expect(result.current).toHaveLength(EXPENSE_CATEGORIES.length + 1);
    expect(result.current.some((c) => c.label === 'Gym')).toBe(true);
    expect(result.current.some((c) => c.label === 'Bonus')).toBe(false);

    rerender({ type: 'income' });
    expect(result.current).toHaveLength(INCOME_CATEGORIES.length + 1);
    expect(result.current.some((c) => c.label === 'Bonus')).toBe(true);
  });
});
