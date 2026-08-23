# Контракт MAX API и шаблона

Читайте перед изменением MAX hooks, переменных, API-клиента или Cloudflare
конфигурации.

## Источник реализации

Принцип работы выделен из действующего проекта
`vm100:~/DeVubilav/threads-assistant`:

- API-клиент;
- webhook-подписка;
- извлечение sender/recipient;
- обработка `message_created`, `message_callback` и `bot_started`;
- отправка сообщений через `chat_id` или `user_id`.

Бизнес-воронка, D1, заявки, операторы, каналы, скидки и mini app намеренно не
перенесены в базовый шаблон.

Удалённый пример использует `platform-api.max.ru`. Актуальная официальная
документация требует `platform-api2.max.ru`, поэтому новый шаблон использует
только второй домен.

## HTTP-контракт

| Назначение | Метод |
|---|---|
| Проверить token | `GET https://platform-api2.max.ru/me` |
| Создать webhook-подписку | `POST /subscriptions` |
| Посмотреть подписки | `GET /subscriptions` |
| Удалить подписку | `DELETE /subscriptions?url=<url>` |
| Отправить сообщение | `POST /messages?chat_id=<id>` или `?user_id=<id>` |
| Ответить на callback | `POST /answers?callback_id=<id>` |

Для всех вызовов MAX API token передаётся ровно так:

~~~http
Authorization: <MAX_BOT_TOKEN>
~~~

Не добавляйте `Bearer` и не используйте устаревший `access_token` в query.

## Webhook

Подписка создаётся с телом:

~~~json
{
  "url": "https://<host>/api/max/webhook",
  "update_types": ["message_created", "message_callback", "bot_started"],
  "version": "1.0.0",
  "secret": "<MAX_WEBHOOK_SECRET>"
}
~~~

MAX возвращает updates HTTPS POST-запросами и передаёт secret в заголовке:

~~~http
X-Max-Bot-Api-Secret: <MAX_WEBHOOK_SECRET>
~~~

Endpoint обязан отклонять и отсутствующий, и неверный заголовок. Не используйте
secret в URL. Секрет должен соответствовать `^[A-Za-z0-9_-]{5,256}$`.

MAX ожидает HTTP 200 в течение 30 секунд. При ошибках доставка повторяется; если
успешного ответа нет около восьми часов, платформа может автоматически удалить
подписку. Ошибки обработки должны попадать в Cloudflare logs без raw body и
значений secrets.

## Основные события

### `message_created`

Текст находится в `update.message.body.text`, отправитель — в
`update.message.sender`, чат — в `update.message.recipient.chat_id`. Для ответа
предпочитайте `chat_id`; если его нет, используйте `sender.user_id`.

### `bot_started`

Пользователь находится в `update.user`. Это MAX-аналог начала диалога с ботом.

### `message_callback`

Callback ID находится в `update.callback.callback_id`, payload — в
`update.callback.payload`, пользователь — в `update.callback.user`. После
нажатия отвечайте через `POST /answers`, даже если callback не меняет сообщение.

Не предполагайте, что все будущие event types имеют поле `message`. Неизвестный
корректный update следует подтвердить HTTP 200 и пропустить.

## Переменные

| Имя | Тип | Назначение | Где хранить |
|---|---|---|---|
| `MAX_BOT_TOKEN` | Secret | Авторизация MAX API | Cloudflare Production Secret; локально `.dev.vars` |
| `MAX_WEBHOOK_SECRET` | Secret | Проверка `X-Max-Bot-Api-Secret` | Cloudflare Production Secret; то же значение в `POST /subscriptions` |
| `PUBLIC_SITE_URL` | Variable | Фактический production HTTPS URL | Cloudflare Production Variable и локальный `.env` |
| `NODE_VERSION` | Variable | Версия build runtime | Cloudflare build variable, `20` |
| `CLOUDFLARE_API_TOKEN` | Management Secret | Управление Pages из CLI/API | Только secret manager владельца вне repo |
| `CLOUDFLARE_ACCOUNT_ID` | Management config | Cloudflare account | Вне runtime приложения |

Production MAX secrets не передавайте Preview deployments. Для preview нужен
отдельный тестовый бот и отдельная подписка по явной задаче владельца.

## Файлы шаблона

| Путь | Ответственность |
|---|---|
| `src/lib/max.ts` | Типы updates, MAX API client, команды |
| `src/pages/api/max/webhook.ts` | Secret-header, размер/JSON, HTTP-ответ |
| `scripts/set-subscription.mjs` | Регистрация production webhook |
| `scripts/subscription-info.mjs` | Проверка bot и списка subscriptions |
| `src/env.d.ts` | Runtime env types |
| `wrangler.jsonc` | Pages output, имя проекта и compatibility |

Идентификатор `astro-max-bot` меняйте согласованно в `wrangler.jsonc`,
`package.json`, `astro.config.mjs`, `.env.example` и документации.

## Проверки

Перед push:

~~~bash
npm ci
npm run build
git diff --check
git status --short
~~~

Production готов, когда:

- Cloudflare deployment соответствует SHA из `origin/main`;
- `GET /api/health` возвращает `ok: true`;
- `npm run subscription:info` показывает точный production webhook;
- пользователь запускает бота и получает приветствие;
- `/ping` отвечает `pong`;
- в runtime logs нет повторных ошибок MAX API.

## Границы

MAX mini app — отдельная сущность. Не добавляйте WebApp/Bridge и партнёрские
настройки mini app в этот bot skill без отдельного запроса.

Создание и публикация MAX-бота требуют верифицированного профиля организации,
ИП или самозанятого и прохождения модерации. AI не обходит эти требования.

Официальные источники:

- https://dev.max.ru/docs-api
- https://dev.max.ru/docs-api/objects/Update
- https://dev.max.ru/docs-api/methods/POST/messages
- https://dev.max.ru/docs-api/methods/POST/subscriptions
- https://dev.max.ru/help/events
- https://dev.max.ru/help/chatbots
