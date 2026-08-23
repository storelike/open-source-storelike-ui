# Контракт CamelCaseWebsiteYandexServerlessSkills

Читайте этот файл перед изменением сайта, Docker runtime или GitHub workflow.

## Как найти корень

Корень шаблона содержит одновременно:

- `package.json`, `package-lock.json` и `astro.config.mjs`;
- `Dockerfile` и `docker/default.conf.template`;
- `.github/workflows/deploy-yandex-serverless.yml`;
- `src/config/site.ts` и `src/pages/index.astro`.

В самостоятельном repo эти файлы находятся в корне. Если пакет переносится в
монорепозиторий, workflow должен явно задавать build context и paths filter;
не считайте вложенный workflow автоматически активным.

## Инварианты

| Область | Требование |
|---|---|
| Рендеринг | статический Astro без runtime API |
| Build | `npm run build`, output `dist` |
| Container | многостадийный image: Node build → Nginx runtime |
| HTTP | Nginx слушает `0.0.0.0:$PORT`, `/health` возвращает `200` |
| Registry | `cr.yandex/<registry>/<image>:<full commit SHA>` |
| Deployment | GitHub Actions → новая Serverless Container revision |
| Authentication | GitHub OIDC → Yandex Workload Identity Federation |
| Production branch | `main` |
| Canonical URL | `PUBLIC_SITE_URL` равен публичному HTTPS URL сайта |

Yandex Serverless Containers принимает образы только из Yandex Container
Registry. Не заменяйте SHA-tag на `latest`, не добавляйте Cloudflare adapter или
Wrangler и не встраивайте credential в image.

## Карта редактирования

| Задача | Файл | Правило |
|---|---|---|
| Название, SEO, контакты | `src/config/site.ts` | менять значения, сохраняя ключи и типы |
| Секции | `src/pages/index.astro` | сохранять семантику и доступные ссылки |
| Цвета и типографика | `src/styles/global.css` | проверять контраст и mobile layout |
| SEO layout | `src/layouts/BaseLayout.astro` | сохранять description и canonical |
| Container build | `Dockerfile` | сохранять статическую сборку и малый runtime image |
| HTTP runtime | `docker/default.conf.template` | использовать `${PORT}`, сохранять `/health` |
| CI/CD | `.github/workflows/deploy-yandex-serverless.yml` | OIDC, SHA image, одна revision на push |

После смены телефона обновите одновременно `phone` и `phoneHref`. Не добавляйте
реальную форму без согласованного backend и требований приватности.

## Repository Variables

| Имя | Назначение |
|---|---|
| `PUBLIC_SITE_URL` | canonical/OG URL и production smoke test |
| `YC_FOLDER_ID` | каталог Yandex Cloud |
| `YC_REGISTRY_ID` | Yandex Container Registry |
| `YC_IMAGE_NAME` | image repository внутри registry |
| `YC_CONTAINER_NAME` | имя Serverless Container |
| `YC_DEPLOY_SA_ID` | service account, связанный с GitHub OIDC |
| `YC_RUNTIME_SA_ID` | service account с правом pull image |

Это публичные идентификаторы конфигурации. Канонический workflow не использует
GitHub Secrets и запрещает `YC_SA_JSON_CREDENTIALS`, OAuth token и authorized
key. При появлении runtime secrets храните их в Yandex Lockbox и добавляйте
только после отдельного security review.

## IAM contract

- Deploy SA: `container-registry.images.pusher` на registry,
  `serverless-containers.admin` на целевой folder и
  `iam.serviceAccounts.user` на runtime SA.
- Runtime SA: `container-registry.images.puller` на registry.
- Federation issuer: `https://token.actions.githubusercontent.com`.
- Audience: `https://github.com/<owner>`.
- JWKS: `https://token.actions.githubusercontent.com/.well-known/jwks`.
- Production subject: `repo:<owner>/<repo>:ref:refs/heads/main`.

`serverless-containers.admin` нужен workflow, потому что публичный сайт требует
управления access binding `allUsers`. Если сайт сделали public вручную и
workflow больше не меняет доступ, можно отдельно спроектировать более узкий
режим с `serverless-containers.editor`.

## Согласованное переименование

Для slug `my-business-site` проверьте:

1. `package.json` → npm-compatible `name`;
2. `astro.config.mjs` и `.env.example` → production URL;
3. GitHub Variables `YC_IMAGE_NAME` и `YC_CONTAINER_NAME`;
4. имена registry, service accounts и federation в Yandex Cloud;
5. README и commit message.

Не записывайте реальные resource ID прямо в tracked YAML: они задаются только
через Repository Variables.

## Проверки перед commit

```bash
npm ci
npm run build
npx tsc --noEmit
docker build --build-arg PUBLIC_SITE_URL=http://localhost:8080 -t business-site-yandex:test .
docker run --rm -e PORT=8080 -p 8080:8080 business-site-yandex:test
curl --fail http://127.0.0.1:8080/health
git diff --check
```

Также проверьте staged diff на credential, `.env`, build artifacts и случайные
resource IDs.

## Критерий готовности

- Astro, TypeScript и Docker image успешно собираются.
- Локальный container отвечает на `/` и `/health` при произвольном `PORT`.
- `origin/main`, Actions run, image tag и active revision относятся к одному
  commit SHA.
- Production URL публичен, отвечает по HTTPS и присутствует в canonical.
- Страница проверена в узком и широком viewport.
- В repo нет постоянных Yandex credential.

Официальные контракты: [Serverless Containers runtime](https://yandex.cloud/en/docs/serverless-containers/concepts/runtime),
[создание revision](https://yandex.cloud/en/docs/serverless-containers/quickstart/container),
[Workload Identity Federation](https://yandex.cloud/en/docs/iam/operations/wlif/setup-wlif)
и [Container Registry push](https://yandex.cloud/en/docs/container-registry/operations/docker-image/docker-image-push).
