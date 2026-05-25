import * as OTPAuth from "otpauth";

let totp: OTPAuth.TOTP;

function getInstance(): OTPAuth.TOTP {
  if (totp) return totp;

  const secret = process.env.TOTP_SECRET;
  if (!secret) {
    throw new Error("TOTP_SECRET environment variable is required");
  }

  totp = new OTPAuth.TOTP({
    issuer: "aikit",
    label: "auth-totp",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  return totp;
}

export function verifyCode(code: string): boolean {
  const instance = getInstance();
  // validate returns the time-step difference (0 = current window) or null if invalid
  // Allow a window of 1 step in each direction to account for clock drift
  const delta = instance.validate({ token: code, window: 1 });
  return delta !== null;
}
