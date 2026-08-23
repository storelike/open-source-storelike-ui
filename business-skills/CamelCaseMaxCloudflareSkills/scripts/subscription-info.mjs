const MAX_API_BASE = 'https://platform-api2.max.ru';
const token = process.env.MAX_BOT_TOKEN;

if (!token) {
  console.error('Set MAX_BOT_TOKEN first.');
  process.exit(1);
}

async function get(path) {
  const response = await fetch(MAX_API_BASE + path, {
    headers: { Authorization: token },
    signal: AbortSignal.timeout(15_000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? 'MAX API returned ' + response.status);
  }
  return data;
}

try {
  const [bot, result] = await Promise.all([get('/me'), get('/subscriptions')]);
  const subscriptions = Array.isArray(result.subscriptions) ? result.subscriptions : [];
  console.log(
    JSON.stringify(
      {
        bot: {
          user_id: bot.user_id,
          username: bot.username ?? null,
          name: bot.first_name ?? bot.name ?? null,
        },
        subscriptions: subscriptions.map(({ url, update_types, version }) => ({
          url,
          update_types: update_types ?? [],
          version: version ?? null,
        })),
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
