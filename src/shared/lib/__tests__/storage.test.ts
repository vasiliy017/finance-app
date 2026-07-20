import AsyncStorage from '@react-native-async-storage/async-storage';

import { createSafeStorage } from '../storage';

type State = { count: number };
const isState = (value: unknown): value is State =>
  !!value && typeof value === 'object' && typeof (value as State).count === 'number';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('createSafeStorage', () => {
  test('writes and reads a valid envelope', async () => {
    const storage = createSafeStorage<State>(isState);
    await storage.setItem('key', { state: { count: 7 }, version: 1 });
    const read = await storage.getItem('key');
    expect(read).toEqual({ state: { count: 7 }, version: 1 });
  });

  test('returns null when no value is stored', async () => {
    const storage = createSafeStorage<State>();
    expect(await storage.getItem('missing')).toBeNull();
  });

  test('purges and returns null when JSON is corrupt', async () => {
    await AsyncStorage.setItem('key', '{not valid json');
    const storage = createSafeStorage<State>();

    const result = await storage.getItem('key');

    expect(result).toBeNull();
    expect(await AsyncStorage.getItem('key')).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });

  test('purges and returns null when envelope is missing .state', async () => {
    await AsyncStorage.setItem('key', JSON.stringify({ unrelated: true }));
    const storage = createSafeStorage<State>();

    const result = await storage.getItem('key');

    expect(result).toBeNull();
    expect(await AsyncStorage.getItem('key')).toBeNull();
  });

  test('purges when validator rejects the payload', async () => {
    await AsyncStorage.setItem('key', JSON.stringify({ state: { count: 'oops' } }));
    const storage = createSafeStorage<State>(isState);

    const result = await storage.getItem('key');

    expect(result).toBeNull();
    expect(await AsyncStorage.getItem('key')).toBeNull();
  });

  test('returns null and warns when AsyncStorage.getItem throws', async () => {
    const spy = jest
      .spyOn(AsyncStorage, 'getItem')
      .mockRejectedValueOnce(new Error('disk full'));

    const storage = createSafeStorage<State>();
    const result = await storage.getItem('key');

    expect(result).toBeNull();
    expect(spy).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
  });

  test('swallows write errors without throwing', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('write boom'));
    const storage = createSafeStorage<State>();

    await expect(
      storage.setItem('key', { state: { count: 1 } })
    ).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });

  test('removeItem delegates to AsyncStorage', async () => {
    await AsyncStorage.setItem('key', JSON.stringify({ state: { count: 1 } }));
    const storage = createSafeStorage<State>();

    await storage.removeItem('key');

    expect(await AsyncStorage.getItem('key')).toBeNull();
  });
});
