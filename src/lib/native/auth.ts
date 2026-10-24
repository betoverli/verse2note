import { registerPlugin } from "@capacitor/core";
import { adoptNativeSession } from "@/lib/auth/client";
import { claimNativeHandoff } from "@/lib/native/handoff";
import { newPkceVerifier, pkceChallenge } from "@/lib/native/pkce";
import {
  isAllowedReturn,
  preferredNativeReturnMode,
  shouldFallBackToScheme,
  type NativeReturnMode,
} from "@/lib/native/return-to";

type NativeAuthPlugin = {
  start(options: { url: string; callback: NativeReturnMode }): Promise<{ url: string }>;
  runtime(): Promise<{ supportsHttpsCallback?: boolean; universalLinksBuild?: boolean }>;
};

const NativeAuth = registerPlugin<NativeAuthPlugin>("NativeAuth");

function cancelled(): Error {
  const error = new Error("Sign-in was cancelled");
  error.name = "AbortError";
  return error;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "";
}

function asAuthError(error: unknown): Error {
  const message = errorMessage(error);
  if (/cancel/i.test(message)) return cancelled();
  return error instanceof Error ? error : new Error(message || "Sign-in failed");
}

function nativeStartUrl(providerId: string, challenge: string, mode: NativeReturnMode): string {
  const start = new URL("/auth/native-start", window.location.origin);
  start.searchParams.set("providerId", providerId);
  start.searchParams.set("code_challenge", challenge);
  start.searchParams.set("return", mode);
  return start.toString();
}

function acceptReturn(raw: string, mode: NativeReturnMode): URL | null {
  try {
    const url = new URL(raw);
    return isAllowedReturn(url, mode) ? url : null;
  } catch {
    return null;
  }
}

async function startSession(
  providerId: string,
  challenge: string,
  mode: NativeReturnMode,
): Promise<{ url: string }> {
  return NativeAuth.start({
    url: nativeStartUrl(providerId, challenge, mode),
    callback: mode,
  });
}

/**
 * Google and X refuse a login that starts inside a WebView. This opens the
 * system browser (ASWebAuthenticationSession), then brings a one-time code
 * back into the app. The website's normal redirect is unchanged.
 * The verifier stays in this call. The return URL only carries the code.
 *
 * The installed build already registers this custom scheme. Its HTTPS callback
 * is reported as a cancel, and a cancel is not retried.
 */
export async function signInWithNativeBrowser(
  providerId: string,
  callbackURL: string,
): Promise<void> {
  const verifier = newPkceVerifier();
  const challenge = await pkceChallenge(verifier);
  let mode: NativeReturnMode = preferredNativeReturnMode();
  let result: { url: string };
  try {
    result = await startSession(providerId, challenge, mode);
  } catch (error) {
    // Kept for a caller that still asks for https. A cancel is the user
    // closing the sheet, so it must not open a second one.
    if (!shouldFallBackToScheme(mode, errorMessage(error))) throw asAuthError(error);
    mode = "scheme";
    try {
      result = await startSession(providerId, challenge, mode);
    } catch (retryError) {
      throw asAuthError(retryError);
    }
  }
  let back = acceptReturn(result.url, mode);
  if (!back && mode === "https") {
    // The HTTPS session can finish at once with an error URL. That is not a
    // tap on Cancel, so try the scheme the binary already captures.
    mode = "scheme";
    try {
      result = await startSession(providerId, challenge, mode);
    } catch (retryError) {
      throw asAuthError(retryError);
    }
    back = acceptReturn(result.url, mode);
  }
  if (!back) throw new Error("Sign-in was cancelled or failed");
  const code = back.searchParams.get("code") ?? "";
  const claimed = await claimNativeHandoff({ data: { code, verifier } });
  if (!claimed.ok || !("token" in claimed) || !claimed.token) {
    throw new Error("Sign-in was cancelled or failed");
  }
  await adoptNativeSession(claimed.token, callbackURL);
}
