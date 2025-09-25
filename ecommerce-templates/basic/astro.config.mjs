// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from "astro-icon";

import { cmSeo } from './src/locale/cms-locale.json'

import react from '@astrojs/react';
import { imagetools } from 'vite-imagetools';
import partytown from "@astrojs/partytown";
import tailwindcss from "@tailwindcss/vite";


import node from '@astrojs/node';


// https://astro.build/config
const siteValue = cmSeo.siteHttps.value
export default defineConfig({
  site: siteValue || "https://blank.storelike.ru",

  integrations: [
      
      mdx(), 
      sitemap({
          filter: (url) => {
              // Исключаем страницы "/init/" и "/thank-you/"
              return !url.includes('/init-payment/') && !url.includes('/send-order/') && !url.includes('/index-editor/') && !url.includes('/call-to-action/') && !url.includes('/thank-you/');
          },
      }),
      icon(), 
      react(),
      partytown({
          // Adds dataLayer.push as a forwarding-event.
          config: {
          forward: ["dataLayer.push"],
          debug: false ,
          },
      }),      
  ],

  // @ts-ignore
  vite: {        plugins: [imagetools(), tailwindcss()],
      define: {
          global: {},
      },
      ssr: {
          external: ['node:buffer'],
        },
    
  },
  adapter: node({
    mode: 'standalone',
  }),
});