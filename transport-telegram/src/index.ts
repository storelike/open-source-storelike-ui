import Fastify from "fastify";
import { Bot } from "grammy";
import {
  routeMessage,
  isOwner,
  isAwaitingTotp,
  handleTotpCode,
} from "./router.js";
import { handleVoiceMessage } from "./voice-handler.js";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}

const server = Fastify({ logger: true });
const bot = new Bot(TELEGRAM_BOT_TOKEN);

server.get("/health", async () => {
  return { status: "ok" };
});

bot.on("message:voice", async (ctx) => {
  const chatId = ctx.chat.id;

  try {
    const text = await handleVoiceMessage(bot, ctx);

    await ctx.reply(`[Voice transcription]: ${text}`);

    if (isOwner(chatId) && isAwaitingTotp(chatId)) {
      const result = await handleTotpCode(chatId, text.trim());
      await ctx.reply(result.text);
      return;
    }

    const result = await routeMessage(chatId, text);
    await ctx.reply(result.text);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Voice processing failed";
    server.log.error({ err }, "Voice handler error");
    await ctx.reply(`Error processing voice message: ${message}`);
  }
});

bot.on("message:text", async (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text;

  if (isOwner(chatId) && isAwaitingTotp(chatId)) {
    const result = await handleTotpCode(chatId, text.trim());
    await ctx.reply(result.text);
    return;
  }

  const result = await routeMessage(chatId, text);
  await ctx.reply(result.text);
});

bot.catch((err) => {
  server.log.error({ err: err.error }, "Grammy error");
});

try {
  await server.listen({ port: 3004, host: "0.0.0.0" });
  server.log.info("Fastify server running on port 3004");

  bot.start({
    onStart: () => {
      server.log.info("Telegram bot started with long polling");
    },
  });
} catch (err) {
  server.log.fatal(err);
  process.exit(1);
}

function shutdown() {
  server.log.info("Shutting down...");
  bot.stop();
  server.close().then(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
