---
name: yandex-ads
description: AI skill for advertising a business on Yandex — Yandex Direct campaigns (Мастер кампаний) and Yandex Business (Справочник) org cards and promotions
version: 1.0.0
industry: Marketing & Advertising
author: Storelike Business Community
---

# Yandex Direct & Yandex Business Skill

> This skill is for business owners only. Developers must not modify this file.

## Business overview

You are helping a business run paid advertising in the Yandex ecosystem. Two different channels are involved and they are **not interchangeable**:

- **Yandex Direct** (`direct.yandex.ru`) — paid ads in Yandex Search and the ad network. Costs money per click or per conversion. This is where campaigns, budgets, headlines, and goals live.
- **Yandex Business / Справочник** (`yandex.ru/sprav`) — the organization card shown in Yandex Maps and Search, plus promotions (акции). Mostly free presence; the paid subscription is a separate product from Direct.

The typical owner is a small business sending traffic to a landing page and collecting leads through a form, a phone call, or a messenger link.

## Channel split — the rule owners get wrong most often

**Geo targeting is per channel, and the two must be kept separate.**

- A Direct campaign targets the region(s) you actually pay to advertise in. Adding a second city here doubles the audience the same weekly budget must cover — do not add a city just because the business also operates there.
- Presence in other cities belongs in **Yandex Business**: a separate organization card per city/region, published in Maps and Search.
- Positioning and wording ("we work across the country", "offices in X and Y") can be the same on every channel. The **targeting setting** must not be.

Before changing a region field, confirm with the owner which channel the new city belongs to. Never silently expand a campaign's geo.

## Setting up a campaign (Мастер кампаний / campaign wizard)

Мастер кампаний is the simplified single-campaign mode. Checklist:

1. **Landing page** — the URL the ads point at. Fix the page before spending on traffic to it.
2. **Ad copy** — up to **5 headlines (≤56 characters each)** and **3 texts (≤81 characters each)**.
3. **Quick links (быстрые ссылки)** — each one needs **URL + title + description**. In the compact view only title and URL are visible, so an existing description can look empty when it is not. Use anchors on the landing page (`/#pricing`, `/#how`, `/#reviews`) so each link goes somewhere specific.
4. **Goals (целевые действия)** — pick goals from the Metrika counter. **Every goal needs a price ("средняя цена за достижение цели") or the campaign will not save.** The goal with the highest price is treated as the priority one.
5. **Weekly budget (недельный бюджет)** — the campaign spends against this, not a monthly figure. Monthly ≈ weekly × 4.3.
6. **Strategy** — see below.

### Saving — the single biggest trap

- Only the **«Сохранить кампанию»** button at the bottom of the form writes to the server. A successful save redirects to the campaign overview (URL without `/edit/`).
- Modal dialogs with an **«Применить»** button (for example when renaming the campaign) do **not** persist on their own. After «Применить» you must still press «Сохранить кампанию», otherwise the change is gone on reload.
- Verify by reloading the edit page cleanly, not by trusting the on-screen state.

### Renaming a campaign

There is no "rename" item in the «…» menu (only Клонировать / Архивировать). The path is: campaign → **Настройки** tab → **pencil ✎ next to the title** → modal «Название кампании» → «Применить» → **«Сохранить кампанию»**.

## Strategy and payment model

The "цель продвижения" and "цена целевого действия" settings together decide what you pay for. This is where budget gets burned by accident.

- **Максимум целевых действий + «Без ограничений»** — you pay **per click**, with no CPA ceiling. Budget is spent even with zero conversions, and that is expected behaviour. Use this for the **first week only**, to let the campaign gather data ("разгон").
- **Максимум целевых действий + «Средняя за неделю»** — still pay per click, but with a target average CPA. Switch to this once the campaign has data.
- **Максимум целевых действий + «Фиксированная»** — pay **per conversion**. Set the price too low and impressions dry up. Do not start here.
- **Максимум переходов** — pure traffic, no conversion optimization. Only for awareness goals.

"Оптимизация конверсий" shown in the campaign grid is the **optimization goal**, not the payment model. If the owner asks "why is budget being spent when I pay per conversion" — the answer is almost always that the strategy is set to «Без ограничений», i.e. per-click.

## Settings to turn off by default

- **«Объявления от нейросети»** — off. Auto-generated ad variants dilute carefully written copy and can produce claims the business cannot back.
- **«Директ помогает» → «Автоматически применять рекомендации»** — off. Yandex will otherwise raise budgets and widen targeting without asking.
- **«Продвижение организации из Яндекс Бизнеса»** — only if the business has a real physical address (see below).

## Organization card in a campaign

The org-card toggle only works for organizations with a **physical address**. A purely online business gets: «Не получится продвигать онлайн-организацию. В Картах продвигаются только организации, у которых есть офис…». If the business is online-only, the campaign simply runs without an org card — this is not a fixable error, do not keep retrying it.

## Ad copywriting rules

**Do:**
- Match the headline to the landing page and include the product or key phrase.
- Use proven patterns: product + price, product + bonus/free trial, product + discount, product + city, product as a solution to a problem.
- Include concrete numbers (price, term, quantity) and a call to action.
- Put the unique selling point in the text, not only in the headline.
- Use as much of the character limit as possible — unused characters are wasted screen space.

**Don't:**
- Superlatives ("лучший", "первый", "№1") — rejected at moderation.
- ALL CAPS, s p a c e d out text, slang.
- Repeating the same subject, number, or phrase across headlines and texts. Each of the 5 headlines should sell a different angle.
- Quick links where the title and the description say the same thing.

**Rotation:** creatives are not set-and-forget. Once the campaign has meaningful impressions, compare CTR per headline/text variant and replace the laggards instead of waiting to be asked.

## Launch and moderation

- Launch from the campaign overview: **«Возобновить кампанию»** → status becomes «Кампания активна» and the button turns into «Остановить кампанию».
- **Never start or stop a campaign without an explicit go-ahead from the owner.** This is real money and a visible public action.
- Moderation in Мастер кампаний has no per-element "approved/rejected" status. The practical signal: campaign is active **and** no element still carries the «На модерации» flag. A newly added element shows that flag immediately; when it is gone everywhere, moderation has passed.

## Reading statistics

- **Campaign grid** (`/dna/grid/campaigns`) — Расход / Показы / Клики / Конверсии / CPA / CPC / CTR per campaign. The Конверсии column tends to count only the priority goal.
- **Reports** (`/dna/reports/library/…`) — filter by campaign with «Цели: Все» to see every conversion, not just the priority one.
- **Placement report (площадки)** returns no data for Мастер кампаний — this mode does not expose or let you exclude individual placements. Do not spend time hunting for "junk placements" here; only the classic campaign types support that.
- **Metrika** is the source of truth for actual leads — read goal completions for the period rather than trusting the campaign tiles, which load asynchronously and are easy to misread.

## Anti-fraud on the lead form

If the site's lead form requires authentication (Yandex ID confirmation, SMS code, or similar), treat that as **intentional anti-click-fraud protection**, not as a conversion killer.

- Never propose removing or weakening it to "improve conversion". Someone who genuinely wants the service will authenticate; bot and junk leads have negative value to the owner.
- "Traffic is coming but there are few leads" is a traffic volume/quality or landing page problem, not a reason to open the form up.
- Only the owner may decide to change this, on their own initiative.

## Yandex Business — organization card and promotions

- **Profile editing:** `https://yandex.ru/sprav/<org_id>/p/edit/…`. **Promotions:** `.../p/edit/promotions/`.
- Never guess the `org_id`. Ask the owner for the link or the open tab, especially when the account has several cards (for example one per city, or an old card from a previous brand).
- **Duplicate cards pointing at the same site dilute ranking.** If you find more than one, report it and let the owner decide which to keep — do not merge or delete anything yourself.
- A card reachable only by direct link is **not** necessarily published in Maps and Search. Verify before claiming that linking the card increases visibility.

### Creating a promotion (акция)

1. Open `/p/edit/promotions/` → **«Добавить акцию»**.
2. Fill in: start/end dates, announcement title (short, ~≤70 characters — this is what shows on the card), description (~≤200 characters), and the link to the landing page.
3. There is **no separate promo-code field** — put the condition in the text.
4. Publish, then reload the promotions list to confirm it actually saved. The first promotion may also go to Yandex Maps and pass moderation there.

Keep the discount wording customer-facing ("20% off for new clients"), and make sure the same offer exists on the site the promotion links to.

## If the agent drives the browser

- Headline and text fields in the campaign wizard are `contenteditable` divs, not `<input>` — clear with select-all + delete, then type.
- React forms ignore synthetic clicks fired from page scripts. Use real clicks and real keyboard input.
- Make one change and save it immediately; a browser restart or session drop loses unsaved form state.
- The same button label can appear twice (page and modal) — target the specific one.

## What the agent should never do

- Never launch, resume, or stop a campaign without explicit confirmation from the owner.
- Never raise a budget, widen geo, or change the payment model on its own initiative.
- Never suggest removing anti-spam protection from the lead form.
- Never write superlatives or unverifiable claims into ad copy — they fail moderation and can be a legal problem.
- Never touch adjacent accounts, subscriptions, or campaigns the task did not ask about. Report what you noticed, in text, and stop there.
- Never promise a specific CPA, position, or number of leads. Advertising results depend on the market, the offer, and the landing page.
- Never delete or merge organization cards, goals, or campaigns — those are the owner's decisions.
