import { registerPlugin } from "@capacitor/core";
import { adoptNativeSession } from "@/lib/auth/client";
import { claimNativeHandoff } from "@/lib/native/handoff";
import { newPkceVerifier, pkceChallenge } from "@/lib/native/pkce";
import {
  isAllowedReturn,
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

async function chooseReturnMode(): Promise<NativeReturnMode> {
  try {
    const runtime = await NativeAuth.runtime();
    if (!runtime.supportsHttpsCallback || !runtime.universalLinksBuild) return "scheme";
    if (window.location.hostname !== "verse2note.com") return "scheme";
    const res = await fetch("/auth/native-config", { headers: { accept: "application/json" } });
    if (!res.ok) return "scheme";
    const body = (await res.json()) as { universalLinks?: boolean };
    return body.universalLinks ? "https" : "scheme";
  } catch {
    return "scheme";
  }
}

/**
 * Google and X refuse a login that starts inside a WebView. This opens the
 * system browser (ASWebAuthenticationSession), then brings a one-time code
 * back into the app. The website's normal redirect is unchanged.
 * The verifier stays in this call. The return URL only carries the code.
 */
export async function signInWithNativeBrowser(
  providerId: string,
  callbackURL: string,
): Promise<void> {
  const verifier = newPkceVerifier();
  const challenge = await pkceChallenge(verifier);
  let mode = await chooseReturnMode();
  let result: { url: string };
  try {
    result = await NativeAuth.start({
      url: nativeStartUrl(providerId, challenge, mode),
      callback: mode,
    });
  } catch (error) {
    // iOS will not show the sheet for an HTTPS callback until this app is in
    // the domain's webcredentials association. The custom scheme is already
    // registered and does not depend on that check, so retry it once.
    if (!shouldFallBackToScheme(mode, errorMessage(error))) throw asAuthError(error);
    mode = "scheme";
    try {
      result = await NativeAuth.start({
        url: nativeStartUrl(providerId, challenge, mode),
        callback: mode,
      });
    } catch (retryError) {
      throw asAuthError(retryError);
    }
  }
  let back: URL;
  try {
    back = new URL(result.url);
  } catch {
    throw new Error("Sign-in was cancelled or failed");
  }
  if (!isAllowedReturn(back, mode)) {
    throw new Error("Sign-in was cancelled or failed");
  }
  const code = back.searchParams.get("code") ?? "";
  const claimed = await claimNativeHandoff({ data: { code, verifier } });
  if (!claimed.ok || !("token" in claimed) || !claimed.token) {
    throw new Error("Sign-in was cancelled or failed");
  }
  await adoptNativeSession(claimed.token, callbackURL);
}
