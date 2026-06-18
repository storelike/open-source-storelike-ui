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

There are **two** deployment modes. Always determine which one applies before touching anything.

### Mode 1 — single template container

A standalone template, no AI agents/gateway. The container runs on port 8080, entry point `node ./dist/server/entry.mjs`.

```bash
cd ecommerce-templates/<template-name>
docker build -t storelike/<template-name> .
docker run -d --name my-store --restart always -p 8080:8080 --env-file .env my-store
```

### Mode 2 — full platform on a VPS behind Caddy

This is the mode where Claude Code most often goes wrong. The full platform is orchestrated by `deploy/compose/docker-compose.yml` (a **generated** file — see below) with the `gateway` module (Caddy, `gateway/Caddyfile`) doing TLS termination and HTTP routing in front of the template + agent modules.

**Before assuming anything, detect the environment.** Treat it as a VPS + Caddy deploy when any of these hold: `gateway/` is part of the install, `deploy/compose/docker-compose.yml` exists, a `Caddyfile` is present, or the user mentions a domain/VPS/Caddy. When unsure, ask — do not default to `docker run -p 8080` for a platform install.

**How Caddy fits together (do not fight it):**
- Caddy is the only public entry point. It listens on **80 and 443**; the template's 8080 and the agents' 30xx ports are internal and must **not** be the public surface.
- The Caddyfile routes by service **name on the `aikit` Docker network** (`reverse_proxy basic:8080`, `publicagent:3010`, etc.), not `localhost`. A container started outside that network — e.g. a bare `docker run -p 8080` — is unreachable by name and Caddy will 502. Run templates as services on the compose `aikit` network.
- The default upstream is `{$TEMPLATE_UPSTREAM:basic:8080}`; set `TEMPLATE_UPSTREAM` to switch which template Caddy serves.

**Required for real TLS (the usual failure):**
- `DOMAIN` env var must be set to the real domain. With no `DOMAIN`, Caddy falls back to `localhost` and issues only a local/self-signed cert — fine for local testing, useless on a VPS.
- The domain's DNS **A record must already point at the VPS IP before the first start**, or Caddy's ACME (Let's Encrypt) challenge fails and HTTPS never comes up. Verify with `dig +short <domain>` before deploying.
- Ports **80 and 443 must both be published and open** in the VPS firewall/security group. Port 80 is required for the ACME HTTP-01 challenge and the HTTP→HTTPS redirect — exposing only 443 silently breaks certificate issuance. Make sure no host nginx/Apache already occupies 80/443.

**The compose file is generated — edit the generator, not the artifact.** `deploy/compose/docker-compose.yml` is produced by `node core/runtime/dist/index.js generate .` (or `npm run generate:compose`) from each module's `module.yml`. Hand-edits are overwritten on the next generate. To change ports, volumes, or env, edit the relevant `module.yml` or `core/runtime/src/compose-generator.ts`, rebuild (`cd core/runtime && npx tsc`), then regenerate.

**Always build before you deploy.** `astro check` runs as part of `npm run build` and a single TypeScript error fails the build (and the Docker `RUN npm run build` step). Run `npm run build` in the target template first; fix errors locally rather than discovering them mid-deploy on the VPS.

```bash
# from repo root, on the VPS
export DOMAIN=example.com           # real domain, DNS A record already pointing here
export TEMPLATE_UPSTREAM=basic:8080 # which template Caddy serves
docker compose -f deploy/compose/docker-compose.yml up -d --build
dig +short example.com              # confirm DNS resolves to this VPS first
```
