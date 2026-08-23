# Browser-first: GitHub → Cloudflare Pages

Этот runbook читается полностью перед первым развёртыванием, переносом repo или
восстановлением сломанного автодеплоя.

## 1. Проверить браузер и сессии

Сначала выполните browser gate из `SKILL.md`. Нужна управляемая сессия, в
которой открываются `github.com` и `dash.cloudflare.com`. Владелец лично проходит
пароль, MFA, CAPTCHA, passkey и выбор аккаунта при неоднозначности.

Не просите credential в чате и не считывайте token из browser storage. После
входа агент работает с обычным интерфейсом и безопасными CLI-командами.

## 2. Зафиксировать цель

До внешних изменений запишите без секретов:

- локальный путь к шаблону;
- GitHub owner и repo slug;
- видимость нового repo;
- Cloudflare account и Pages project slug;
- production branch `main`;
- отдельный repo это или monorepo с Root directory;
- нужен ли custom domain сейчас или достаточно `pages.dev`.

Если owner/account неоднозначны, остановитесь и попросите выбрать. Не меняйте
organization, billing, DNS и существующий production «по догадке».

## 3. Подготовить локальный сайт

1. Прочитайте `references/template-contract.md`.
2. Выполните `git status` и сохраните несвязанные изменения владельца.
3. Замените placeholder-тексты и контакты в `src/config/site.ts` только на
   данные владельца.
4. При новом slug согласованно обновите места из раздела «Согласованное
   переименование».
5. Проверьте, что `.env`, credential и build output не отслеживаются Git.
6. Запустите:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Ошибка локальной сборки блокирует push. Не обновляйте major-зависимости только
ради предупреждения audit.

## 4. Создать или проверить GitHub repo

После успешного browser gate выполните `gh auth status`. Если GitHub CLI не
авторизован, используйте `gh auth login --web --git-protocol https`; владелец
сам подтверждает device flow в открытом браузере. Не извлекайте и не печатайте
token, сохранённый `gh`.

Для нового repo сначала перечитайте owner, имя и visibility. Если владелец не
указал public, безопасный default — private и требуется подтверждение перед
публикацией. Создать repo можно через браузер или авторизованный `gh`:

```bash
git init
git branch -M main
git add <только-файлы-проекта>
git diff --cached --check
git commit -m "Add Cloudflare website template"
gh repo create <owner>/<repo> --private --source=. --remote=origin --push
```

При явной команде open source используйте `--public`. Для существующего repo не
выполняйте повторный `git init` и `gh repo create`: проверьте `origin`, fetch,
branch и историю, добавьте только файлы текущей задачи и push `main`.

После push сравните локальный `git rev-parse HEAD` с `origin/main`. При rejected
push сделайте fetch и покажите расхождение; force push запрещён.

## 5. Подключить Cloudflare Pages к GitHub

В Cloudflare dashboard:

1. Откройте **Workers & Pages**.
2. Выберите создание приложения и режим **Pages / Connect to Git**.
3. Выберите GitHub. Если Cloudflare предлагает установить GitHub App, нажмите
   **Install & Authorize**.
4. Выберите **Only select repositories** и дайте доступ только целевому repo.
5. Вернитесь в Cloudflare, выберите точный GitHub owner и repo, затем начните
   setup.
6. Project name: согласованный lowercase slug.
7. Production branch: `main`.
8. Framework preset: Astro, если доступен. Независимо от preset проверьте:
   - Build command: `npm run build`;
   - Build output directory: `dist`;
   - Root directory: пусто/`/` для отдельного repo либо точный путь шаблона в
     монорепозитории.
9. Добавьте build variable `NODE_VERSION=20`.
10. Сохраните настройки и запустите первый deployment.

Не создавайте параллельный Direct Upload project и GitHub Action. Иначе один
repo получает два конкурирующих пути публикации.

## 6. Установить production URL

После первого deployment зафиксируйте фактический `https://<slug>.pages.dev`.
В Pages project откройте настройки variables и добавьте для Production:

| Имя | Тип | Значение |
|---|---|---|
| `PUBLIC_SITE_URL` | Variable | фактический production HTTPS URL |
| `NODE_VERSION` | Variable | `20` |

Запустите новый deployment `main`, если Cloudflare не сделал это автоматически.
Откройте HTML страницы и проверьте, что canonical указывает на production host.

Custom domain и изменение DNS выполняются только по явной команде владельца.
После подключения домена обновите `PUBLIC_SITE_URL` и снова разверните `main`.

## 7. Создать минимальный Cloudflare API token

Token нужен будущему агенту для разрешённых CLI/API-операций. Нативный
автодеплой через GitHub работает без него.

1. Откройте профиль Cloudflare → **API Tokens**.
2. Выберите **Create Token → Custom Token**.
3. Имя: `owner-agent-<slug>-pages`.
4. Добавьте только permission **Account → Cloudflare Pages → Edit**; в другом
   варианте UI это может называться **Pages Write**.
5. Ограничьте Account resources выбранным аккаунтом.
6. Не добавляйте DNS, Zone, Workers Scripts, API Tokens Write или Global API
   Key без отдельной задачи.
7. Проверьте summary и создайте token. Одноразовое значение обработайте через
   secret manager или no-echo ввод, не чат и не лог.

Предпочтительно сохранить `CLOUDFLARE_API_TOKEN` и `CLOUDFLARE_ACCOUNT_ID` в
secret manager владельца. Если его нет, допустим отдельный каталог вне repo с
mode `700` и env-файл с mode `600`. Не помещайте management token в `.env`
сайта, Cloudflare Pages variables или GitHub Secrets.

Проверяйте token через официальный verify endpoint или безопасную read-only
команду, не выводя значение. В отчёте достаточно статуса и имени credential.

## 8. Проверить production

Готовность подтверждается наблюдаемыми результатами:

1. `npm run build` успешен локально.
2. Cloudflare deployment имеет статус Success.
3. Repo, branch и deployment commit SHA совпадают с `origin/main`.
4. Production URL возвращает HTTP 2xx по HTTPS.
5. Страница визуально проверена в desktop и mobile viewport.
6. Навигация по якорям, email и телефонные ссылки работают.
7. В исходном HTML правильные title, description и canonical.

Итоговый отчёт содержит GitHub `owner/repo`, Cloudflare project, URL, SHA,
названия variables и результаты проверок. Значения credential не приводятся.

## 9. Каждое последующее обновление

После обязательного browser gate:

1. выполните fetch/status и убедитесь, что локальная ветка не отстаёт;
2. внесите минимальное изменение по карте шаблона;
3. выполните build, проверку типов и diff;
4. закоммитьте только файлы задачи и push `main`;
5. в Cloudflare дождитесь deployment этого SHA;
6. проверьте изменённый фрагмент на production URL.

Владелец после настройки пишет обычные команды вроде «измени телефон», «добавь
услугу» или «обнови первый экран»; агент выполняет весь технический цикл и
возвращает только результат и необходимые решения владельца.

## 10. Типовые сбои

- **Repo не виден:** проверьте доступ GitHub App к конкретному repo; не
  расширяйте его до всех repositories без разрешения.
- **Build не находит package.json:** исправьте Root directory в Pages settings.
- **Build успешен, но 404:** проверьте output directory `dist`.
- **Canonical старый:** обновите Production `PUBLIC_SITE_URL` и redeploy `main`.
- **Push не вызвал deploy:** проверьте production branch, GitHub App и commit
  SHA; не обходите проблему Direct Upload.
- **Push rejected:** fetch и сравнение истории; не force push.
- **Deployment failed:** прочитайте build log, исправьте доказанную причину и
  повторите не более двух fix/push циклов.
