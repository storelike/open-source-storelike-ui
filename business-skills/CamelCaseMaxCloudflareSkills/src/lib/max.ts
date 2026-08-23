const MAX_API_BASE = 'https://platform-api2.max.ru';

export interface MaxUser {
  user_id: number;
  first_name?: string;
  last_name?: string | null;
  username?: string | null;
  name?: string | null;
  is_bot?: boolean;
}

export interface MaxRecipient {
  chat_id?: number;
  chat_type?: 'dialog' | 'chat' | 'channel';
  user_id?: number;
}

export interface MaxMessageBody {
  mid?: string;
  text?: string | null;
  attachments?: unknown[] | null;
}

export interface MaxMessage {
  sender?: MaxUser;
  recipient: MaxRecipient;
  timestamp: number;
  body?: MaxMessageBody | null;
}

export interface MaxUpdate {
  update_type: string;
  timestamp: number;
  message?: MaxMessage;
  user?: MaxUser;
  chat_id?: number;
  callback?: {
    callback_id: string;
    payload?: string | null;
    user: MaxUser;
  };
}

interface MaxApiError {
  message?: string;
  code?: string;
}

interface MaxSubscription {
  url: string;
  update_types?: string[];
  version?: string;
}

function apiUrl(path: string, query: Record<string, string | number | undefined> = {}): string {
  const target = new URL(MAX_API_BASE + path);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) target.searchParams.set(key, String(value));
  }
  return target.toString();
}

async function callMax<T>(token: string, target: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(target, {
    ...init,
    headers: {
      'content-type': 'application/json',
      Authorization: token,
      ...init.headers,
    },
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });

  const data = (await response.json().catch(() => ({}))) as T & MaxApiError;
  if (!response.ok) {
    throw new Error(data.message ?? 'MAX API returned ' + response.status);
  }
  return data;
}

export function getBotInfo(token: string): Promise<MaxUser> {
  return callMax<MaxUser>(token, apiUrl('/me'));
}

export function subscribeWebhook(
  token: string,
  webhookUrl: string,
  secret: string,
  updateTypes = ['message_created', 'message_callback', 'bot_started'],
): Promise<{ success: boolean; message?: string }> {
  return callMax(token, apiUrl('/subscriptions'), {
    method: 'POST',
    body: JSON.stringify({
      url: webhookUrl,
      update_types: updateTypes,
      version: '1.0.0',
      secret,
    }),
  });
}

export function listSubscriptions(
  token: string,
): Promise<{ subscriptions: MaxSubscription[] }> {
  return callMax(token, apiUrl('/subscriptions'));
}

export function sendMessage(
  token: string,
  target: { chat_id?: number; user_id?: number },
  text: string,
): Promise<{ message: MaxMessage }> {
  if (target.chat_id === undefined && target.user_id === undefined) {
    return Promise.reject(new Error('MAX target requires chat_id or user_id'));
  }

  return callMax(token, apiUrl('/messages', target), {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export function answerCallback(
  token: string,
  callbackId: string,
  notification?: string,
): Promise<unknown> {
  return callMax(token, apiUrl('/answers', { callback_id: callbackId }), {
    method: 'POST',
    body: JSON.stringify(notification ? { notification } : {}),
  });
}

function updateTarget(update: MaxUpdate): { chat_id?: number; user_id?: number } {
  const chatId = update.message?.recipient.chat_id ?? update.chat_id;
  if (chatId !== undefined) return { chat_id: chatId };

  const userId =
    update.message?.sender?.user_id ??
    update.callback?.user.user_id ??
    update.user?.user_id;
  return userId === undefined ? {} : { user_id: userId };
}

function displayName(user: MaxUser | undefined): string {
  return user?.first_name ?? user?.name ?? user?.username ?? 'друг';
}

export async function handleMaxUpdate(update: MaxUpdate, token: string): Promise<void> {
  const target = updateTarget(update);
  if (target.chat_id === undefined && target.user_id === undefined) return;

  if (update.update_type === 'bot_started') {
    await sendMessage(
      token,
      target,
      'Привет, ' + displayName(update.user) + '! MAX-бот подключён и готов к разработке.',
    );
    return;
  }

  if (update.update_type === 'message_callback' && update.callback) {
    await answerCallback(token, update.callback.callback_id, 'Получено');
    return;
  }

  if (update.update_type !== 'message_created') return;

  const text = update.message?.body?.text?.trim();
  if (!text) return;

  const command = text.split(/\s+/, 1)[0]?.toLowerCase();
  if (command === '/start') {
    await sendMessage(
      token,
      target,
      'Привет, ' + displayName(update.message?.sender) + '! MAX-бот подключён и готов к разработке.',
    );
    return;
  }

  if (command === '/ping') {
    await sendMessage(token, target, 'pong');
  }
}
