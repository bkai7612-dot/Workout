import * as SecureStore from 'expo-secure-store';

/**
 * expo-secure-store values are limited to ~2KB on some platforms. Supabase
 * sessions (and an in-progress workout) can exceed that, so values are split
 * into chunks and stored under `<key>.0`, `<key>.1`, … with a chunk count
 * stored under `<key>.n`.
 */
const CHUNK_SIZE = 1800;

const sanitize = (key: string) => key.replace(/[^\w.-]/g, '_');

async function removeChunks(key: string) {
  const countRaw = await SecureStore.getItemAsync(`${key}.n`);
  const count = countRaw ? parseInt(countRaw, 10) : 0;
  for (let i = 0; i < count; i++) {
    await SecureStore.deleteItemAsync(`${key}.${i}`);
  }
  await SecureStore.deleteItemAsync(`${key}.n`);
}

export const chunkedSecureStorage = {
  async getItem(rawKey: string): Promise<string | null> {
    const key = sanitize(rawKey);
    const countRaw = await SecureStore.getItemAsync(`${key}.n`);
    if (!countRaw) return null;
    const count = parseInt(countRaw, 10);
    let value = '';
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`);
      if (part == null) return null;
      value += part;
    }
    return value;
  },
  async setItem(rawKey: string, value: string): Promise<void> {
    const key = sanitize(rawKey);
    await removeChunks(key);
    const chunks = Math.max(1, Math.ceil(value.length / CHUNK_SIZE));
    for (let i = 0; i < chunks; i++) {
      await SecureStore.setItemAsync(`${key}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(`${key}.n`, String(chunks));
  },
  async removeItem(rawKey: string): Promise<void> {
    await removeChunks(sanitize(rawKey));
  },
};
