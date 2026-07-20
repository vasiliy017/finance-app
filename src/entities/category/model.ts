import type { CustomCategoryId, TransactionType } from '@/entities/transaction';

export type CustomCategory = {
  id: CustomCategoryId;
  label: string;
  type: TransactionType;
  icon: string;
  color: string;
  createdAt: number;
};

export type CustomCategoryInput = Omit<CustomCategory, 'createdAt'>;