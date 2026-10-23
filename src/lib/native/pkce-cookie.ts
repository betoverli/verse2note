import { isPkceMaterial } from "./pkce.ts";
import { parseReturnMode, type NativeReturnMode } from "./return-to.ts";

export const PKCE_COOKIE = "__Host-native-pkce";

export function pkceCookieHeader(challenge: string, mode: NativeReturnMode): string {
  return `${PKCE_COOKIE}=${challenge}.${mode}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`;
}

export function clearPkceCookieHeader(): string {
  return `${PKCE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function readPkceCookie(
  header: string | null | undefined,
): { challenge: string; mode: NativeReturnMode } | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) !== PKCE_COOKIE) continue;
    const value = trimmed.slice(eq + 1);
    const dot = value.lastIndexOf(".");
    if (dot <= 0) return null;
    const challenge = value.slice(0, dot);
    const mode = parseReturnMode(value.slice(dot + 1));
    if (value.slice(dot + 1) !== mode) return null;
    if (!isPkceMaterial(challenge)) return null;
    return { challenge, mode };
  }
  return null;
}
