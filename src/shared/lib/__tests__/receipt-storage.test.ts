import * as FileSystem from 'expo-file-system/legacy';

import {
    ReceiptStorageError,
    deletePersistedReceiptPhotoAsync,
    deletePersistedReceiptPhotosAsync,
    isPersistedReceiptUri,
    persistReceiptPhotoAsync,
    persistReceiptPhotosAsync,
} from '../receipt-storage';

const RECEIPTS_DIR = 'file:///mock-documents/transaction-receipts';

const mockedFS = FileSystem as jest.Mocked<typeof FileSystem>;

function setInfo(returns: Partial<FileSystem.FileInfo>) {
  mockedFS.getInfoAsync.mockResolvedValueOnce({
    exists: true,
    isDirectory: false,
    size: 1024,
    uri: 'mock',
    ...returns,
  } as FileSystem.FileInfo);
}

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('isPersistedReceiptUri', () => {
  test('true when uri lives inside the receipts directory', () => {
    expect(isPersistedReceiptUri(`${RECEIPTS_DIR}/123.jpg`)).toBe(true);
  });

  test('false for arbitrary uris', () => {
    expect(isPersistedReceiptUri('file:///tmp/photo.jpg')).toBe(false);
    expect(isPersistedReceiptUri('content://media/external/images/1')).toBe(false);
  });
});

describe('persistReceiptPhotoAsync', () => {
  test('returns uri unchanged when it is already persisted', async () => {
    const persisted = `${RECEIPTS_DIR}/already.jpg`;
    const result = await persistReceiptPhotoAsync(persisted);
    expect(result).toBe(persisted);
    expect(mockedFS.copyAsync).not.toHaveBeenCalled();
  });

  test('throws UNSUPPORTED_TYPE for disallowed extensions', async () => {
    await expect(persistReceiptPhotoAsync('file:///tmp/foo.txt')).rejects.toMatchObject({
      code: 'UNSUPPORTED_TYPE',
    });
  });

  test('throws NOT_FOUND when source does not exist', async () => {
    setInfo({ exists: false });
    await expect(persistReceiptPhotoAsync('file:///tmp/missing.jpg')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  test('throws TOO_LARGE when source exceeds 5 MB', async () => {
    setInfo({ exists: true, size: 6 * 1024 * 1024 });
    await expect(persistReceiptPhotoAsync('file:///tmp/big.jpg')).rejects.toMatchObject({
      code: 'TOO_LARGE',
    });
  });

  test('throws IO when getInfoAsync rejects', async () => {
    mockedFS.getInfoAsync.mockRejectedValueOnce(new Error('disk gone'));
    await expect(persistReceiptPhotoAsync('file:///tmp/photo.jpg')).rejects.toMatchObject({
      code: 'IO',
    });
  });

  test('throws IO when copyAsync rejects', async () => {
    setInfo({ exists: true, size: 1024 }); // source info
    setInfo({ exists: true, isDirectory: true }); // directory check
    mockedFS.copyAsync.mockRejectedValueOnce(new Error('copy boom'));

    await expect(persistReceiptPhotoAsync('file:///tmp/photo.jpg')).rejects.toMatchObject({
      code: 'IO',
    });
  });

  test('copies file and returns destination uri in receipts dir', async () => {
    setInfo({ exists: true, size: 1024 }); // source info
    setInfo({ exists: true, isDirectory: true }); // directory check (no makeDirectory)

    const result = await persistReceiptPhotoAsync('file:///tmp/photo.jpg');

    expect(result.startsWith(`${RECEIPTS_DIR}/`)).toBe(true);
    expect(result.endsWith('.jpg')).toBe(true);
    expect(mockedFS.copyAsync).toHaveBeenCalledTimes(1);
    expect(mockedFS.makeDirectoryAsync).not.toHaveBeenCalled();
  });

  test('creates receipts dir when it is missing', async () => {
    setInfo({ exists: true, size: 1024 });
    setInfo({ exists: false });

    await persistReceiptPhotoAsync('file:///tmp/photo.png');

    expect(mockedFS.makeDirectoryAsync).toHaveBeenCalledWith(
      RECEIPTS_DIR,
      { intermediates: true }
    );
  });
});

describe('persistReceiptPhotosAsync', () => {
  test('returns destinations for every uri on success', async () => {
    // 2 sources × (source info + dir check) = 4 getInfo calls
    setInfo({ exists: true, size: 1024 });
    setInfo({ exists: true, isDirectory: true });
    setInfo({ exists: true, size: 1024 });
    setInfo({ exists: true, isDirectory: true });

    const result = await persistReceiptPhotosAsync([
      'file:///tmp/a.jpg',
      'file:///tmp/b.png',
    ]);

    expect(result).toHaveLength(2);
    expect(result.every((uri) => uri.startsWith(`${RECEIPTS_DIR}/`))).toBe(true);
  });

  test('rolls back previously copied files when a later one fails', async () => {
    // 1st succeeds (source info + dir check + copy)
    setInfo({ exists: true, size: 1024 });
    setInfo({ exists: true, isDirectory: true });
    // 2nd fails on source info
    mockedFS.getInfoAsync.mockRejectedValueOnce(new Error('boom'));

    await expect(
      persistReceiptPhotosAsync(['file:///tmp/a.jpg', 'file:///tmp/b.jpg'])
    ).rejects.toBeInstanceOf(ReceiptStorageError);

    // The successfully-copied first file should have been deleted in rollback.
    expect(mockedFS.deleteAsync).toHaveBeenCalledTimes(1);
    const deletedUri = mockedFS.deleteAsync.mock.calls[0]![0] as string;
    expect(deletedUri.startsWith(`${RECEIPTS_DIR}/`)).toBe(true);
  });

  test('does not delete pass-through (already-persisted) uris on rollback', async () => {
    const alreadyPersisted = `${RECEIPTS_DIR}/old.jpg`;
    // 1st is already persisted → pass-through, no FS calls
    // 2nd fails on extension
    await expect(
      persistReceiptPhotosAsync([alreadyPersisted, 'file:///tmp/bad.txt'])
    ).rejects.toMatchObject({ code: 'UNSUPPORTED_TYPE' });

    expect(mockedFS.deleteAsync).not.toHaveBeenCalled();
  });
});

describe('deletePersistedReceiptPhotoAsync', () => {
  test('deletes when uri is persisted', async () => {
    await deletePersistedReceiptPhotoAsync(`${RECEIPTS_DIR}/x.jpg`);
    expect(mockedFS.deleteAsync).toHaveBeenCalledWith(
      `${RECEIPTS_DIR}/x.jpg`,
      { idempotent: true }
    );
  });

  test('no-op for non-persisted uris', async () => {
    await deletePersistedReceiptPhotoAsync('file:///tmp/not-mine.jpg');
    expect(mockedFS.deleteAsync).not.toHaveBeenCalled();
  });

  test('swallows delete failures', async () => {
    mockedFS.deleteAsync.mockRejectedValueOnce(new Error('locked'));
    await expect(
      deletePersistedReceiptPhotoAsync(`${RECEIPTS_DIR}/y.jpg`)
    ).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });
});

describe('deletePersistedReceiptPhotosAsync', () => {
  test('fans out to delete every uri without throwing on individual failures', async () => {
    mockedFS.deleteAsync
      .mockRejectedValueOnce(new Error('one'))
      .mockResolvedValueOnce(undefined);

    await expect(
      deletePersistedReceiptPhotosAsync([
        `${RECEIPTS_DIR}/a.jpg`,
        `${RECEIPTS_DIR}/b.jpg`,
      ])
    ).resolves.toBeUndefined();
  });
});
