# Контракт шаблона CamelCaseTelegramCloudflareSkills

Читайте этот файл перед редактированием, первичным деплоем или изменением
переменных. Контракт относится к Astro SSR-приложению в
`CamelCaseTelegramCloudflareSkills`.

## Как найти корень

Корень проекта одновременно содержит:

- `package.json`;
- `package-lock.json`;
- `wrangler.jsonc`;
- `astro.config.mjs`;
- `src/pages/api/telegram/webhook.ts`.

Если эти файлы находятся в подпапке Git-репозитория, укажите эту подпапку как
Cloudflare **Root directory**. Если содержимое шаблона стало корнем отдельного
repo, оставьте Root directory пустой или `/`. Build output `dist` задаётся
относительно root directory.

## Инварианты

| Область | Требование |
|---|---|
| Runtime | Astro `output: 'server'` и adapter `@astrojs/cloudflare` |
| Pages build | `npm run build` |
| Output directory | `dist` |
| Production branch | `main` |
| Health | `GET /api/health` возвращает 2xx и JSON с `ok: true` |
| Telegram webhook | `POST /api/telegram/webhook` |
| Проверка Telegram | Заголовок `X-Telegram-Bot-Api-Secret-Token` обязан совпасть с runtime secret |
| Runtime secrets | `TELEGRAM_BOT_TOKEN` и `TELEGRAM_WEBHOOK_SECRET` |
| Public build value | `PUBLIC_SITE_URL` равен фактическому production HTTPS URL |
| Node | версия 20 или новее; для воспроизводимости Pages задайте `NODE_VERSION=20`, пока template не обновлён осознанно |

Первый Pages build может пройти без Telegram secrets: endpoint webhook тогда
вернёт 503. Это ожидаемое промежуточное состояние, но не готовый production.

## Согласованное переименование

Для app slug `my-telegram-bot` проверьте все места:

1. `wrangler.jsonc` → `name`;
2. `package.json` → `scripts.deploy` и `scripts.logs`;
3. `astro.config.mjs` → запасное значение `site`;
4. `.env.example` → пример `PUBLIC_SITE_URL`;
5. `README.md` → команды и примеры;
6. при желании `package.json` → `name`, сохранив npm-compatible lowercase name.

После замены выполните поиск старого `astro-telegram-bot`. Остаток допустим
только тогда, когда он намеренно описывает исходный шаблон.

## Карта переменных и секретов

| Имя | Источник | Где хранить | Куда передавать |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | @BotFather | secret manager или `.dev.vars` с mode 600, не Git | Cloudflare production Secret и процесс регистрации webhook |
| `TELEGRAM_WEBHOOK_SECRET` | `npm run secret:generate` | временный защищённый файл или `.dev.vars`, не Git | Cloudflare production Secret и `setWebhook.secret_token` |
| `PUBLIC_SITE_URL` | фактический Pages production URL | `.env` локально; значение не секретно | Cloudflare production build variable и `npm run webhook:set` |
| `NODE_VERSION` | контракт шаблона | не секрет | Cloudflare build variable, значение `20` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Tokens | owner secret manager или отдельный env-файл вне repo с mode 600 | только CLI/API агента; не runtime Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard | рядом с management-конфигурацией; это не пароль | только CLI/API агента |

При нативной Git integration `CLOUDFLARE_API_TOKEN` не нужен Cloudflare для
автосборки после push и не должен добавляться в GitHub Actions secrets.
Он создаётся по требованию владельца для дальнейших CLI/API-операций AI-агента.

Production Telegram secrets не копируйте в Preview. Preview deployment должен
либо работать без Telegram webhook, либо использовать отдельного тестового бота
по явной задаче владельца.

## Безопасная локальная подготовка

`.gitignore` должен исключать как минимум:

~~~gitignore
.env
.env.*
!.env.example
.dev.vars
.dev.vars.*
!.dev.vars.example
~~~

Перед каждым commit:

~~~bash
git status --short
git diff --check
git diff --cached
~~~

Проверьте, что staged diff не содержит token-подобных строк, значений secrets,
private key или локальных env-файлов. Нельзя считать `.gitignore` единственной
защитой: уже отслеживаемый файл продолжит попадать в commits.

Для чистой установки:

~~~bash
npm ci
npm run build
~~~

Не обновляйте зависимости автоматически только из-за предупреждения audit.
Отдельно объясните риск и выполняйте major upgrade как самостоятельную задачу.

## Готовность production

Деплой готов только если одновременно:

- Cloudflare показывает Success для commit SHA, который находится в
  `origin/main`;
- production URL открывается по HTTPS;
- `GET /api/health` возвращает 2xx и `ok: true` без cache;
- `getWebhookInfo.url` равен
  `https://<production-host>/api/telegram/webhook`;
- `getWebhookInfo` не сообщает текущую ошибку доставки;
- команды `/start` и `/ping` дают ожидаемые ответы.

Не выводите весь объект конфигурации, если инструмент может включить секретные
значения. В итоговом отчёте достаточно имён настроенных secrets.
