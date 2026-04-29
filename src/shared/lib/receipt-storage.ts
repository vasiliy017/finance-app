import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const RECEIPTS_DIR = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}transaction-receipts`
  : null;

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

export async function persistReceiptPhotoAsync(uri: string) {
  if (!RECEIPTS_DIR || Platform.OS === 'web' || isPersistedReceiptUri(uri)) {
    return uri;
  }

  await ensureReceiptsDirectory();

  const extension = getFileExtension(uri);
  const destination = `${RECEIPTS_DIR}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  await FileSystem.copyAsync({
    from: uri,
    to: destination,
  });

  return destination;
}

export async function persistReceiptPhotosAsync(uris: string[]) {
  return Promise.all(uris.map((uri) => persistReceiptPhotoAsync(uri)));
}

export async function deletePersistedReceiptPhotoAsync(uri: string) {
  if (!isPersistedReceiptUri(uri) || Platform.OS === 'web') {
    return;
  }

  const info = await FileSystem.getInfoAsync(uri);

  if (!info.exists) {
    return;
  }

  await FileSystem.deleteAsync(uri, { idempotent: true });
}

export async function deletePersistedReceiptPhotosAsync(uris: string[]) {
  await Promise.all(uris.map((uri) => deletePersistedReceiptPhotoAsync(uri)));
}