import type { APIRoute } from 'astro';
import { handleMaxUpdate, type MaxUpdate } from '@/lib/max';

export const prerender = false;

const MAX_BODY_BYTES = 1024 * 1024;

function isMaxUpdate(value: unknown): value is MaxUpdate {
  if (typeof value !== 'object' || value === null) return false;
  const update = value as { update_type?: unknown; timestamp?: unknown };
  return typeof update.update_type === 'string' && typeof update.timestamp === 'number';
}

function constantTimeEqual(left: string, right: string): boolean {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  const length = Math.max(a.length, b.length);
  let mismatch = a.length ^ b.length;

  for (let index = 0; index < length; index += 1) {
    mismatch |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }
  return mismatch === 0;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const { MAX_BOT_TOKEN, MAX_WEBHOOK_SECRET } = locals.runtime.env;

  if (!MAX_BOT_TOKEN || !MAX_WEBHOOK_SECRET) {
    console.error('MAX runtime secrets are not configured');
    return new Response('Service Unavailable', { status: 503 });
  }

  const incomingSecret = request.headers.get('x-max-bot-api-secret');
  if (!incomingSecret || !constantTimeEqual(incomingSecret, MAX_WEBHOOK_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return new Response('Payload Too Large', { status: 413 });
  }

  let update: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return new Response('Payload Too Large', { status: 413 });
    }
    update = JSON.parse(rawBody);
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  if (!isMaxUpdate(update)) {
    return new Response('Bad Request', { status: 400 });
  }

  try {
    await handleMaxUpdate(update, MAX_BOT_TOKEN);
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('MAX update failed', error);
    return new Response('Bad Gateway', { status: 502 });
  }
};
