import { useMemo } from 'react';

import {
  selectCustomCategories,
  useCustomCategoryStore,
  type CustomCategory,
} from '@/entities/category';
import type { TransactionCategory, TransactionType } from '@/entities/transaction';
import { BackgroundColors, TextColors } from './theme';

export type CategoryDefinition = {
  id: TransactionCategory;
  label: string;
  type: TransactionType;
  icon: string;
  color: string;
};

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food', type: 'expense', icon: 'restaurant', color: BackgroundColors.violet },
  { id: 'transport', label: 'Transport', type: 'expense', icon: 'directions-car', color: BackgroundColors.brown },
  { id: 'home', label: 'Home', type: 'expense', icon: 'home', color: BackgroundColors.orange },
  { id: 'health', label: 'Health', type: 'expense', icon: 'favorite', color: BackgroundColors.red },
  { id: 'shopping', label: 'Shopping', type: 'expense', icon: 'shopping-cart', color: BackgroundColors.purpure },
  { id: 'entertainment', label: 'Entertainment', type: 'expense', icon: 'sports-esports', color: BackgroundColors.green },
  { id: 'bills', label: 'Bills', type: 'expense', icon: 'receipt-long', color: BackgroundColors.blue },
  { id: 'education', label: 'Education', type: 'expense', icon: 'school', color: BackgroundColors.yellow },
  { id: 'other-expense', label: 'Other', type: 'expense', icon: 'more-horiz', color: BackgroundColors.blue },
] as const satisfies readonly CategoryDefinition[];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', type: 'income', icon: 'payments', color: TextColors.secondary },
  { id: 'freelance', label: 'Freelance', type: 'income', icon: 'work', color: TextColors.tertiary },
  { id: 'gift', label: 'Gift', type: 'income', icon: 'card-giftcard', color: BackgroundColors.red },
  { id: 'refund', label: 'Refund', type: 'income', icon: 'replay', color: BackgroundColors.blue },
  { id: 'investment', label: 'Investment', type: 'income', icon: 'trending-up', color: BackgroundColors.purpure },
  { id: 'other-income', label: 'Other', type: 'income', icon: 'add-circle-outline', color: BackgroundColors.green },
] as const satisfies readonly CategoryDefinition[];

export const TRANSACTION_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] as const;

function mapCustomCategory(category: CustomCategory): CategoryDefinition {
  return {
    color: category.color,
    icon: category.icon,
    id: category.id,
    label: category.label,
    type: category.type,
  };
}

function getBuiltinCategoriesByType(type: TransactionType) {
  return TRANSACTION_CATEGORIES.filter((category) => category.type === type);
}

function mergeCategoriesByType(type: TransactionType, customCategories: readonly CustomCategory[]) {
  return [...getBuiltinCategoriesByType(type), ...customCategories.filter((category) => category.type === type).map(mapCustomCategory)];
}

export function getCustomCategories() {
  return selectCustomCategories(useCustomCategoryStore.getState()).map(mapCustomCategory);
}

export function useCategoriesByType(type: TransactionType) {
  const customCategories = useCustomCategoryStore(selectCustomCategories);

  return useMemo(() => mergeCategoriesByType(type, customCategories), [customCategories, type]);
}

export function getCategoriesByType(type: TransactionType) {
  return mergeCategoriesByType(type, selectCustomCategories(useCustomCategoryStore.getState()));
}

export function getCategoryLabel(categoryId: TransactionCategory) {
  return getCategoryDefinition(categoryId)?.label ?? categoryId;
}

export function getCategoryDefinition(categoryId: TransactionCategory) {
  return [...TRANSACTION_CATEGORIES, ...getCustomCategories()].find((category) => category.id === categoryId);
}

export function isValidCategoryForType(categoryId: string, type: TransactionType): categoryId is TransactionCategory {
  return getCategoriesByType(type).some((category) => category.id === categoryId);
}