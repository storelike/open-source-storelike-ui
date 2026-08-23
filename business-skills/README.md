# Business Skills

This directory contains business knowledge and complete, AI-operated deployment packages.

## Structure

```text
business-skills/
├── sites-skills/                         # Industry and marketing knowledge
├── CamelCaseTelegramCloudflareSkills/    # Telegram bot skill + runnable template
├── CamelCaseMaxCloudflareSkills/         # MAX bot skill + runnable template
├── CamelCaseWebsiteCloudflareSkills/     # Cloudflare website skill + template
└── CamelCaseWebsiteYandexServerlessSkills/ # Yandex website skill + container template
```

There is no repeated `business-skills/skills/` layer. Every deployable package is a direct child of `business-skills/`, and its `SKILL.md`, source code, scripts, configuration, and operating instructions live together in that package.

## Deployable skill packages

| Package | Purpose | Runtime and deployment |
|---------|---------|------------------------|
| [CamelCaseTelegramCloudflareSkills](CamelCaseTelegramCloudflareSkills/) | Create, configure, and operate a Telegram webhook bot | Astro, Cloudflare Pages, GitHub auto-deploy |
| [CamelCaseMaxCloudflareSkills](CamelCaseMaxCloudflareSkills/) | Create, configure, and operate a MAX webhook bot | Astro, Cloudflare Pages, GitHub auto-deploy |
| [CamelCaseWebsiteCloudflareSkills](CamelCaseWebsiteCloudflareSkills/) | Create and maintain a business website without bot code | Static Astro, Cloudflare Pages, GitHub auto-deploy |
| [CamelCaseWebsiteYandexServerlessSkills](CamelCaseWebsiteYandexServerlessSkills/) | Create and maintain a containerized business website | Static Astro, Yandex Serverless Containers, GitHub OIDC auto-deploy |

Each package is designed for an owner working through an AI coding agent. The owner gives business instructions and completes only account login or explicit approval steps. The agent reads `SKILL.md`, edits the local template, runs checks, commits changes, pushes to GitHub, and verifies the provider deployment.

Start a package locally:

```bash
cd business-skills/CamelCaseWebsiteYandexServerlessSkills
npm ci
npm run dev
```

Read the package README and `SKILL.md` before connecting GitHub, Cloudflare, Yandex Cloud, Telegram, or MAX. Never commit real tokens or local secret files.

## Industry and marketing skills

The files in `sites-skills/` teach an AI agent business context: products, terminology, customer communication, pricing logic, and marketing channels.

| Skill | Industry or channel |
|-------|---------------------|
| [beauty-salon.md](sites-skills/beauty-salon.md) | Beauty and wellness |
| [private-tutor.md](sites-skills/private-tutor.md) | Education and tutoring |
| [flower-shop.md](sites-skills/flower-shop.md) | Flowers and gifts |
| [food-delivery.md](sites-skills/food-delivery.md) | Restaurants and delivery |
| [legal-consulting.md](sites-skills/legal-consulting.md) | Legal services |
| [auto-service.md](sites-skills/auto-service.md) | Auto services |
| [real-estate.md](sites-skills/real-estate.md) | Real estate |
| [fitness-club.md](sites-skills/fitness-club.md) | Fitness and sport |
| [photo-studio.md](sites-skills/photo-studio.md) | Photography |
| [handmade-shop.md](sites-skills/handmade-shop.md) | Handmade goods |
| [yandex-ads.md](sites-skills/yandex-ads.md) | Yandex Direct and Yandex Business |

Business-domain content should be written or reviewed by people who understand the real business. Technical contributions are welcome in the deployable packages, but must preserve the owner-first workflow and secret-handling rules.

## Adding a skill

For a knowledge-only skill, add a Markdown file to `sites-skills/` using an existing file as a guide.

For a deployable skill, add one clearly named directory directly under `business-skills/`. Keep its `SKILL.md` beside the runnable template, place detailed procedures in `references/`, automation in `scripts/`, and verify the production build before opening a pull request.

## License

Business skills are published under the repository license. Contributors retain credit through Git history and any author metadata included in a skill.
