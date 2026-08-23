# Browser-first: GitHub → Yandex Serverless Containers

Читайте этот runbook полностью перед первым развёртыванием, переносом repo или
восстановлением OIDC/CI/CD.

## 1. Проверить браузер и сессии

Сначала выполните browser gate из `SKILL.md`. Нужна управляемая сессия, в
которой открываются `github.com` и `console.yandex.cloud`. Владелец лично
проходит пароль, MFA, CAPTCHA, passkey, OAuth consent и неоднозначный выбор
аккаунта.

Не просите credential в чате, не считывайте browser storage и не копируйте
OAuth/IAM token в логи. После входа агент работает с обычным интерфейсом и
авторизованными CLI-командами.

## 2. Зафиксировать цель

До внешних изменений запишите без секретов:

- локальный путь к шаблону;
- GitHub owner, repo slug и visibility;
- Yandex cloud и folder;
- статус billing account;
- registry name, image name и container name;
- production branch `main`;
- нужен ли сейчас custom domain или достаточно URL `containers.yandexcloud.net`.

Если owner, cloud или folder неоднозначны, остановитесь и попросите владельца
выбрать. Не создавайте billing account, API Gateway, DNS records или ресурсы в
другом проекте по догадке.

## 3. Подготовить локальный сайт

1. Прочитайте `references/template-contract.md`.
2. Выполните `git status` и сохраните несвязанные изменения владельца.
3. Замените placeholder-контент в `src/config/site.ts` только на подтверждённые
   данные.
4. Проверьте, что `.env`, credentials, `dist`, `.astro` и `node_modules` не
   отслеживаются.
5. Запустите:

```bash
npm ci
npm run build
npx tsc --noEmit
docker build \
  --build-arg PUBLIC_SITE_URL=http://localhost:8080 \
  -t business-site-yandex:test .
```

6. Запустите image с `PORT=8080`, проверьте `/health`, `/` и canonical. Ошибка
   Astro, TypeScript или Docker build блокирует push.

## 4. Создать или проверить GitHub repo

Выполните `gh auth status`. Если GitHub CLI не авторизован, используйте
`gh auth login --web --git-protocol https`; подтверждение выполняет владелец.

Для нового проекта создайте пустой repo без первого push, чтобы сначала
настроить Yandex OIDC и Repository Variables:

```bash
gh repo create <owner>/<repo> --private
git remote add origin https://github.com/<owner>/<repo>.git
```

При явной команде open source используйте `--public`. Для существующего repo
не повторяйте `git init` или `gh repo create`: проверьте `origin`, fetch, branch
и историю. Не выполняйте force push.

## 5. Проверить Yandex Cloud и CLI

В browser console выберите точный cloud/folder и убедитесь, что связанный
billing account имеет активный статус. Container Registry и Serverless
Containers являются тарифицируемыми сервисами.

Если нужен CLI, установите его по официальной инструкции и выполните `yc init`.
Владелец сам проходит браузерную авторизацию. После неё проверьте только
нечувствительные значения:

```bash
yc config get cloud-id
yc config get folder-id
```

Не выводите OAuth token или содержимое CLI credential store.

## 6. Создать registry и сервисные аккаунты

Через console создайте один Container Registry в выбранном folder. Через CLI:

```bash
yc container registry create --name <registry-name> --folder-id <folder-id>
```

Создайте два сервисных аккаунта:

1. `<slug>-runtime` — используется active revision только для чтения image.
2. `<slug>-github` — используется GitHub OIDC для push image и deployment.

```bash
yc iam service-account create --name <slug>-runtime --folder-id <folder-id>
yc iam service-account create --name <slug>-github --folder-id <folder-id>
```

Назначьте роли с минимальным scope:

```bash
yc container registry add-access-binding \
  --id <registry-id> \
  --role container-registry.images.puller \
  --service-account-id <runtime-sa-id>

yc container registry add-access-binding \
  --id <registry-id> \
  --role container-registry.images.pusher \
  --service-account-id <deploy-sa-id>

yc resource-manager folder add-access-binding <folder-id> \
  --role serverless-containers.admin \
  --subject serviceAccount:<deploy-sa-id>

yc iam service-account add-access-binding \
  --id <runtime-sa-id> \
  --role iam.serviceAccounts.user \
  --subject serviceAccount:<deploy-sa-id>
```

`serverless-containers.admin` нужен для создания container/revision и
публичного access binding. Не назначайте primitive `editor` или `admin` на весь
cloud. Не создавайте authorized key для deploy account.

## 7. Настроить Workload Identity Federation

В folder откройте **Identity and Access Management → Workload identity
federations → Create federation** и задайте:

| Поле | Значение |
|---|---|
| Issuer | `https://token.actions.githubusercontent.com` |
| Audience | `https://github.com/<owner>` |
| JWKS URL | `https://token.actions.githubusercontent.com/.well-known/jwks` |
| Name | `<slug>-github` |

CLI-эквивалент:

```bash
yc iam workload-identity oidc federation create \
  --name <slug>-github \
  --folder-id <folder-id> \
  --issuer https://token.actions.githubusercontent.com \
  --audiences https://github.com/<owner> \
  --jwks-url https://token.actions.githubusercontent.com/.well-known/jwks
```

В deploy service account нажмите **Link to federation** и укажите subject,
ограниченный одним repo и production branch:

```text
repo:<owner>/<repo>:ref:refs/heads/main
```

CLI-эквивалент:

```bash
yc iam workload-identity federated-credential create \
  --service-account-id <deploy-sa-id> \
  --federation-id <federation-id> \
  --external-subject-id "repo:<owner>/<repo>:ref:refs/heads/main"
```

Не используйте wildcard subject и не добавляйте другие repos/branches без
отдельного подтверждения.

## 8. Создать пустой Serverless Container

Создайте container до первого workflow, чтобы получить стабильный production
URL для Astro canonical:

```bash
yc serverless container create \
  --name <container-name> \
  --folder-id <folder-id>
```

Сохраните выданный HTTPS URL вида
`https://<container-id>.containers.yandexcloud.net`. Revision пока не нужна:
её создаст первый GitHub workflow. Публичный доступ также установит workflow.

## 9. Заполнить GitHub Repository Variables

В GitHub откройте **Settings → Secrets and variables → Actions → Variables** и
добавьте:

| Name | Value |
|---|---|
| `PUBLIC_SITE_URL` | URL из предыдущего шага без завершающего `/` |
| `YC_FOLDER_ID` | выбранный folder ID |
| `YC_REGISTRY_ID` | registry ID |
| `YC_IMAGE_NAME` | lowercase image name, например `business-site` |
| `YC_CONTAINER_NAME` | созданное container name |
| `YC_DEPLOY_SA_ID` | deploy service account ID |
| `YC_RUNTIME_SA_ID` | runtime service account ID |

CLI-эквивалент:

```bash
gh variable set PUBLIC_SITE_URL --repo <owner>/<repo> --body <https-url>
gh variable set YC_FOLDER_ID --repo <owner>/<repo> --body <folder-id>
gh variable set YC_REGISTRY_ID --repo <owner>/<repo> --body <registry-id>
gh variable set YC_IMAGE_NAME --repo <owner>/<repo> --body <image-name>
gh variable set YC_CONTAINER_NAME --repo <owner>/<repo> --body <container-name>
gh variable set YC_DEPLOY_SA_ID --repo <owner>/<repo> --body <deploy-sa-id>
gh variable set YC_RUNTIME_SA_ID --repo <owner>/<repo> --body <runtime-sa-id>
```

Не создавайте `YC_SA_JSON_CREDENTIALS` в GitHub Secrets. Workflow требует
`id-token: write` и обменивает OIDC JWT на краткоживущий IAM token.

## 10. Первый push и проверка

Перед commit замените fallback URL в `astro.config.mjs` и `.env.example`, затем
повторите локальные проверки. Добавьте только файлы проекта:

```bash
git add <project-files>
git diff --cached --check
git commit -m "Add Yandex Serverless website"
git branch -M main
git push -u origin main
```

В GitHub Actions дождитесь workflow для точного commit SHA. Он должен:

1. получить IAM token через OIDC;
2. собрать image с build arg `PUBLIC_SITE_URL`;
3. push image с тегом полного SHA;
4. создать новую HTTP revision с runtime service account;
5. сделать container публичным;
6. успешно проверить `/health` и canonical URL.

В Yandex console откройте Serverless Containers и сравните active revision,
image URL и время deployment с GitHub run. Затем проверьте:

- production URL возвращает HTTP 2xx;
- `/health` возвращает `ok`;
- canonical содержит `PUBLIC_SITE_URL`;
- сайт выглядит корректно на desktop и mobile;
- `mailto:`, `tel:` и якорная навигация работают.

Итоговый отчёт содержит repo, SHA, registry/image URL, container/revision ID,
production URL и результаты проверок. Credential в отчёт не включаются.

## 11. Последующие обновления

После обязательного browser gate:

1. fetch/status и проверка расхождения с `origin/main`;
2. минимальное изменение сайта;
3. Astro, TypeScript и при изменении deployment-файлов Docker tests;
4. secret scan и staged diff;
5. commit и push `main`;
6. ожидание Actions run для этого SHA;
7. проверка новой active revision и production страницы.

Каждый push создаёт новый immutable image tag и revision. Не переписывайте
старые tags и не удаляйте предыдущие images в рамках обычного обновления.

## 12. Типовые сбои

- **OIDC exchange denied:** сравните issuer, audience и subject с фактическими
  owner/repo/branch; не добавляйте JSON key как быстрый обход.
- **Push image denied:** проверьте `container-registry.images.pusher` у deploy
  SA на точном registry.
- **Revision не читает image:** проверьте `images.puller` у runtime SA и
  `iam.serviceAccounts.user` у deploy SA.
- **Public access denied:** workflow требует `serverless-containers.admin`, а
  не только `editor`.
- **Container не отвечает:** проверьте Nginx startup log и использование
  runtime-переменной `PORT`.
- **Canonical старый:** исправьте `PUBLIC_SITE_URL` и повторно запустите
  workflow для нового SHA.
- **Push rejected:** fetch и покажите расхождение; force push запрещён.
- **Workflow failed:** исправьте только доказанную по логу причину; после двух
  fix/push циклов остановитесь.

Официальные источники: [Serverless Containers quickstart](https://yandex.cloud/en/docs/serverless-containers/quickstart/container),
[runtime и PORT](https://yandex.cloud/en/docs/serverless-containers/concepts/runtime),
[Workload Identity Federation](https://yandex.cloud/en/docs/iam/operations/wlif/setup-wlif),
[Container Registry](https://yandex.cloud/en/docs/container-registry/operations/docker-image/docker-image-push)
и [public container](https://yandex.cloud/en/docs/serverless-containers/operations/container-public).
