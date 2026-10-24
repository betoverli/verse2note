/**
 * Where the native app keeps the Better Auth session token.
 *
 * Google sign-in finishes in ASWebAuthenticationSession, which does not share
 * cookies with the WebView. The app already adopts that session as a bearer.
 * Email sign-in sets an HttpOnly `__Host-` cookie inside WKWebView. That jar
 * is not a durable place to keep a session: session cookies die with the
 * process, and WKWebView can drop the jar on kill before it reaches disk.
 *
 * `localStorage` is the store that already survives an app kill (notes live
 * there). `sessionStorage` is only for the live-preview iframe, where the
 * token must not outlive the tab.
 */
export const BEARER_KEY = "grok-auth.bearer-token";

const MAX_TOKEN_LENGTH = 4000;

export function sanitizeBearerToken(value: string | null | undefined): string | null {
  if (!value) return null;
  const token = value.trim();
  if (!token || token.length > MAX_TOKEN_LENGTH) return null;
  if (token.includes("\n") || token.includes("\r")) return null;
  return token;
}

/** Which stored value to send. On iOS, promote a leftover session copy. */
export function bearerFromStores(
  native: boolean,
  localValue: string | null,
  sessionValue: string | null,
): { token: string | null; promote: boolean } {
  const local = sanitizeBearerToken(localValue);
  const session = sanitizeBearerToken(sessionValue);
  if (!native) return { token: session, promote: false };
  if (local) return { token: local, promote: false };
  if (session) return { token: session, promote: true };
  return { token: null, promote: false };
}
