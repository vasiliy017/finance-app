import AsyncStorage from '@react-native-async-storage/async-storage';

type ZustandMiddlewareModule = typeof import('zustand/middleware');

declare const require: <T = unknown>(moduleId: string) => T;

const { createJSONStorage } = require<ZustandMiddlewareModule>('zustand/middleware');

export const TRANSACTION_STORAGE_KEY = 'finance-app.transactions';
export const CUSTOM_CATEGORY_STORAGE_KEY = 'finance-app.custom-categories';

export const transactionStorage = createJSONStorage(() => AsyncStorage);
export const customCategoryStorage = createJSONStorage(() => AsyncStorage);