import { registerPlugin } from "@capacitor/core";
import { adoptNativeSession } from "@/lib/auth/client";
import { claimNativeHandoff } from "@/lib/native/handoff";

type NativeAuthPlugin = {
  start(options: { url: string }): Promise<{ url: string }>;
};

const NativeAuth = registerPlugin<NativeAuthPlugin>("NativeAuth");

function cancelled(): Error {
  const error = new Error("Sign-in was cancelled");
  error.name = "AbortError";
  return error;
}

/**
 * Google and X refuse a login that starts inside a WebView. This opens the
 * system browser (ASWebAuthenticationSession), then brings a one-time code
 * back into the app. The website's normal redirect is unchanged.
 */
export async function signInWithNativeBrowser(providerId: string, callbackURL: string): Promise<void> {
  const start = new URL("/auth/native-start", window.location.origin);
  start.searchParams.set("providerId", providerId);
  let result: { url: string };
  try {
    result = await NativeAuth.start({ url: start.toString() });
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
  if (back.protocol !== "verse2note:" || back.searchParams.has("error")) {
    throw new Error("Sign-in was cancelled or failed");
  }
  const code = back.searchParams.get("code") ?? "";
  const claimed = await claimNativeHandoff({ data: { code } });
  if (!claimed.ok || !("token" in claimed) || !claimed.token) {
    throw new Error("Sign-in was cancelled or failed");
  }
  await adoptNativeSession(claimed.token, callbackURL);
}
