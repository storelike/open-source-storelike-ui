// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import icon from "astro-icon";

import seoData from './src/const/seo/seo-data-site.json'

import react from '@astrojs/react';
import { imagetools } from 'vite-imagetools';
import partytown from "@astrojs/partytown";


// https://astro.build/config
export default defineConfig({
    site: seoData?.siteHTTPS || "https://blank.storelike.ru",
    integrations: [
        tailwind(), 
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
            },
        }),      
    ], 
    vite: {
        plugins: [imagetools()],
        define: {
            global: {},
        },
        ssr: {
            external: ['node:buffer'],
          },
      
    },
});
