# Business Skills

> **FOR BUSINESS OWNERS ONLY. DEVELOPERS MUST NOT MODIFY THIS MODULE.**

This module contains AI agent skills tailored for specific types of real-world businesses. Each skill teaches the AI agent how to work with a particular industry — what products to suggest, how to talk to customers, what terminology to use, how to structure the catalog.

## Who this is for

- Entrepreneurs and store owners who deploy Storelike AIKit for their business
- Business consultants who configure stores for clients
- Non-technical users who want the AI agent to understand their industry

## Who this is NOT for

- **Developers** — you must not edit, refactor, or "improve" files in this module
- **Contributors** — do not submit PRs that modify business skill content
- Pull requests touching `business-skills/skills/*.md` from developer accounts will be rejected

## Why developers are excluded

Business skills encode real industry knowledge: how a beauty salon prices services, what a tutor's schedule looks like, how a flower shop handles same-day delivery. This knowledge comes from entrepreneurs running real businesses, not from developers guessing what a business needs.

If a developer "cleans up" or "optimizes" a business skill, they risk breaking the real-world context that makes the AI agent useful for that specific business. The SKILL.md format is simple Markdown — no programming knowledge is needed to write or edit it.

## How it works

1. Business owner picks a skill that matches their industry (e.g. `beauty-salon.md`)
2. The skill is loaded by `owneragent` alongside the template's SKILL.md
3. The AI agent now understands the business context: products, services, pricing logic, customer communication style
4. The owner customizes the skill to fit their specific business — their services, their prices, their tone

## Available skills

| Skill | Industry | Description |
|-------|----------|-------------|
| [beauty-salon.md](skills/beauty-salon.md) | Beauty & Wellness | Hair salons, nail studios, spas, cosmetics |
| [private-tutor.md](skills/private-tutor.md) | Education | Private tutors, online courses, test prep |
| [flower-shop.md](skills/flower-shop.md) | Flowers & Gifts | Flower delivery, gift baskets, event floristry |
| [food-delivery.md](skills/food-delivery.md) | Food & Delivery | Restaurants, cafes, home cooking, catering |
| [legal-consulting.md](skills/legal-consulting.md) | Legal Services | Law firms, notaries, legal consultants |
| [auto-service.md](skills/auto-service.md) | Auto Services | Car repair, detailing, tire shops, diagnostics |
| [real-estate.md](skills/real-estate.md) | Real Estate | Agencies, realtors, property management |
| [fitness-club.md](skills/fitness-club.md) | Fitness & Sport | Gyms, personal trainers, yoga studios |
| [photo-studio.md](skills/photo-studio.md) | Photography | Photo studios, wedding photography, events |
| [handmade-shop.md](skills/handmade-shop.md) | Handmade & Craft | Handmade goods, custom orders, artisan products |

### Marketing channels

These skills are not tied to one industry — load them alongside your industry skill when you advertise through that channel.

| Skill | Channel | Description |
|-------|---------|-------------|
| [yandex-ads.md](skills/yandex-ads.md) | Yandex Direct & Yandex Business | Campaign setup, budgets and payment models, ad copywriting, launch and moderation, org cards and promotions |

## How to create your own skill

You don't need to be a developer. Open any existing skill as an example and create a new `.md` file in `skills/`. Follow the template:

```markdown
---
name: my-business
description: AI skill for [your business type]
version: 1.0.0
industry: [your industry]
author: [your name or business name]
---

# My Business Skill

## Business overview
What your business does, who your customers are...

## Products and services
List your products/services with typical prices...

## Customer communication
How to greet customers, what tone to use...

## Common questions
Typical customer questions and correct answers...

## What the agent should never do
Industry-specific restrictions...
```

## License

Business skills are contributed by their authors under the same repository license. Authors retain credit via the `author` field in frontmatter.
