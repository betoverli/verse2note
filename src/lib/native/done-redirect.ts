import { readPkceCookie } from "./pkce-cookie.ts";
import { nativeReturnTo, type NativeReturnMode } from "./return-to.ts";

/** Where `/auth/native-done` sends the system browser, based on the PKCE cookie. */
export function nativeDoneLocation(
  cookieHeader: string | null | undefined,
  outcome: { code?: string; error?: boolean },
): string {
  const pkce = readPkceCookie(cookieHeader);
  const mode: NativeReturnMode = pkce?.mode ?? "scheme";
  if (outcome.error || !outcome.code || !pkce) return nativeReturnTo(mode, { error: true });
  return nativeReturnTo(mode, { code: outcome.code });
}
