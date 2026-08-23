const MAX_API_BASE = 'https://platform-api2.max.ru';
const token = process.env.MAX_BOT_TOKEN;
const secret = process.env.MAX_WEBHOOK_SECRET;
const siteUrl = process.env.PUBLIC_SITE_URL;

if (!token || !secret || !siteUrl) {
  console.error('Set MAX_BOT_TOKEN, MAX_WEBHOOK_SECRET and PUBLIC_SITE_URL first.');
  process.exit(1);
}

if (!/^[A-Za-z0-9_-]{5,256}$/.test(secret)) {
  console.error('MAX_WEBHOOK_SECRET must match [A-Za-z0-9_-] and contain 5-256 characters.');
  process.exit(1);
}

let webhookUrl;
try {
  webhookUrl = new URL('/api/max/webhook', siteUrl).toString();
} catch {
  console.error('PUBLIC_SITE_URL must be an absolute HTTPS URL.');
  process.exit(1);
}

if (!webhookUrl.startsWith('https://')) {
  console.error('MAX requires an HTTPS webhook URL.');
  process.exit(1);
}

try {
  const response = await fetch(MAX_API_BASE + '/subscriptions', {
    method: 'POST',
    headers: {
      Authorization: token,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      url: webhookUrl,
      update_types: ['message_created', 'message_callback', 'bot_started'],
      version: '1.0.0',
      secret,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success !== true) {
    throw new Error(result.message ?? 'MAX API returned ' + response.status);
  }
  console.log('MAX webhook subscription registered: ' + webhookUrl);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
