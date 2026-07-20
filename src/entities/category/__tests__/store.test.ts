import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    selectCustomCategories,
    selectCustomCategoriesHydrated,
    useCustomCategoryStore,
} from '../store';

const INITIAL = useCustomCategoryStore.getState();

beforeEach(async () => {
  await AsyncStorage.clear();
  useCustomCategoryStore.setState(
    { ...INITIAL, categories: [], hydrated: true },
    true
  );
});

describe('useCustomCategoryStore.addCategory', () => {
  test('returns a category with createdAt and appends to list', () => {
    const before = Date.now();
    const { addCategory } = useCustomCategoryStore.getState();

    const result = addCategory({
      id: 'custom-coffee',
      label: 'Coffee',
      type: 'expense',
      icon: 'local-cafe',
      color: '#fff',
    });

    expect(result.id).toBe('custom-coffee');
    expect(result.createdAt).toBeGreaterThanOrEqual(before);
    expect(selectCustomCategories(useCustomCategoryStore.getState())).toEqual([result]);
  });

  test('appends additional categories preserving order', () => {
    const { addCategory } = useCustomCategoryStore.getState();
    addCategory({ id: 'custom-a', label: 'A', type: 'expense', icon: 'i', color: '#1' });
    addCategory({ id: 'custom-b', label: 'B', type: 'income', icon: 'i', color: '#2' });

    const list = selectCustomCategories(useCustomCategoryStore.getState());
    expect(list.map((c) => c.id)).toEqual(['custom-a', 'custom-b']);
  });
});

describe('useCustomCategoryStore selectors', () => {
  test('selectCustomCategoriesHydrated reflects flag', () => {
    useCustomCategoryStore.setState({ hydrated: false });
    expect(selectCustomCategoriesHydrated(useCustomCategoryStore.getState())).toBe(false);
    useCustomCategoryStore.setState({ hydrated: true });
    expect(selectCustomCategoriesHydrated(useCustomCategoryStore.getState())).toBe(true);
  });
});
