import type { Bot, Context } from "grammy";

const VOICE_URL = process.env.VOICE_URL ?? "http://voice:3005";

export async function handleVoiceMessage(
  bot: Bot,
  ctx: Context
): Promise<string> {
  const voice = ctx.message?.voice;

  if (!voice) {
    throw new Error("No voice message found in context");
  }

  const file = await bot.api.getFile(voice.file_id);

  if (!file.file_path) {
    throw new Error("Could not retrieve file path from Telegram");
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

  const downloadResponse = await fetch(fileUrl);

  if (!downloadResponse.ok) {
    throw new Error(
      `Failed to download voice file: ${downloadResponse.status}`
    );
  }

  const audioBuffer = Buffer.from(await downloadResponse.arrayBuffer());
  const filename = file.file_path.split("/").pop() ?? "voice.ogg";

  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: "audio/ogg" });
  formData.append("audio", blob, filename);

  const transcribeResponse = await fetch(`${VOICE_URL}/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!transcribeResponse.ok) {
    const errorText = await transcribeResponse.text();
    throw new Error(`Transcription failed: ${errorText}`);
  }

  const data = (await transcribeResponse.json()) as { text: string };
  return data.text;
}
