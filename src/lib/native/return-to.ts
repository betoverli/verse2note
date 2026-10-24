/**
 * Where the system browser sends the one-time code. `https` is a Universal
 * Link on verse2note.com (only this app's team can claim it). `scheme` is the
 * custom URL, used until that association exists. Both are PKCE-bound.
 */

export type NativeReturnMode = "https" | "scheme";

export const UNIVERSAL_RETURN_PATH = "/auth/native-return";
export const UNIVERSAL_RETURN_ORIGIN = "https://verse2note.com";

export function parseReturnMode(value: string | null | undefined): NativeReturnMode {
  return value === "https" ? "https" : "scheme";
}

export function nativeReturnTo(
  mode: NativeReturnMode,
  params: { code?: string; error?: boolean },
): string {
  const query = new URLSearchParams();
  if (params.error) query.set("error", "1");
  if (params.code) query.set("code", params.code);
  const qs = query.toString();
  if (mode === "https") {
    return `${UNIVERSAL_RETURN_ORIGIN}${UNIVERSAL_RETURN_PATH}${qs ? `?${qs}` : ""}`;
  }
  return `verse2note://auth${qs ? `?${qs}` : ""}`;
}

/**
 * The HTTPS auth session refuses to present when the app is not associated
 * via `webcredentials` (typical on a TestFlight build that only declared
 * `applinks`). That failure is not a user cancel, so the caller can open the
 * custom-scheme session instead. A cancel must not start a second prompt.
 */
export function shouldFallBackToScheme(mode: NativeReturnMode, message: string): boolean {
  if (mode !== "https") return false;
  return !/cancel/i.test(message);
}

/** True when this URL is the callback the app is waiting for, and it succeeded. */
export function isAllowedReturn(url: URL, mode: NativeReturnMode): boolean {
  if (url.searchParams.has("error")) return false;
  const code = url.searchParams.get("code") ?? "";
  if (!/^[A-Za-z0-9_-]{43,128}$/.test(code)) return false;
  if (mode === "https") {
    return (
      url.protocol === "https:" &&
      url.hostname === "verse2note.com" &&
      url.pathname === UNIVERSAL_RETURN_PATH
    );
  }
  return url.protocol === "verse2note:" && url.hostname === "auth";
}
