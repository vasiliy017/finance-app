import { customCategoryStorage, CUSTOM_CATEGORY_STORAGE_KEY } from '@/shared/lib/storage';
import { type CustomCategory, type CustomCategoryInput } from './model';

type ZustandModule = typeof import('zustand');
type ZustandMiddlewareModule = typeof import('zustand/middleware');

declare const require: <T = unknown>(moduleId: string) => T;

const { create } = require<ZustandModule>('zustand');
const { persist } = require<ZustandMiddlewareModule>('zustand/middleware');

type CustomCategoryStore = {
  categories: CustomCategory[];
  addCategory: (category: CustomCategoryInput) => CustomCategory;
};

export const useCustomCategoryStore = create<CustomCategoryStore>()(
  persist(
    (set) => ({
      categories: [],
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
      storage: customCategoryStorage,
      partialize: (state) => ({ categories: state.categories }),
    }
  )
);

export const selectCustomCategories = (state: CustomCategoryStore) => state.categories;
export const selectAddCustomCategory = (state: CustomCategoryStore) => state.addCategory;