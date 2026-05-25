import Fastify from "fastify";
import {
  listFaq,
  insertFaq,
  listProducts,
  upsertProduct,
  listAudit,
  insertAudit,
} from "./db.js";

const PORT = 3001;

const app = Fastify({ logger: true });

// Health check
app.get("/health", async () => {
  return { status: "ok" };
});

// --- FAQ routes ---

app.get("/faq", async () => {
  return listFaq();
});

interface FaqBody {
  question: string;
  answer: string;
  source?: string;
}

app.post<{ Body: FaqBody }>("/faq", async (request, reply) => {
  const { question, answer, source } = request.body;
  if (!question || !answer) {
    return reply.status(400).send({ error: "question and answer are required" });
  }
  const row = insertFaq(question, answer, source);
  return reply.status(201).send(row);
});

// --- Product routes ---

app.get("/products", async () => {
  return listProducts();
});

interface ProductBody {
  id: string;
  title: string;
  price: number;
  category?: string;
  is_active?: number;
  data?: string;
}

app.post<{ Body: ProductBody }>("/products", async (request, reply) => {
  const { id, title, price, category, is_active, data } = request.body;
  if (!id || !title || price == null) {
    return reply.status(400).send({ error: "id, title, and price are required" });
  }
  const row = upsertProduct(id, title, price, category, is_active, data);
  return reply.status(201).send(row);
});

// --- Audit log routes ---

interface AuditQuery {
  limit?: string;
  offset?: string;
}

app.get<{ Querystring: AuditQuery }>("/audit", async (request) => {
  const limit = Math.min(Math.max(parseInt(request.query.limit ?? "50", 10) || 50, 1), 1000);
  const offset = Math.max(parseInt(request.query.offset ?? "0", 10) || 0, 0);
  return listAudit(limit, offset);
});

interface AuditBody {
  actor: string;
  action: string;
  target?: string;
  diff?: string;
}

app.post<{ Body: AuditBody }>("/audit", async (request, reply) => {
  const { actor, action, target, diff } = request.body;
  if (!actor || !action) {
    return reply.status(400).send({ error: "actor and action are required" });
  }
  const row = insertAudit(actor, action, target, diff);
  return reply.status(201).send(row);
});

// Start server
app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
