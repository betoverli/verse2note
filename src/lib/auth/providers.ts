/**
 * Identity providers that still federate through the Grok auth broker.
 *
 * Source of truth for the server (`server.ts`, one `genericOAuth` provider per
 * entry). Kept dependency-free so the client can import it without pulling the
 * server-only Better Auth instance (and `pg`) into the browser bundle.
 *
 * Google sign-in is not in this list for the UI. The website uses Better Auth's
 * native Google social provider (`./google`: env `GOOGLE_CLIENT_ID` /
 * `GOOGLE_CLIENT_SECRET`, callback `/api/auth/callback/google`). `grok-google`
 * stays registered so an existing broker account id can still be recognized;
 * sign-in buttons must use `BROKER_UI_PROVIDERS` (X) plus that native button.
 *
 * To add a broker upstream (e.g. GitHub) once the broker supports it: add one
 * entry here (`{ providerId: "grok-github", idp: "github", label: "GitHub" }`).
 * The `providerId` is this app's local id and the OAuth callback path segment
 * (`/api/auth/oauth2/callback/<providerId>`); `idp` is the hint the broker reads
 * to pick the upstream (Better Auth's id for X is still `twitter`).
 */
export type GrokProvider = {
  /** This app's local provider id; also the callback path segment. */
  providerId: string;
  /** Upstream hint the broker forwards to (Better Auth social id). */
  idp: string;
  /** Human label for the sign-in button. */
  label: string;
};

export const GROK_PROVIDERS: readonly GrokProvider[] = [
  { providerId: "grok-google", idp: "google", label: "Google" },
  { providerId: "grok-x", idp: "twitter", label: "X" },
];

/** Broker buttons to render. Native Google is a separate control. */
export const BROKER_UI_PROVIDERS: readonly GrokProvider[] = GROK_PROVIDERS.filter(
  (provider) => provider.idp !== "google",
);
