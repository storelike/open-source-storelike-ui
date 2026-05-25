import Fastify from "fastify";
import multipart from "@fastify/multipart";
import { transcribe } from "./whisper.js";

const server = Fastify({ logger: true });

await server.register(multipart, {
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB (Whisper API limit)
  },
});

server.get("/health", async () => {
  return { status: "ok" };
});

server.post("/transcribe", async (request, reply) => {
  const data = await request.file();

  if (!data || data.fieldname !== "audio") {
    return reply.status(400).send({
      error: "Missing 'audio' field in multipart form data",
    });
  }

  const buffer = await data.toBuffer();
  const filename = data.filename || "audio.mp3";

  try {
    const text = await transcribe(buffer, filename);
    return { text };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    server.log.error({ err }, "Whisper transcription error");
    return reply.status(500).send({ error: message });
  }
});

try {
  await server.listen({ port: 3005, host: "0.0.0.0" });
} catch (err) {
  server.log.fatal(err);
  process.exit(1);
}
