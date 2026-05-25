import type { Message } from "./types.js";

const MAX_MESSAGES_PER_SESSION = 20;
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

interface Session {
  messages: Message[];
  lastAccess: number;
}

const sessions = new Map<string, Session>();

let evictionInterval: ReturnType<typeof setInterval> | null = null;

function startEviction(): void {
  if (evictionInterval) return;
  evictionInterval = setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions) {
      if (now - session.lastAccess > SESSION_TTL_MS) {
        sessions.delete(id);
      }
    }
  }, 5 * 60 * 1000); // check every 5 minutes
  evictionInterval.unref();
}

export function addMessage(sessionId: string, message: Message): void {
  startEviction();

  let session = sessions.get(sessionId);
  if (!session) {
    session = { messages: [], lastAccess: Date.now() };
    sessions.set(sessionId, session);
  }

  session.messages.push(message);
  session.lastAccess = Date.now();

  if (session.messages.length > MAX_MESSAGES_PER_SESSION) {
    session.messages = session.messages.slice(-MAX_MESSAGES_PER_SESSION);
  }
}

export function getHistory(sessionId: string): Message[] {
  const session = sessions.get(sessionId);
  if (!session) return [];
  session.lastAccess = Date.now();
  return [...session.messages];
}

export function getMessagesForLlm(sessionId: string): Message[] {
  return getHistory(sessionId);
}
