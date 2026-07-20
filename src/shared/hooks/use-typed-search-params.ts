import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

/**
 * Coerces a possibly-array Expo Router param to a single string (first item).
 * Returns `undefined` for missing values or empty strings.
 */
export function pickParam(value: string | string[] | undefined): string | undefined {
  if (value == null) return undefined;
  const single = Array.isArray(value) ? value[0] : value;
  return single && single.length > 0 ? single : undefined;
}

/**
 * Type-safe wrapper around `useLocalSearchParams`.
 *
 * @param keys The expected param keys. Any value (array or string) is reduced
 *             to a single string via `pickParam`. Missing keys become `undefined`.
 *
 * @example
 *   const { id, type } = useTypedSearchParams(['id', 'type'] as const);
 */
export function useTypedSearchParams<TKey extends string>(
  keys: readonly TKey[]
): Record<TKey, string | undefined> {
  const raw = useLocalSearchParams<Record<string, string | string[] | undefined>>();

  return useMemo(() => {
    const result = {} as Record<TKey, string | undefined>;
    for (const key of keys) {
      result[key] = pickParam(raw[key]);
    }
    return result;
    // Re-derive whenever any picked value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, keys.map((key) => raw[key]));
}
