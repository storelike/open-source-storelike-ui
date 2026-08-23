const TELEGRAM_API_BASE = 'https://api.telegram.org';

export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
}

async function callTelegram<T>(
  token: string,
  method: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as TelegramResponse<T>;
  if (!response.ok || !data.ok || data.result === undefined) {
    throw new Error(data.description ?? `Telegram API returned ${response.status}`);
  }

  return data.result;
}

export function sendMessage(token: string, chatId: number, text: string): Promise<TelegramMessage> {
  return callTelegram<TelegramMessage>(token, 'sendMessage', {
    chat_id: chatId,
    text,
  });
}

export async function handleTelegramUpdate(update: TelegramUpdate, token: string): Promise<void> {
  const message = update.message;
  const text = message?.text?.trim();

  if (!message || !text) return;

  const command = text.split(/\s+/, 1)[0]?.split('@', 1)[0]?.toLowerCase();

  if (command === '/start') {
    const name = message.from?.first_name ?? 'друг';
    await sendMessage(token, message.chat.id, `Привет, ${name}! Бот подключён и готов к разработке.`);
    return;
  }

  if (command === '/ping') {
    await sendMessage(token, message.chat.id, 'pong');
  }
}
