import Fastify from "fastify";
import { join } from "node:path";
import { validateAuth } from "./auth-middleware.js";
import { loadSkill } from "./skill-loader.js";
import { runAgentLoop } from "./agent-loop.js";
import { registerTools } from "./tools/index.js";
import type { ChatRequest, ChatResponse, Message } from "./types.js";

const PORT = 3011;
const DEFAULT_LLM_URL = "http://llm-anthropic:3002";
const DEFAULT_TEMPLATES_BASE = "/templates";

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { status: "ok" };
});

app.post<{ Body: ChatRequest }>("/chat", async (request, reply) => {
  const { session_id, message, auth_token, template } = request.body;

  if (!session_id || !message || !auth_token) {
    return reply.status(400).send({ error: "session_id, message, and auth_token are required" });
  }

  // Validate auth
  const isValid = await validateAuth(auth_token);
  if (!isValid) {
    return reply.status(401).send({ error: "Invalid or expired auth token" });
  }

  const llmUrl = process.env.LLM_URL ?? DEFAULT_LLM_URL;
  const templatesBase = process.env.TEMPLATES_BASE_PATH ?? DEFAULT_TEMPLATES_BASE;

  try {
    let systemPrompt = `You are an owner agent for an e-commerce store built with Astro. You help the store owner manage their template by editing files, managing products, and updating CMS content.

Rules:
- Only modify files that are on the allow list.
- Always confirm destructive actions before proceeding.
- Provide clear feedback about what was changed.
- If a SKILL.md is loaded, follow its constraints precisely.`;

    let templatePath: string | undefined;

    if (template) {
      templatePath = join(templatesBase, template);

      // Load SKILL.md — this is the gate
      try {
        const skillContent = await loadSkill(templatePath);
        systemPrompt += `\n\nSKILL.md for template "${template}":\n${skillContent}`;
      } catch (err: unknown) {
        const detail = err instanceof Error ? err.message : "Unknown error";
        app.log.warn({ err }, `Failed to load SKILL.md for template "${template}"`);
        systemPrompt += `\n\nNote: No valid SKILL.md found for template "${template}" (${detail}). Proceed with default constraints.`;
      }
    }

    // Register tools (use template path if provided, otherwise templates base)
    const effectivePath = templatePath ?? templatesBase;
    const { definitions, handlers } = registerTools(effectivePath);

    const messages: Message[] = [
      { role: "user", content: message },
    ];

    const result = await runAgentLoop(
      llmUrl,
      messages,
      systemPrompt,
      definitions,
      handlers,
    );

    const response: ChatResponse = {
      reply: result.reply,
      actions: result.actions.length > 0 ? result.actions : undefined,
    };

    return response;
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    app.log.error({ err }, "Owner agent chat failed");
    return reply.status(500).send({ error: "Internal server error", detail });
  }
});

app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
