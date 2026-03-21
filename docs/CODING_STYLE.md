# ✍️ Code Style & Development Guide

To maintain a consistent code and markup style and achieve Pagespeed 100%, we follow strict rules.

## 1. General Principles

* **Minimalism:** Avoid unnecessary divs, classes, and comments. Every byte of code must be justified.
* **Performance:** All decisions should favor loading speed and execution speed.
* **Semantics:** Use native HTML5 semantic elements (header, main, footer, article, section, nav, etc.).

## 2. HTML / Astro

* **Closing tags:** Always use closing tags (e.g., `<img ... />`).
* **Attributes:** Attributes must be in double quotes (`"`) without exception.
* **Images:** Always include `width`, `height`, and `alt` attributes on all images to prevent layout shift (CLS). Use native Lazy Loading (`loading="lazy"`).
* **Structure:** All React components inside Astro pages must be imported and used with minimal additional JS. Use Astro directives (e.g., `client:visible`) sparingly.

## 3. CSS / Styling

* **Units:** Prefer `rem` for typography and `em` for components. Avoid `px` for font sizes.
* **Class naming (BEM-like):** Use simple, readable notation close to BEM but avoid excessively long names. Example: `card`, `card__image`, `card--large`.
* **Inline critical CSS:** CSS required for the first screen render (above the fold) must be inlined in `<head>` for maximum Pagespeed. Remaining CSS must be loaded asynchronously.
* **Reset:** Use a minimal normalizer or reset. Do not include full frameworks (like Bootstrap) — only include the styles you need.

## 4. JavaScript / React

* **Vanilla JS:** Prefer plain JS over React components where there is no interactive UI, to reduce the JS bundle size.
* **React Components:**
  * **Functional components:** Use only functional components and hooks.
  * **Prop types:** Use TypeScript or at minimum PropTypes for reliability.
* **React Router v7:** Use the latest `useRoutes` or `BrowserRouter` patterns for navigation.
* **Minimize JS:** All JS must be minified and deferred (`defer`) unless it is a critical interactive element.
