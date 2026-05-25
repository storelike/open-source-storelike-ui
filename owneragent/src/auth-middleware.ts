const DEFAULT_AUTH_URL = "http://auth-totp:3003";

export async function validateAuth(token: string): Promise<boolean> {
  const authUrl = process.env.AUTH_URL ?? DEFAULT_AUTH_URL;

  try {
    const response = await fetch(`${authUrl}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as { valid?: boolean };
    return data.valid === true;
  } catch {
    return false;
  }
}
