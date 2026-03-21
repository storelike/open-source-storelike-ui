# Documentation

## Project Overview

**open-source-storelike-ui** is a collection of high-performance e-commerce and web templates built for Pagespeed 100%.

## Available Templates

| Template | Description |
|----------|-------------|
| `basic` | Base e-commerce storefront |
| `build-mart` | Hardware & tools store |
| `glow-store` | Beauty & cosmetics store |
| `home-space` | Home decor & furniture |
| `style-shop` | Fashion & apparel |
| `tech-market` | Electronics & technology |
| `web-folio` | Portfolio & agency |

## Running a Template

```bash
cd ecommerce-templates/<template-name>
npm install
npm run dev
```

## Performance Testing

```bash
node tests/performance-test.js
```

All templates must score **100** on Pagespeed (Desktop & Mobile).

## Docker Deployment

```bash
cd ecommerce-templates/<template-name>
docker build -t storelike/<template-name> .
docker run -p 4321:4321 storelike/<template-name>
```
