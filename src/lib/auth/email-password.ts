/**
 * Local email/password sign-in (this app's Better Auth DB — not the broker).
 *
 * On by default in this app. To disable: set `emailAndPasswordEnabled` to `false`.
 * then build sign-up / sign-in forms with `authClient.signUp.email` /
 * `authClient.signIn.email` from `@/lib/auth/client` (see the auth skill).
 *
 * Do NOT edit `server.ts` for this — that file is frozen pre-wired config.
 */
export const emailAndPasswordEnabled = true;
