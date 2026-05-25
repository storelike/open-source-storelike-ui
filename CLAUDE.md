# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**aikit** is an open-source collection of 7 e-commerce and portfolio web templates built with Astro 5 + React 19. The primary goal is Pagespeed 100% on both mobile and desktop, making all code decisions performance-driven. Templates are designed to work with Google Ads/Yandex Direct campaigns and are configurable by non-technical users via Claude Code.

Templates live under `ecommerce-templates/`:
- `basic` — universal starter
- `build-mart` — hardware/tools
- `glow-store` — beauty/cosmetics
- `home-space` — home decor
- `style-shop` — fashion
- `tech-market` — electronics
- `web-folio` — portfolio/agency

Each template is a standalone Astro project with its own `package.json`, `node_modules`, and `Dockerfile`.

## Commands (run inside a template directory)

```bash
cd ecommerce-templates/basic   # or any other template

npm install          # install dependencies
npm run dev          # dev server at http://localhost:4321
npm run build        # astro check (TypeScript) + astro build
npm run preview      # preview production build
```

**Performance test** (from repo root, requires server running):
```bash
node tests/performance-test.js
```
This runs Lighthouse audits at `http://localhost:4321` and requires a score of 100 on both mobile and desktop.

**CI** (`npm run build`) runs for all 7 templates via GitHub Actions on push/PR to `main`.

## Architecture

### Per-template structure

```
src/
  components/
    astro-components/     # server-rendered .astro components
    react-components/     # interactive React components (20+)
    navbar/
    ui/
  pages/                  # file-based routing
    index.astro
    products/[...slug].astro
    api/feedback.ts       # API routes (Node.js SSR)
    init-payment/
    send-order/
    contact.astro
  layouts/                # Layout.astro, DetailsProductLayout.astro, etc.
  content/config.ts       # Astro Content Collections schema (Zod)
  cms-get-data/
    useCmsData.ts         # React hook: fetches from admin panel or falls back to local JSON
    constants.ts
  locale/
    locale_text_site.json # UI text strings
    cms-locale.json       # CMS default data, SEO config, and settings
  stylesSite/global.css
```

### Key patterns

**Static + SSR hybrid:** Astro generates pages statically where possible. The Node.js adapter (`@astrojs/node` standalone mode) enables SSR for API routes. The production entry point is `dist/server/entry.mjs`.

**React hydration:** React components use `client:visible` (or other Astro directives) for partial hydration. Only add React where interactivity is required — prefer plain Astro components otherwise.

**CMS data flow:** `useCmsData.ts` uses SWR to fetch CMS content. When `?admin=true` is in the URL, it hits the admin panel endpoint; otherwise it falls back to the local `cms-locale.json`. All site text and product data can be customized through this JSON file without touching component code.

**Content Collections:** Products are defined via Astro's Content Collections API in `src/content/`. The schema is validated with Zod. Dynamic product pages use `[...slug].astro`.

**Third-party scripts:** Google Analytics and Yandex.Metrica are loaded via Partytown (off main thread) to avoid blocking the main thread and keep Pagespeed at 100.

**Telegram orders:** The `api/feedback.ts` route sends order notifications to a Telegram bot using `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` environment variables.

## Code Style (from `docs/CODING_STYLE.md`)

- **Minimalism:** No unnecessary divs, classes, or comments. Every byte must be justified.
- **HTML/Astro:** Always use closing tags and double-quoted attributes. All images must have `width`, `height`, and `alt` attributes to prevent CLS. Use `loading="lazy"` on non-critical images.
- **CSS:** Use `rem` for typography, `em` for components. Inline critical (above-the-fold) CSS in `<head>`; load the rest asynchronously. BEM-like class naming: `card`, `card__image`, `card--large`.
- **JavaScript:** Prefer vanilla JS over React when there is no interactive UI. React components must be functional with TypeScript types. All non-critical JS must be deferred.

## Commits & PRs

- Short, meaningful commit messages in English: `Add minimalistic template for Beauty industry`, `Fix SEO meta tags`, `Optimize performance for Google Ads`
- One PR = one logical task; include description and screenshots when relevant
- For large changes, open an Issue first

## Deployment

```bash
docker build -t storelike/<template-name> .
docker run -d --name my-store --restart always -p 8080:8080 --env-file .env my-store
```

Container runs on port 8080, entry point is `node ./dist/server/entry.mjs`.
