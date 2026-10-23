import { registerPlugin } from "@capacitor/core";
import { adoptNativeSession } from "@/lib/auth/client";
import { claimNativeHandoff } from "@/lib/native/handoff";
import { newPkceVerifier, pkceChallenge } from "@/lib/native/pkce";
import { isAllowedReturn, type NativeReturnMode } from "@/lib/native/return-to";

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
export async function signInWithNativeBrowser(providerId: string, callbackURL: string): Promise<void> {
  const verifier = newPkceVerifier();
  const challenge = await pkceChallenge(verifier);
  const mode = await chooseReturnMode();
  const start = new URL("/auth/native-start", window.location.origin);
  start.searchParams.set("providerId", providerId);
  start.searchParams.set("code_challenge", challenge);
  start.searchParams.set("return", mode);
  let result: { url: string };
  try {
    result = await NativeAuth.start({ url: start.toString(), callback: mode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/cancel/i.test(message)) throw cancelled();
    throw error instanceof Error ? error : new Error("Sign-in failed");
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
