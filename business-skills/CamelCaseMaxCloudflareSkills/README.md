# Astro MAX Bot · Cloudflare Pages

Минимальный шаблон MAX-бота на Astro 5. Бот работает через MAX Bot API и
HTTPS Webhook в Cloudflare Pages Functions.

В шаблоне есть:

- API-клиент на `https://platform-api2.max.ru`;
- обязательная проверка `X-Max-Bot-Api-Secret`;
- hooks `bot_started`, `message_created` и `message_callback`;
- команды `/start` и `/ping`;
- `GET /api/health`;
- scripts для регистрации и проверки webhook-подписки;
- skill для GitHub → Cloudflare Pages → MAX.

## Локальная подготовка

Нужен Node.js 20 или новее.

~~~bash
npm ci
cp .env.example .env
cp .dev.vars.example .dev.vars
npm run secret:generate
~~~

`MAX_BOT_TOKEN` выдаётся после создания и модерации бота в MAX для бизнеса.
Секрет webhook должен соответствовать `[A-Za-z0-9_-]{5,256}`.

~~~dotenv
MAX_BOT_TOKEN=
MAX_WEBHOOK_SECRET=
~~~

Файлы `.env` и `.dev.vars` не коммитятся.

## Cloudflare Pages

Для Git integration:

- production branch: `main`;
- build command: `npm run build`;
- output directory: `dist`;
- Node.js: `20` или новее;
- production Secrets: `MAX_BOT_TOKEN`, `MAX_WEBHOOK_SECRET`;
- production Variable: `PUBLIC_SITE_URL`.

После первого deploy зарегистрируйте подписку:

~~~bash
# MAX_BOT_TOKEN и MAX_WEBHOOK_SECRET заранее загрузите из secret manager
# в окружение текущего процесса без вывода их значений.
export PUBLIC_SITE_URL=https://astro-max-bot.pages.dev
npm run subscription:set
npm run subscription:info
~~~

Webhook: `POST /api/max/webhook`. MAX должен получить HTTP 200 не позднее
30 секунд.

## Основные файлы

- `src/lib/max.ts` — клиент MAX API и обработчики событий;
- `src/pages/api/max/webhook.ts` — защищённый webhook;
- `scripts/set-subscription.mjs` — `POST /subscriptions`;
- `scripts/subscription-info.mjs` — проверка `GET /me` и `GET /subscriptions`;
- `SKILL.md` — порядок работы AI-агента.

Официальная документация:

- https://dev.max.ru/docs-api
- https://dev.max.ru/docs-api/methods/POST/subscriptions
- https://dev.max.ru/help/chatbots

## Зафиксированные версии

Шаблон сохраняет Astro 5 и Vite 6.4.3, как соседний Telegram-шаблон. На новых
датах `npm audit` может показывать advisories, исправленные только в следующих
major Astro/Cloudflare adapter. Не запускайте `npm audit fix --force` без
отдельной проверки миграции и повторного runtime-теста webhook.
