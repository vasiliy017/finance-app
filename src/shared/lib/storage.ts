import AsyncStorage from '@react-native-async-storage/async-storage';

type ZustandMiddlewareModule = typeof import('zustand/middleware');

declare const require: <T = unknown>(moduleId: string) => T;

const { createJSONStorage } = require<ZustandMiddlewareModule>('zustand/middleware');

export const TRANSACTION_STORAGE_KEY = 'finance-app.transactions';

export const transactionStorage = createJSONStorage(() => AsyncStorage);