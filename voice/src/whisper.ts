import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribe(
  audioBuffer: Buffer,
  filename: string
): Promise<string> {
  const file = new File([audioBuffer], filename, {
    type: getMimeType(filename),
  });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
  });

  return transcription.text;
}

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    mp3: "audio/mpeg",
    mp4: "audio/mp4",
    mpeg: "audio/mpeg",
    mpga: "audio/mpeg",
    m4a: "audio/mp4",
    wav: "audio/wav",
    webm: "audio/webm",
    ogg: "audio/ogg",
    oga: "audio/ogg",
    flac: "audio/flac",
  };
  return mimeTypes[ext ?? ""] ?? "audio/mpeg";
}
