// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import react from "@astrojs/react";
import { imagetools } from "vite-imagetools";
import partytown from "@astrojs/partytown";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import { cmSeo } from "./src/locale/cms-locale.json";

const siteValue = cmSeo.siteHttps.value;

export default defineConfig({
  site: siteValue || "https://www.storelike.ru",

  // 👇 ВАЖНО: включаем server mode
  output: "server",

  integrations: [
    mdx(),
    sitemap({
      filter: (url) =>
        !url.includes("/init-payment/") &&
        !url.includes("/send-order/") &&
        !url.includes("/index-editor/") &&
        !url.includes("/call-to-action/") &&
        !url.includes("/thank-you/"),
    }),
    icon(),
    react(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
        debug: false,
      },
    }),
  ],

  vite: {
    plugins: [imagetools(), tailwindcss()],
    define: {
      global: {},
    },
    ssr: {
      external: ["node:buffer"],
    },
  },

  adapter: node({
    mode: "standalone",
  }),
});
