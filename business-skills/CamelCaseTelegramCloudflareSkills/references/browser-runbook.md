# Browser runbook: GitHub → Cloudflare Pages → Telegram

Это полный операционный порядок. Названия пунктов UI могут немного меняться;
ориентируйтесь на смысл, доступные роли/labels и итоговый URL. При изменении
интерфейса сверяйтесь только с официальной документацией:

- Cloudflare Pages Git integration:
  https://developers.cloudflare.com/pages/get-started/git-integration/
- Cloudflare Pages build configuration:
  https://developers.cloudflare.com/pages/configuration/build-configuration/
- Cloudflare Pages GitHub integration:
  https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/
- Cloudflare secrets:
  https://developers.cloudflare.com/workers/configuration/secrets/
- Cloudflare Pages API token:
  https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
- GitHub create repository:
  https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- Telegram BotFather:
  https://core.telegram.org/bots/features#creating-a-new-bot
- Telegram `setWebhook`:
  https://core.telegram.org/bots/api#setwebhook

## 0. Browser gate — всегда первый

До любого shell-вызова проверьте управляемый браузер и авторизацию в GitHub и
Cloudflare, как описано в `SKILL.md`.

Если окно отсутствует или вход не выполнен, единственное действие — ответ:

> Откройте браузер и войдите в GitHub и Cloudflare. Когда закончите, напишите
> «готово».

После этого остановитесь. Не открывайте новый браузер вместо владельца, не
начинайте локальную подготовку «пока он входит». После «готово» повторите gate,
поскольку слово владельца не заменяет фактическую проверку.

## 1. Зафиксировать цель

Из команды и текущей директории определите:

- путь к template root;
- GitHub owner и repo name;
- видимость repo; default — private;
- Cloudflare account;
- единый app slug;
- production branch `main`;
- есть ли существующий bot token.

Не просите то, что можно безопасно обнаружить. Спросите один короткий вопрос,
если GitHub/Cloudflare показывают несколько подходящих владельцев или app slug
нельзя вывести из команды. Перед первой внешней записью покажите одной строкой:

`GitHub <owner>/<repo> (private) → Cloudflare <account>/<slug> → main`.

## 2. Локальный preflight

1. Найдите root по контрактным файлам.
2. Проверьте Node `>=20`, npm, Git и чистоту/изменения рабочего дерева.
3. Просмотрите `git status --short`, remotes и последние commits.
4. Убедитесь, что secret-файлы игнорируются и не tracked.
5. Согласованно замените template slug, если создаётся новый app.
6. Выполните `npm ci` и `npm run build`.
7. Не продолжайте при failed build. Исправьте причину в целевом проекте и
   повторите проверки.

Если проект является частью monorepo, запишите относительный root directory.
Если создаётся самостоятельный bot repo, предпочтительно, чтобы `package.json`
был в корне нового repo.

## 3. Создать GitHub repository через браузер

1. Откройте GitHub → меню создания → **New repository**.
2. Выберите ровно согласованного owner.
3. Введите repo name и краткое описание.
4. Выберите private, если public не был явно указан.
5. Не добавляйте README, `.gitignore` или license: существующий template уже
   содержит файлы, а инициализация создаст конфликт истории.
6. Нажмите **Create repository**.
7. Проверьте, что URL и заголовок равны `<owner>/<repo>` и Quick setup показывает
   пустой repo.

Если repo уже существует:

- пустой repo можно использовать после проверки owner/name;
- непустой repo нельзя перезаписывать. Сравните remote/history и при конфликте
  остановитесь.

## 4. Дать серверу repo-scoped Git-доступ

Browser login не означает, что `git push` на сервере авторизован. Сначала
проверьте уже настроенный `gh auth status` или read-only SSH-доступ, не печатая
credentials.

Если безопасный доступ уже работает, используйте его. Иначе создайте отдельную
Ed25519 key pair для этого repo без вывода private key:

1. сохраните пару в `~/.ssh` с уникальным именем repo;
2. private key должен иметь mode `600`, public key — `644`;
3. в GitHub repo откройте **Settings → Deploy keys → Add deploy key**;
4. вставьте только содержимое `.pub`, дайте понятное имя сервера и включите
   **Allow write access**;
5. в локальном `.git/config` задайте repo-specific `core.sshCommand` с этим key
   и `IdentitiesOnly=yes`;
6. remote должен быть `git@github.com:<owner>/<repo>.git`;
7. проверьте `git ls-remote origin`.

Перед первым SSH-соединением проверьте fingerprint `github.com` по актуальной
официальной GitHub documentation. Не принимайте неизвестный host key вслепую.
Не добавляйте deploy key к другому repo и не загружайте private key в GitHub.

Для нового локального repo:

~~~bash
git init
git branch -M main
git add .
git diff --cached --check
git commit -m "Initial Telegram bot template"
git remote add origin git@github.com:<owner>/<repo>.git
git push -u origin main
~~~

Если repo уже клонирован, не выполняйте повторный `git init`. Проверьте branch и
remote, закоммитьте только изменения задачи и push-ните `main`. После push
сравните локальный HEAD и `origin/main`.

Если владелец подключает новый сервер, а рабочей копии ещё нет, сначала создайте
для этого сервера отдельный deploy key и добавьте его в GitHub, затем клонируйте
repo в новый явно названный каталог. После clone закрепите тот же key через
локальный `core.sshCommand` и проверьте read/write-доступ. Не копируйте private
key со старого сервера и не клонируйте поверх существующего непустого каталога.

## 5. Подключить GitHub к Cloudflare Pages

В Cloudflare dashboard:

1. Откройте **Workers & Pages**.
2. Выберите **Create application → Pages → Connect to Git**.
3. Выберите GitHub. Если требуется установка Cloudflare GitHub App, нажмите
   **Install & Authorize**.
4. При выборе доступа установите **Only select repositories** и добавьте только
   целевой repo. Расширение на все repositories требует отдельного подтверждения.
5. Вернитесь в Cloudflare, выберите нужный GitHub account и repo, затем
   **Begin setup**.
6. Project name: точный app slug.
7. Production branch: `main`. Ветка уже должна содержать первый push.
8. Framework preset: Astro, если он доступен; независимо от preset проверьте:
   - Build command: `npm run build`;
   - Build output directory: `dist`;
   - Root directory: пусто/`/` для отдельного repo или точный путь template в
     monorepo.
9. Добавьте build variable `NODE_VERSION` со значением `20`.
10. Нажмите **Save and Deploy**.

Git-integrated Pages project нельзя считать Direct Upload project. Не создавайте
второй Pages project drag-and-drop и не добавляйте параллельный GitHub Action.

Дождитесь первого build. Откройте deployment details и сопоставьте repo, branch
и commit SHA. Если имя занято и production hostname отличается от ожидаемого,
не ставьте webhook до фиксации фактического URL.

## 6. Создать минимальный Cloudflare API token

Этот token нужен будущему AI-агенту для CLI/API управления и логов. Нативная Git
integration выполняет автодеплой без него.

1. В Cloudflare откройте **My Profile / API Tokens**.
2. Выберите **Create Token → Custom Token → Get started**.
3. Имя: `owner-agent-<slug>-pages`.
4. Permission: **Account → Cloudflare Pages → Edit** (в новом UI это может
   называться **Pages Write**).
5. Account resources: включите только выбранный Cloudflare account.
6. Не добавляйте Zone/DNS, Workers Scripts, API Tokens Write и другие права без
   конкретной необходимости.
7. При стабильном IP/сроке можно предложить IP/TTL restriction, но не включайте
   ограничение, которое заблокирует сервер, без подтверждения владельца.
8. Проверьте summary, создайте token и обработайте одноразово показанное значение.

Сохраните token напрямую в owner secret manager. Если secret manager недоступен,
допустим отдельный env-файл **вне repo** с directory mode `700` и file mode
`600`. Сохраните рядом `CLOUDFLARE_ACCOUNT_ID`. Не выводите token, не кладите его
в `.env` приложения, Cloudflare runtime variables или GitHub Secrets при
нативной Git integration.

Проверьте token через официальный verify endpoint или безопасную read-only
Wrangler-команду. В лог выводите только статус проверки, account и последние
четыре символа fingerprint, если это действительно нужно; значение token не
показывайте.

## 7. Подготовить Telegram secrets

### Bot token

Если `TELEGRAM_BOT_TOKEN` ещё нет, попросите владельца открыть @BotFather,
выполнить `/newbot` или выбрать существующего бота и безопасно передать token
через secret manager, скрытое browser-поле или no-echo terminal prompt. Не
просите присылать token в чат.

### Webhook secret

Сгенерируйте его штатным script:

~~~bash
npm run secret:generate
~~~

Но не допускайте появления значения в отчёте или истории агента. Практический
режим — перенаправить stdout в созданный для этого временный файл с mode `600`,
передать значение в Cloudflare и Telegram, затем удалить этот временный файл.
Secret обязан состоять из 1–256 символов `A-Z a-z 0-9 _ -`.

Для локальной разработки значения можно сохранить в игнорируемом `.dev.vars` с
mode `600`. Перед этим убедитесь, что файл не tracked.

## 8. Добавить Cloudflare variables и secrets

Откройте Pages project → **Settings**. В зависимости от текущего UI раздел может
называться **Environment variables** или **Variables and Secrets**.

Для **Production** добавьте:

| Имя | Тип | Значение |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Secret | token @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Secret | сгенерированный secret |
| `PUBLIC_SITE_URL` | Variable | фактический `https://<host>.pages.dev` или custom URL |
| `NODE_VERSION` | Variable | `20`, если не был добавлен на setup |

После ввода secret убедитесь, что UI скрывает значение. Для Preview production
Telegram secrets не добавляйте. Сохраните/Deploy изменения и запустите новый
deployment `main`, если Cloudflare не сделал это автоматически.

Не добавляйте `CLOUDFLARE_API_TOKEN` или `CLOUDFLARE_ACCOUNT_ID` в runtime
приложения.

## 9. Зарегистрировать webhook

Используйте фактический production URL и те же два Telegram secret:

~~~bash
export PUBLIC_SITE_URL=https://<actual-production-host>
npm run webhook:set
~~~

`TELEGRAM_BOT_TOKEN` и `TELEGRAM_WEBHOOK_SECRET` должны поступить в process env
из защищённого источника без literal secret в shell history. Штатный script
установит:

- URL `/api/telegram/webhook`;
- `secret_token`;
- `allowed_updates: ["message"]`.

Повторно вызывать `setWebhook` при каждом deploy не нужно. Делайте это только
при первом запуске или смене URL/token/webhook secret.

## 10. Проверить результат

1. В Cloudflare deployment status — Success.
2. Deployment commit SHA совпадает с `origin/main`.
3. Откройте `https://<host>/api/health`: HTTP 2xx, `ok: true`.
4. Вызовите Telegram `getWebhookInfo` без вывода bot token.
5. Проверьте точный webhook URL, отсутствие текущего `last_error_message` и
   разумный `pending_update_count`.
6. В Telegram отправьте боту `/start` и `/ping`; ожидаются приветствие и `pong`.
7. При проблеме откройте Cloudflare deployment/runtime logs и ищите ошибку без
   вывода secrets.

Итоговый отчёт:

- GitHub `owner/repo` и branch;
- Cloudflare project и production URL;
- deployed commit SHA;
- имена настроенных variables/secrets без значений;
- результаты build, health, webhook и bot smoke test;
- где хранится management credential, без раскрытия значения.

## 11. Все последующие команды владельца

На каждой новой команде снова начните с browser gate. Затем:

1. `git fetch` и `git status`;
2. прочитайте относящиеся к задаче файлы;
3. внесите минимальные изменения;
4. `npm ci` при изменении lockfile/dependencies, затем `npm run build`;
5. проверьте diff и отсутствие secrets;
6. commit с понятным сообщением и push `main`;
7. в Cloudflare дождитесь deployment этого commit SHA;
8. проверьте health и функциональность изменённой команды;
9. сообщите владельцу результат.

Если deployment упал, прочитайте log, исправьте установленную причину, снова
соберите и push-ните. Допустимо не более двух автоматических fix/push попыток
после первого падения; затем остановитесь с конкретной ошибкой и безопасными
вариантами. Не маскируйте проблему ручным Direct Upload.

## 12. Восстановление типовых сбоев

- **Repo не виден в Cloudflare:** проверьте GitHub App repository access; не
  расширяйте доступ до всех repo без разрешения.
- **Wrong root/output:** исправьте Pages Build configuration, не перемещайте
  проект наугад.
- **Webhook 503:** production runtime secrets отсутствуют или не применён новый
  deployment.
- **Webhook 401:** значения `TELEGRAM_WEBHOOK_SECRET` в Cloudflare и Telegram
  расходятся; безопасно повторно задайте одно значение.
- **Telegram last_error_message:** проверьте HTTPS URL, endpoint, deployment
  logs и runtime secrets.
- **Push rejected:** не force-push. Выполните fetch и сравните историю; при
  чужих commits остановитесь и покажите расхождение.
- **Cloudflare GitHub check отсутствует:** проверьте production branch, branch
  controls и установку GitHub App.
