const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const siteUrl = process.env.PUBLIC_SITE_URL;

if (!token || !secret || !siteUrl) {
  console.error('Set TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET and PUBLIC_SITE_URL first.');
  process.exit(1);
}

if (!/^[A-Za-z0-9_-]{1,256}$/.test(secret)) {
  console.error('TELEGRAM_WEBHOOK_SECRET may contain only A-Z, a-z, 0-9, _ and - (up to 256 characters).');
  process.exit(1);
}

let webhookUrl;
try {
  webhookUrl = new URL('/api/telegram/webhook', siteUrl).toString();
} catch {
  console.error('PUBLIC_SITE_URL must be an absolute HTTPS URL.');
  process.exit(1);
}

if (!webhookUrl.startsWith('https://')) {
  console.error('Telegram requires an HTTPS webhook URL.');
  process.exit(1);
}

const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    url: webhookUrl,
    secret_token: secret,
    allowed_updates: ['message'],
  }),
  signal: AbortSignal.timeout(15_000),
});

const result = await response.json();
if (!response.ok || !result.ok) {
  console.error(result.description ?? `Telegram API returned ${response.status}`);
  process.exit(1);
}

console.log(`Webhook registered: ${webhookUrl}`);
