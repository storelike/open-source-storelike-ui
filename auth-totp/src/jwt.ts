import jwt from "jsonwebtoken";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  return secret;
}

function getTtl(): number {
  const raw = process.env.SESSION_TTL_SECONDS;
  if (raw) {
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 3600;
}

export interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export interface SignResult {
  token: string;
  expires_at: number;
}

export function signToken(): SignResult {
  const ttl = getTtl();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + ttl;

  const token = jwt.sign(
    { sub: "authenticated", iat: now, exp: expiresAt },
    getSecret(),
    { algorithm: "HS256" }
  );

  return { token, expires_at: expiresAt };
}

export interface ValidateResult {
  valid: boolean;
  expires_at?: number;
}

export function validateToken(token: string): ValidateResult {
  try {
    const decoded = jwt.verify(token, getSecret(), {
      algorithms: ["HS256"],
    }) as TokenPayload;

    return { valid: true, expires_at: decoded.exp };
  } catch {
    return { valid: false };
  }
}
