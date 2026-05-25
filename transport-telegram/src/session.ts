interface Session {
  authToken: string;
  expiresAt: number;
}

const sessions = new Map<number, Session>();

export function getSession(chatId: number): Session | null {
  const session = sessions.get(chatId);

  if (!session) {
    return null;
  }

  if (Date.now() > session.expiresAt) {
    sessions.delete(chatId);
    return null;
  }

  return session;
}

export function setSession(
  chatId: number,
  authToken: string,
  ttlMs: number = 24 * 60 * 60 * 1000
): void {
  sessions.set(chatId, {
    authToken,
    expiresAt: Date.now() + ttlMs,
  });
}

export function clearSession(chatId: number): void {
  sessions.delete(chatId);
}
