import path from 'path'
import { fileURLToPath } from 'url'

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import partytown from '@astrojs/partytown';
// Определяем путь к корню проекта
const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Динамически импортируем тему из TS-файла
const { ACTIVE_THEME } = await import('./theme.config.ts')
// Полный путь к public-папке текущей темы
const themePublicPath = path.resolve(__dirname, `list-shared-ui/${ACTIVE_THEME}/public`)
// Полный путь к исходникам компонентов
const themeSourcePath = path.resolve(__dirname, `list-shared-ui/${ACTIVE_THEME}/src`)

const themePath = path.resolve(__dirname, `list-shared-ui/${ACTIVE_THEME}`)

// https://astro.build/config
export default defineConfig({
  srcDir: path.join(themePath, 'src'), // 👈 подставляется активная тема
  vite: {
    plugins: [tailwindcss()],
    publicDir: themePublicPath,
    
    resolve: {
      alias: {
        '@ui': themeSourcePath
      }
    }
  },

  integrations: [react(), sitemap(), icon(), partytown()]
});
