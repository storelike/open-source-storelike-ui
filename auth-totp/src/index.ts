import Fastify from "fastify";
import { verifyCode } from "./totp.js";
import { signToken, validateToken } from "./jwt.js";

const PORT = 3003;

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { status: "ok" };
});

interface VerifyBody {
  code: string;
}

app.post<{ Body: VerifyBody }>("/verify", async (request, reply) => {
  const { code } = request.body;

  if (!code || typeof code !== "string") {
    return reply.status(400).send({ error: "code is required and must be a string" });
  }

  const valid = verifyCode(code);
  if (!valid) {
    return reply.status(401).send({ error: "Invalid TOTP code" });
  }

  const result = signToken();
  return result;
});

interface ValidateBody {
  token: string;
}

app.post<{ Body: ValidateBody }>("/validate", async (request, reply) => {
  const { token } = request.body;

  if (!token || typeof token !== "string") {
    return reply.status(400).send({ error: "token is required and must be a string" });
  }

  const result = validateToken(token);
  return result;
});

app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
