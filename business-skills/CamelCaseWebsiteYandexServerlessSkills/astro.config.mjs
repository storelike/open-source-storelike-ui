// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site:
    process.env.PUBLIC_SITE_URL ??
    'https://replace-with-container-id.containers.yandexcloud.net',
  vite: {
    plugins: [tailwindcss()],
  },
});
