import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = () => {
  return Response.json(
    {
      ok: true,
      service: 'astro-telegram-bot',
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'cache-control': 'no-store',
      },
    },
  );
};
