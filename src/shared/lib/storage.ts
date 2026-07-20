import AsyncStorage from '@react-native-async-storage/async-storage';

export const TRANSACTION_STORAGE_KEY = 'finance-app.transactions';
export const CUSTOM_CATEGORY_STORAGE_KEY = 'finance-app.custom-categories';

type StoredEnvelope<TState> = {
  state: TState;
  version?: number;
};

type PersistStorageLike<TState> = {
  getItem: (name: string) => Promise<StoredEnvelope<TState> | null>;
  setItem: (name: string, value: StoredEnvelope<TState>) => Promise<void>;
  removeItem: (name: string) => Promise<void>;
};

/**
 * Wraps AsyncStorage with defensive JSON handling and optional schema validation.
 * Corrupt payloads, parse errors, and I/O failures never crash hydration —
 * the offending key is purged and the store falls back to its initial state.
 */
export function createSafeStorage<TState>(
  validate?: (state: unknown) => state is TState
): PersistStorageLike<TState> {
  return {
    async getItem(name) {
      let raw: string | null;
      try {
        raw = await AsyncStorage.getItem(name);
      } catch (error) {
        console.warn(`[storage] read failed for "${name}"`, error);
        return null;
      }

      if (raw == null) {
        return null;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (error) {
        console.warn(`[storage] corrupt JSON for "${name}", resetting`, error);
        await safeRemove(name);
        return null;
      }

      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !('state' in (parsed as Record<string, unknown>))
      ) {
        console.warn(`[storage] unexpected envelope for "${name}", resetting`);
        await safeRemove(name);
        return null;
      }

      const envelope = parsed as StoredEnvelope<unknown>;

      if (validate && !validate(envelope.state)) {
        console.warn(`[storage] schema validation failed for "${name}", resetting`);
        await safeRemove(name);
        return null;
      }

      return envelope as StoredEnvelope<TState>;
    },

    async setItem(name, value) {
      try {
        await AsyncStorage.setItem(name, JSON.stringify(value));
      } catch (error) {
        console.warn(`[storage] write failed for "${name}"`, error);
      }
    },

    async removeItem(name) {
      await safeRemove(name);
    },
  };
}

async function safeRemove(name: string) {
  try {
    await AsyncStorage.removeItem(name);
  } catch (error) {
    console.warn(`[storage] remove failed for "${name}"`, error);
  }
}