import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const RECEIPTS_DIR = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}transaction-receipts`
  : null;

export const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'gif']);

export class ReceiptStorageError extends Error {
  readonly code: 'TOO_LARGE' | 'UNSUPPORTED_TYPE' | 'NOT_FOUND' | 'IO';

  constructor(code: ReceiptStorageError['code'], message: string) {
    super(message);
    this.name = 'ReceiptStorageError';
    this.code = code;
  }
}

function getFileExtension(uri: string) {
  const cleanUri = uri.split('?')[0] ?? uri;
  const extension = cleanUri.split('.').pop()?.toLowerCase();

  if (!extension || extension.length > 5) {
    return 'jpg';
  }

  return extension;
}

async function ensureReceiptsDirectory() {
  if (!RECEIPTS_DIR || Platform.OS === 'web') {
    return;
  }

  const info = await FileSystem.getInfoAsync(RECEIPTS_DIR);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(RECEIPTS_DIR, { intermediates: true });
  }
}

export function isPersistedReceiptUri(uri: string) {
  return !!RECEIPTS_DIR && uri.startsWith(RECEIPTS_DIR);
}

export async function persistReceiptPhotoAsync(uri: string): Promise<string> {
  if (!RECEIPTS_DIR || Platform.OS === 'web' || isPersistedReceiptUri(uri)) {
    return uri;
  }

  const extension = getFileExtension(uri);

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new ReceiptStorageError('UNSUPPORTED_TYPE', `Unsupported image type: .${extension}`);
  }

  let sourceInfo: FileSystem.FileInfo;
  try {
    sourceInfo = await FileSystem.getInfoAsync(uri);
  } catch (error) {
    throw new ReceiptStorageError('IO', `Unable to read source image: ${describeError(error)}`);
  }

  if (!sourceInfo.exists) {
    throw new ReceiptStorageError('NOT_FOUND', 'Selected image is no longer available.');
  }

  if (typeof sourceInfo.size === 'number' && sourceInfo.size > MAX_RECEIPT_SIZE_BYTES) {
    throw new ReceiptStorageError(
      'TOO_LARGE',
      `Image exceeds the ${Math.round(MAX_RECEIPT_SIZE_BYTES / (1024 * 1024))} MB limit.`
    );
  }

  try {
    await ensureReceiptsDirectory();
  } catch (error) {
    throw new ReceiptStorageError('IO', `Unable to prepare storage: ${describeError(error)}`);
  }

  const destination = `${RECEIPTS_DIR}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  try {
    await FileSystem.copyAsync({ from: uri, to: destination });
  } catch (error) {
    throw new ReceiptStorageError('IO', `Unable to save image: ${describeError(error)}`);
  }

  return destination;
}

/**
 * Persists every URI atomically: if any item fails, already-copied destinations
 * are rolled back so we never leave orphaned files on disk. Pass-through URIs
 * (already persisted, or web) are never deleted on rollback.
 */
export async function persistReceiptPhotosAsync(uris: string[]): Promise<string[]> {
  const persisted: { source: string; destination: string }[] = [];

  try {
    for (const uri of uris) {
      const destination = await persistReceiptPhotoAsync(uri);
      persisted.push({ source: uri, destination });
    }

    return persisted.map((entry) => entry.destination);
  } catch (error) {
    await Promise.allSettled(
      persisted
        .filter((entry) => entry.destination !== entry.source)
        .map((entry) => deletePersistedReceiptPhotoAsync(entry.destination))
    );
    throw error;
  }
}

export async function deletePersistedReceiptPhotoAsync(uri: string) {
  if (!isPersistedReceiptUri(uri) || Platform.OS === 'web') {
    return;
  }

  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    // Orphan files are non-fatal; never surface to the caller.
    console.warn('[receipt-storage] failed to delete', uri, error);
  }
}

export async function deletePersistedReceiptPhotosAsync(uris: string[]) {
  await Promise.allSettled(uris.map((uri) => deletePersistedReceiptPhotoAsync(uri)));
}

function describeError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}