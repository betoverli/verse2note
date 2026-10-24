import { GOOGLE_PROVIDER_ID } from "./google";
import { auth } from "./server";

/**
 * Start the OAuth redirect for a sign-in button.
 *
 * Native Google uses Better Auth's social endpoint (`/api/auth/callback/google`).
 * Broker providers (X, and the legacy `grok-google` id) stay on generic OAuth.
 */
export function beginOAuthSignIn(
  request: Request,
  body: { providerId: string; callbackURL: string; errorCallbackURL: string },
): Promise<Response> {
  if (body.providerId === GOOGLE_PROVIDER_ID) {
    return auth.api.signInSocial({
      body: {
        provider: GOOGLE_PROVIDER_ID,
        callbackURL: body.callbackURL,
        errorCallbackURL: body.errorCallbackURL,
        // Keep a JSON `{ url }` body. The default sets a Location header, and the
        // popup / native-app callers read the URL themselves.
        disableRedirect: true,
      },
      headers: request.headers,
      asResponse: true,
    });
  }
  return auth.api.signInWithOAuth2({
    body: {
      providerId: body.providerId,
      callbackURL: body.callbackURL,
      errorCallbackURL: body.errorCallbackURL,
    },
    headers: request.headers,
    asResponse: true,
  });
}
