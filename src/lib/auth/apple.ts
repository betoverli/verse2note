/**
 * Sign in with Apple (Better Auth social provider) for the native iOS app.
 *
 * Off unless both server env vars are set. Partial config does not register
 * a broken provider. Native uses ASAuthorizationAppleID and posts the
 * identity token to `/api/native/v1/auth/apple`.
 *
 * Typical values:
 * - `APPLE_CLIENT_ID` — App ID / Services ID (often `com.verse2note.app`)
 * - `APPLE_CLIENT_SECRET` — Apple client secret JWT (rotated periodically)
 */

export const APPLE_PROVIDER_ID = "apple" as const;

export const APPLE_CLIENT_ID_ENV = "APPLE_CLIENT_ID";
export const APPLE_CLIENT_SECRET_ENV = "APPLE_CLIENT_SECRET";

export type AppleOAuthConfig =
  | { configured: false }
  | { configured: true; clientId: string; clientSecret: string };

export function appleOAuthFromEnv(
  env: Record<string, string | undefined>,
): AppleOAuthConfig {
  const clientId = env[APPLE_CLIENT_ID_ENV]?.trim() ?? "";
  const clientSecret = env[APPLE_CLIENT_SECRET_ENV]?.trim() ?? "";
  if (!clientId || !clientSecret) return { configured: false };
  return { configured: true, clientId, clientSecret };
}
