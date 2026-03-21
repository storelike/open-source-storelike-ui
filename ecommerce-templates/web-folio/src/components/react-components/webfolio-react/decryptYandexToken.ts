// ~/utils/decryptYandexToken.ts
import { KEY_FOR_ENCRYPTION } from 'cms-get-data/constants';

const te = new TextEncoder();
const td = new TextDecoder();

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array) {
  const base = await crypto.subtle.importKey('raw', te.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    //@ts-ignore
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

export function normalizeEncryptedValue(raw: unknown): any {
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

export async function decryptYandexToken(payloadRaw: any, passphrase: string = KEY_FOR_ENCRYPTION): Promise<string> {
  if (typeof window === 'undefined') throw new Error('decrypt only in browser');

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
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return td.decode(decrypted);
  } catch (err: any) {
    const details = err?.message || err?.name || JSON.stringify(err, Object.getOwnPropertyNames(err));
    throw new Error(`Ошибка расшифровки токена: ${details}`);
  }
}
