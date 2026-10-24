/** Better Auth session cookie. The handoff seals this value and nothing else. */
export const NATIVE_SESSION_COOKIE = "__Host-grok-auth.session_token";

const MAX_TOKEN = 4000;

/**
 * Read the session cookie off a request Cookie header. Route handlers pass
 * the header themselves: the TanStack cookie helper is tied to the server
 * function context and is empty on this callback.
 */
export function sessionTokenFromCookie(header: string | null | undefined): string | null {
  if (!header) return null;
  let found: string | null = null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) !== NATIVE_SESSION_COOKIE) continue;
    const raw = trimmed.slice(eq + 1);
    if (!raw) {
      found = null;
      continue;
    }
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    found = value.length > 0 && value.length <= MAX_TOKEN ? value : null;
  }
  return found;
}
