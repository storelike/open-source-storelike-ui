# Контракт CamelCaseWebsiteCloudflareSkills

Читайте этот файл перед изменением сайта, сборочной конфигурации или настроек
Cloudflare Pages.

## Как найти корень

Корень шаблона содержит одновременно:

- `package.json` и `package-lock.json`;
- `astro.config.mjs`;
- `wrangler.jsonc`;
- `src/config/site.ts`;
- `src/pages/index.astro`.

В отдельном GitHub repo Cloudflare Root directory остаётся пустым или `/`. В
монорепозитории Root directory равен пути от корня repo до этой папки; build
output `dist` считается относительно него.

## Инварианты

| Область | Требование |
|---|---|
| Рендеринг | статическая сборка Astro без runtime API |
| Build command | `npm run build` |
| Output directory | `dist` |
| Production branch | `main` |
| Node | `20` или новее; в Pages задаётся `NODE_VERSION=20` |
| Canonical URL | `PUBLIC_SITE_URL` равен фактическому production HTTPS URL |
| Публикация | нативная Cloudflare Pages Git integration |

Не добавляйте Cloudflare adapter ради обычной статической страницы. Adapter и
runtime secrets нужны только после осознанного появления server-side функций.

## Карта редактирования

| Задача | Файл | Правило |
|---|---|---|
| Название, SEO, контакты | `src/config/site.ts` → `site` | менять значения, сохраняя ключи и типы |
| Услуги | `src/config/site.ts` → `services` | каждая запись содержит `number`, `title`, `description` |
| Преимущества и процесс | `advantages`, `steps` | не заявлять непроверенные гарантии |
| FAQ | `faq` | давать только подтверждённые владельцем ответы |
| Секции страницы | `src/pages/index.astro` | сохранять семантические заголовки и доступные ссылки |
| Цвета и типографика | `src/styles/global.css` | проверять контраст и мобильный layout |
| Статика | `public/` | оптимизировать размер, у изображений задавать понятный `alt` |
| SEO layout | `src/layouts/BaseLayout.astro` | не удалять description, canonical и viewport |

`mailto:` и `tel:` используют значения из `site.ts`. После смены телефона
обновите одновременно отображаемый `phone` и машинный `phoneHref`.

## Переменные

| Имя | Тип | Где хранить | Назначение |
|---|---|---|---|
| `PUBLIC_SITE_URL` | public build variable | `.env` локально и Cloudflare Pages | canonical/OG URL сайта |
| `NODE_VERSION` | public build variable | Cloudflare Pages | воспроизводимая Node-среда, значение `20` |
| `CLOUDFLARE_API_TOKEN` | management secret | secret manager или защищённый файл вне repo | будущие CLI/API-действия агента |
| `CLOUDFLARE_ACCOUNT_ID` | management config | рядом с token вне repo | выбор Cloudflare account для CLI/API |

Базовый сайт не имеет runtime secrets. Не добавляйте management credential в
Pages variables, `.env.example` или GitHub Actions: Git integration разворачивает
сайт без него.

## Согласованное переименование

При выборе slug `my-business-site` проверьте:

1. `wrangler.jsonc` → `name`;
2. `astro.config.mjs` → запасной `https://<slug>.pages.dev`;
3. `.env.example` → пример `PUBLIC_SITE_URL`;
4. при необходимости `package.json` → npm-compatible `name`;
5. README и Cloudflare project name.

После замены найдите остатки `astro-business-site`. Они допустимы только там,
где намеренно описывается исходный шаблон.

## Проверки перед commit

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check
git status --short
```

Просмотрите staged diff и убедитесь, что там нет `.env`, token-подобных строк,
private keys, лишних build artifacts и несвязанных изменений владельца.

## Критерий готовности

Публикация готова, когда одновременно:

- локальная production-сборка успешна;
- GitHub `origin/main` содержит проверенный commit;
- Cloudflare deployment имеет статус Success и тот же commit SHA;
- production URL открывается по HTTPS, canonical ведёт на production host;
- навигация, `mailto:` и `tel:` работают;
- страница проверена в узком и широком viewport;
- демонстрационные тексты и контакты заменены либо явно оставлены владельцем.

Форму, оплату, авторизацию, базу данных, аналитику и cookies нельзя считать
частью этого статического контракта. Каждая такая возможность добавляется
отдельной задачей с собственными требованиями к безопасности и приватности.
