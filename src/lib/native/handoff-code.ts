import { createHash, randomBytes } from "node:crypto";

/** One-time login code handed from the system browser back to the app. */
export function newHandoffCode(): string {
  return randomBytes(32).toString("base64url");
}

export function hashHandoffCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function isHandoffCode(code: string): boolean {
  return /^[A-Za-z0-9_-]{43,128}$/.test(code);
}
