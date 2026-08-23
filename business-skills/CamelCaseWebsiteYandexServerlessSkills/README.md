# Astro Business Website → Yandex Serverless Containers

Самостоятельный шаблон статического сайта для услуг и небольшого бизнеса.
Astro собирает сайт в `dist`, Nginx отдаёт его из Docker-образа, а GitHub
Actions публикует каждую версию в Yandex Container Registry и создаёт новую
revision в Yandex Serverless Containers.

```text
push main → GitHub Actions OIDC → Container Registry :<commit SHA>
          → Serverless Container revision → public HTTPS URL
```

Cloudflare, Wrangler, webhook и bot secrets в этом шаблоне не используются.

## Локальная разработка

Требуется Node.js 20 или новее.

```bash
npm ci
cp .env.example .env
npm run dev
```

Проверка статической сборки:

```bash
npm run build
npm run preview
```

Основной контент находится в `src/config/site.ts`. Разметка страницы — в
`src/pages/index.astro`, стили — в `src/styles/global.css`, статические файлы —
в `public/`.

## Проверка контейнера

```bash
docker build \
  --build-arg PUBLIC_SITE_URL=http://localhost:8080 \
  -t business-site-yandex:test .
docker run --rm -e PORT=8080 -p 8080:8080 business-site-yandex:test
```

После запуска откройте `http://localhost:8080` и проверьте
`http://localhost:8080/health`. Runtime слушает порт из переменной `PORT`,
которую Yandex Serverless Containers задаёт автоматически.

## Автоматический деплой

Workflow находится в
`.github/workflows/deploy-yandex-serverless.yml`. Он использует GitHub OIDC и
Yandex Workload Identity Federation, поэтому постоянный ключ сервисного
аккаунта в GitHub Secrets не нужен.

Перед первым push настройте Repository Variables:

| Variable | Значение |
|---|---|
| `PUBLIC_SITE_URL` | HTTPS URL созданного serverless container |
| `YC_FOLDER_ID` | ID каталога Yandex Cloud |
| `YC_REGISTRY_ID` | ID Container Registry |
| `YC_IMAGE_NAME` | имя image repository, например `business-site` |
| `YC_CONTAINER_NAME` | имя Serverless Container |
| `YC_DEPLOY_SA_ID` | сервисный аккаунт GitHub OIDC |
| `YC_RUNTIME_SA_ID` | сервисный аккаунт для чтения приватного image |

Все эти значения являются идентификаторами, а не секретами. Не добавляйте
`YC_SA_JSON_CREDENTIALS`, OAuth token или authorized key: канонический шаблон
использует только краткоживущие OIDC/IAM credentials.

Полный порядок создания registry, сервисных аккаунтов, federation, container и
GitHub variables описан в [SKILL.md](SKILL.md) и
[references/browser-runbook.md](references/browser-runbook.md).

## Стоимость и доступ

Container Registry хранит образы, а Serverless Containers тарифицирует вызовы,
ресурсы и исходящий трафик. Перед созданием ресурсов убедитесь, что выбран
правильный каталог и активный billing account. Шаблон делает сайт публичным;
custom domain через API Gateway/DNS настраивается отдельной задачей.
