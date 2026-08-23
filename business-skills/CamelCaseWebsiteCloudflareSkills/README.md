# Astro Business Website → Cloudflare Pages

Готовый статический сайт для услуг и небольшого бизнеса. Шаблон работает на
Astro 5, собирается в каталог `dist` и публикуется через нативную связку
GitHub → Cloudflare Pages. После настройки каждый push в `main` запускает новый
деплой автоматически.

## Быстрый старт

Требуется Node.js 20 или новее.

```bash
npm ci
cp .env.example .env
npm run dev
```

Локальный адрес: `http://localhost:4321`.

Проверка production-сборки:

```bash
npm run build
npm run preview
```

## Где менять сайт

- `src/config/site.ts` — название, тексты, услуги, контакты, этапы и FAQ;
- `src/pages/index.astro` — порядок и разметка секций;
- `src/styles/global.css` — цвета, шрифты и общие стили;
- `public/` — логотип, favicon и другие статические файлы;
- `.env.example` — пример публичного URL без секретов.

Начинайте с `src/config/site.ts`: обычная настройка бизнеса не требует менять
компоненты или конфигурацию сборки. Замените все демонстрационные тексты и
контакты на проверенные данные владельца до публикации.

## Установка через GitHub и Cloudflare

1. Создайте GitHub-репозиторий и отправьте шаблон в ветку `main`.
2. В Cloudflare откройте **Workers & Pages → Create → Pages → Connect to Git**.
3. Выберите репозиторий и production branch `main`.
4. Укажите build command `npm run build` и output directory `dist`.
5. Добавьте build variables `NODE_VERSION=20` и `PUBLIC_SITE_URL` с реальным
   production URL.
6. Дождитесь успешного деплоя и проверьте, что он соответствует последнему
   commit в `main`.

Если шаблон лежит в монорепозитории, в **Root directory** укажите путь к этой
папке. Для отдельного репозитория оставьте поле пустым или `/`.

Полный browser-first процесс для AI-агента описан в [SKILL.md](SKILL.md). В
базовом статическом сайте нет runtime secrets. Cloudflare API token, созданный
для будущего управления агентом, хранится вне репозитория и не передаётся
frontend-сборке.

## Публикация обновлений

После первичной настройки достаточно:

```bash
npm run build
git add <изменённые-файлы>
git commit -m "Update website content"
git push origin main
```

Cloudflare Pages сам соберёт новый commit. Не добавляйте параллельный GitHub
Action или Direct Upload, если владелец отдельно не выбрал другой способ
публикации.
