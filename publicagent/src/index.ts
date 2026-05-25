import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import { SYSTEM_PROMPT } from "./system-prompt.js";
import { buildContext } from "./context-builder.js";
import { filterOutput } from "./output-filter.js";
import { addMessage, getHistory, getMessagesForLlm } from "./conversation-store.js";
import type { ChatRequest, ChatResponse, LlmResponse, LlmMessage } from "./types.js";

const PORT = 3010;
const DEFAULT_LLM_URL = "http://llm-anthropic:3002";
const DEFAULT_STORE_URL = "http://store-sqlite:3001";

const app = Fastify({ logger: true });

await app.register(rateLimit, {
  max: 30,
  timeWindow: "1 minute",
});

app.get("/health", async () => {
  return { status: "ok" };
});

app.post<{ Body: ChatRequest }>("/chat", async (request, reply) => {
  const { session_id, message } = request.body;

  if (!session_id || !message) {
    return reply.status(400).send({ error: "session_id and message are required" });
  }

  if (message.length > 5000) {
    return reply.status(400).send({ error: "Message too long (max 5000 characters)" });
  }

  const llmUrl = process.env.LLM_URL ?? DEFAULT_LLM_URL;
  const storeUrl = process.env.STORE_URL ?? DEFAULT_STORE_URL;

  try {
    addMessage(session_id, { role: "user", content: message });

    const context = await buildContext();

    const systemPrompt = `${SYSTEM_PROMPT}\n\nHere is relevant store information for context:\n${context}`;

    const conversationMessages: LlmMessage[] = getMessagesForLlm(session_id);

    const llmResponse = await fetch(`${llmUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: conversationMessages,
        system: systemPrompt,
        max_tokens: 1024,
        // NO tools parameter — public agent has no tool access
      }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      app.log.error({ status: llmResponse.status, body: errorText }, "LLM request failed");
      return reply.status(502).send({ error: "Failed to get response from LLM" });
    }

    const llmData: LlmResponse = await llmResponse.json() as LlmResponse;

    const rawReply = llmData.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const filteredReply = filterOutput(rawReply);

    addMessage(session_id, { role: "assistant", content: filteredReply });

    // Log to audit
    try {
      await fetch(`${storeUrl}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor: "publicagent",
          action: "chat",
          target: session_id,
          diff: JSON.stringify({
            user_message: message.slice(0, 200),
            reply_length: filteredReply.length,
          }),
        }),
      });
    } catch {
      app.log.warn("Failed to log to audit store");
    }

    const response: ChatResponse = { reply: filteredReply };
    return response;
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    app.log.error({ err }, "Chat request failed");
    return reply.status(500).send({ error: "Internal server error", detail });
  }
});

app.get<{ Params: { session_id: string } }>("/history/:session_id", async (request) => {
  const { session_id } = request.params;
  const history = getHistory(session_id);
  return { session_id, messages: history };
});

app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
