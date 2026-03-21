// ~/utils/decryptYandexTokenServer.ts
import { webcrypto } from 'node:crypto'; // Используем webcrypto для работы на сервере
import { KEY_FOR_ENCRYPTION } from 'cms-get-data/constants'; // Ваш ключ

// Определяем, какую реализацию crypto использовать (Node.js или браузерную)
const cryptoInstance = typeof window !== 'undefined' ? window.crypto : webcrypto; 

const te = new TextEncoder();
const td = new TextDecoder();

function b64ToBytes(b64: string): Uint8Array {
  // node:buffer's Buffer is more reliable than atob in node/Astro environment
  const buffer = Buffer.from(b64.trim(), 'base64');
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
}

async function deriveKey(passphrase: string, salt: Uint8Array) {
  const base = await cryptoInstance.subtle.importKey('raw', te.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return cryptoInstance.subtle.deriveKey(
    //@ts-ignore
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

function normalizeEncryptedValue(raw: unknown): any {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw;
}

// ЭТА ФУНКЦИЯ ПРЕДНАЗНАЧЕНА ДЛЯ СЕРВЕРА (Astro API)
export async function decryptYandexTokenServer(payloadRaw: any, passphrase: string = KEY_FOR_ENCRYPTION): Promise<string> {
    
    // !!! УДАЛЕНА ПРОВЕРКА 'decrypt only in browser' !!!

    const payload = normalizeEncryptedValue(payloadRaw);
    if (!payload?.data || !payload?.iv || !payload?.salt) {
      throw new Error('Неверный формат данных токена (нужны salt, iv, data)');
    }

    const keyStr = (passphrase ?? '').trim();
    if (!keyStr) throw new Error('Ключ шифрования (KEY_FOR_ENCRYPTION) отсутствует');

    try {
      const salt = b64ToBytes(payload.salt);
      const iv = b64ToBytes(payload.iv);
      const data = b64ToBytes(payload.data);

      const key = await deriveKey(keyStr, salt);
      //@ts-ignore
      const decrypted = await cryptoInstance.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
      return td.decode(decrypted);
    } catch (err: any) {
      const details = err?.message || err?.name || JSON.stringify(err, Object.getOwnPropertyNames(err));
      throw new Error(`Ошибка расшифровки токена: ${details}`);
    }
}