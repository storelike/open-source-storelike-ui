# Astro Telegram Bot · Cloudflare Pages

Минимальный шаблон Telegram-бота на Astro 5. Webhook работает как SSR endpoint в Cloudflare Pages Functions. Внутри уже есть:

- проверка заголовка `X-Telegram-Bot-Api-Secret-Token`;
- команды `/start` и `/ping`;
- health-check `GET /api/health`;
- Tailwind CSS 4;
- конфигурация Wrangler для Cloudflare Pages;
- CLI-скрипты для генерации секрета и регистрации webhook.

## Локальный запуск

Нужен Node.js 20 или новее.

```bash
npm install
cp .env.example .env
cp .dev.vars.example .dev.vars
npm run secret:generate
```

Создайте бота через [@BotFather](https://t.me/BotFather). В `.dev.vars` укажите токен бота и сгенерированный секрет:

```dotenv
TELEGRAM_BOT_TOKEN=123456789:replace_me
TELEGRAM_WEBHOOK_SECRET=replace_me
```

Запустите Astro:

```bash
npm run dev
```

Telegram не сможет обратиться к `localhost`. Для настоящего webhook используйте опубликованный Pages URL или HTTPS-туннель.

## Деплой в Cloudflare Pages

При необходимости измените имя `astro-telegram-bot` одновременно в `wrangler.jsonc` и scripts внутри `package.json`.

```bash
npx wrangler login
npm run deploy
npx wrangler pages secret put TELEGRAM_BOT_TOKEN --project-name astro-telegram-bot
npx wrangler pages secret put TELEGRAM_WEBHOOK_SECRET --project-name astro-telegram-bot
```

Для Git-деплоя в Cloudflare Pages используйте:

- build command: `npm run build`;
- output directory: `dist`;
- Node.js: `20` или новее;
- runtime secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`.

## Регистрация Telegram webhook

После деплоя экспортируйте те же значения только в текущую shell-сессию и зарегистрируйте URL:

```bash
export PUBLIC_SITE_URL=https://astro-telegram-bot.pages.dev
export TELEGRAM_BOT_TOKEN='токен_от_BotFather'
export TELEGRAM_WEBHOOK_SECRET='ваш_секрет'
npm run webhook:set
```

Проверить логи Pages:

```bash
npm run logs
```

Основная логика бота находится в `src/lib/telegram.ts`, а HTTP webhook — в `src/pages/api/telegram/webhook.ts`.

## Почему Vite зафиксирован

`overrides.vite` намеренно оставлен на версии 6.4.3. Она совместима и с Astro 5, и с Tailwind 4.1.18; без фиксации свежая установка Tailwind может выбрать Vite другого major и сломать TypeScript-проверку конфигурации.

Astro 5 выбран по требованию шаблона. На новых датах `npm audit` может показывать advisories, исправленные только в следующих major Astro и Cloudflare adapter. Перед production-запуском оцените переход на актуальный major отдельно.
