/**
 * Native Google sign-in (Better Auth social provider).
 *
 * This is not the Grok auth broker. The broker provider id is `grok-google`
 * and its callback is `/api/auth/oauth2/callback/grok-google`. Native Google
 * uses Better Auth's built-in provider id `google` and callback path below.
 *
 * Both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` must be set on the server.
 * If either is missing, the provider is not registered and the Google button
 * stays hidden. Email/password sign-in is unaffected.
 *
 * Full redirect URI registered in Google Cloud Console:
 * `{origin}/api/auth/callback/google`
 * (production origin today: https://verse2note.vercel.app).
 */

export const GOOGLE_PROVIDER_ID = "google" as const;

/** Server-only. Never prefix with `VITE_` — that would ship the secret to the browser. */
export const GOOGLE_CLIENT_ID_ENV = "GOOGLE_CLIENT_ID";
export const GOOGLE_CLIENT_SECRET_ENV = "GOOGLE_CLIENT_SECRET";

/** Better Auth social callback. Do not rename; Google must whitelist this path. */
export const GOOGLE_CALLBACK_PATH = "/api/auth/callback/google";

export type GoogleOAuthConfig =
  | { configured: false }
  | { configured: true; clientId: string; clientSecret: string };

export function googleOAuthFromEnv(
  env: Record<string, string | undefined>,
): GoogleOAuthConfig {
  const clientId = env[GOOGLE_CLIENT_ID_ENV]?.trim() ?? "";
  const clientSecret = env[GOOGLE_CLIENT_SECRET_ENV]?.trim() ?? "";
  if (!clientId || !clientSecret) return { configured: false };
  return { configured: true, clientId, clientSecret };
}
