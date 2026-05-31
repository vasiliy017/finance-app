import type { TransactionCategory, TransactionType } from '@/entities/transaction';

export type CustomCategory = {
  id: TransactionCategory;
  label: string;
  type: TransactionType;
  icon: string;
  color: string;
  createdAt: number;
};

export type CustomCategoryInput = Omit<CustomCategory, 'createdAt'>;