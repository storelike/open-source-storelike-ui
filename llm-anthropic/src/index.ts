import Fastify from "fastify";
import { chat, type ChatRequest } from "./client.js";

const PORT = 3002;

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { status: "ok" };
});

app.post<{ Body: ChatRequest }>("/chat", async (request, reply) => {
  const { messages, system, tools, max_tokens } = request.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return reply.status(400).send({ error: "messages array is required and must not be empty" });
  }

  try {
    const response = await chat({ messages, system, tools, max_tokens });
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    app.log.error({ err }, "Anthropic API call failed");
    return reply.status(502).send({ error: "Anthropic API call failed", detail: message });
  }
});

app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
