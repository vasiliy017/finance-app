import { createSafeStorage, CUSTOM_CATEGORY_STORAGE_KEY } from '@/shared/lib/storage';
import { type CustomCategory, type CustomCategoryInput } from './model';

type ZustandModule = typeof import('zustand');
type ZustandMiddlewareModule = typeof import('zustand/middleware');

declare const require: <T = unknown>(moduleId: string) => T;

const { create } = require<ZustandModule>('zustand');
const { persist } = require<ZustandMiddlewareModule>('zustand/middleware');

type CustomCategoryStore = {
  hydrated: boolean;
  categories: CustomCategory[];
  setHydrated: (hydrated: boolean) => void;
  addCategory: (category: CustomCategoryInput) => CustomCategory;
};

type PersistedCustomCategoryState = { categories: CustomCategory[] };

function isPersistedCustomCategoryState(value: unknown): value is PersistedCustomCategoryState {
  if (!value || typeof value !== 'object') return false;
  const candidate = (value as { categories?: unknown }).categories;
  return Array.isArray(candidate) && candidate.every(isCustomCategory);
}

function isCustomCategory(value: unknown): value is CustomCategory {
  if (!value || typeof value !== 'object') return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.label === 'string' &&
    (c.type === 'income' || c.type === 'expense') &&
    typeof c.icon === 'string' &&
    typeof c.color === 'string' &&
    typeof c.createdAt === 'number'
  );
}

export const useCustomCategoryStore = create<CustomCategoryStore>()(
  persist(
    (set) => ({
      hydrated: false,
      categories: [],
      setHydrated: (hydrated) => set({ hydrated }),
      addCategory: (category) => {
        const nextCategory = {
          ...category,
          createdAt: Date.now(),
        } satisfies CustomCategory;

        set((state) => ({
          categories: [...state.categories, nextCategory],
        }));

        return nextCategory;
      },
    }),
    {
      name: CUSTOM_CATEGORY_STORAGE_KEY,
      storage: createSafeStorage(isPersistedCustomCategoryState),
      partialize: (state) => ({ categories: state.categories }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('[custom-category-store] rehydrate error', error);
        }
        state?.setHydrated(true);
      },
    }
  )
);

export const selectCustomCategoriesHydrated = (state: CustomCategoryStore) => state.hydrated;
export const selectCustomCategories = (state: CustomCategoryStore) => state.categories;
export const selectAddCustomCategory = (state: CustomCategoryStore) => state.addCategory;