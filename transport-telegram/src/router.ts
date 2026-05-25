import { getSession, setSession } from "./session.js";

const OWNER_CHAT_ID = Number(process.env.OWNER_CHAT_ID ?? "0");
const PUBLICAGENT_URL =
  process.env.PUBLICAGENT_URL ?? "http://publicagent:3010";
const OWNERAGENT_URL =
  process.env.OWNERAGENT_URL ?? "http://owneragent:3011";
const AUTH_URL = process.env.AUTH_URL ?? "http://auth-totp:3003";

interface RouteResult {
  type: "response" | "auth_prompt";
  text: string;
}

const pendingAuth = new Set<number>();

export function isOwner(chatId: number): boolean {
  return chatId === OWNER_CHAT_ID;
}

export function isAwaitingTotp(chatId: number): boolean {
  return pendingAuth.has(chatId);
}

export async function handleTotpCode(
  chatId: number,
  code: string
): Promise<RouteResult> {
  try {
    const response = await fetch(`${AUTH_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      return { type: "response", text: "Invalid TOTP code. Please try again." };
    }

    const data = (await response.json()) as { token: string; ttl?: number };
    const ttl = data.ttl ?? 24 * 60 * 60 * 1000;
    setSession(chatId, data.token, ttl);
    pendingAuth.delete(chatId);

    return {
      type: "response",
      text: "Authenticated successfully. You can now send commands.",
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Authentication service error";
    return { type: "response", text: `Auth error: ${message}` };
  }
}

export function promptForAuth(chatId: number): RouteResult {
  pendingAuth.add(chatId);
  return {
    type: "auth_prompt",
    text: "Please enter your TOTP code to authenticate as the store owner.",
  };
}

export async function routeMessage(
  chatId: number,
  text: string
): Promise<RouteResult> {
  if (isOwner(chatId)) {
    const session = getSession(chatId);

    if (!session) {
      return promptForAuth(chatId);
    }

    return await forwardToAgent(OWNERAGENT_URL, text, chatId, session.authToken);
  }

  return await forwardToAgent(PUBLICAGENT_URL, text, chatId);
}

async function forwardToAgent(
  agentUrl: string,
  text: string,
  chatId: number,
  authToken?: string
): Promise<RouteResult> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${agentUrl}/message`, {
      method: "POST",
      headers,
      body: JSON.stringify({ text, chatId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        type: "response",
        text: `Agent error (${response.status}): ${errorText}`,
      };
    }

    const data = (await response.json()) as { reply: string };
    return { type: "response", text: data.reply };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to reach agent";
    return { type: "response", text: `Error: ${message}` };
  }
}
