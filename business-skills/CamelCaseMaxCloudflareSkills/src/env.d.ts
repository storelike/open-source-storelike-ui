/// <reference types="astro/client" />

interface Env {
  MAX_BOT_TOKEN: string;
  MAX_WEBHOOK_SECRET: string;
}

type CloudflareRuntime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends CloudflareRuntime {}
}

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
