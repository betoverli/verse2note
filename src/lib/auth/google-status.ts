import { createServerFn } from "@tanstack/react-start";
import { googleOAuthFromEnv } from "./google";

/**
 * Whether the sign-in UI should offer native Google.
 * Returns a boolean only — never the client id or secret.
 * Missing/partial env is `enabled: false`, not an error.
 */
export const getGoogleSignInEnabled = createServerFn({ method: "GET" }).handler(async () => ({
  enabled: googleOAuthFromEnv(process.env).configured,
}));
