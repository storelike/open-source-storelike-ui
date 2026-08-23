import type { APIRoute } from 'astro';
import { handleTelegramUpdate, type TelegramUpdate } from '@/lib/telegram';

export const prerender = false;

function isTelegramUpdate(value: unknown): value is TelegramUpdate {
  if (typeof value !== 'object' || value === null) return false;
  return typeof (value as { update_id?: unknown }).update_id === 'number';
}

export const POST: APIRoute = async ({ request, locals }) => {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET } = locals.runtime.env;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_WEBHOOK_SECRET) {
    console.error('Telegram runtime secrets are not configured');
    return Response.json({ ok: false }, { status: 503 });
  }

  const incomingSecret = request.headers.get('x-telegram-bot-api-secret-token');
  if (incomingSecret !== TELEGRAM_WEBHOOK_SECRET) {
    return Response.json({ ok: false }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (!isTelegramUpdate(body)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  try {
    await handleTelegramUpdate(body, TELEGRAM_BOT_TOKEN);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Telegram update failed', error);
    return Response.json({ ok: false }, { status: 502 });
  }
};
