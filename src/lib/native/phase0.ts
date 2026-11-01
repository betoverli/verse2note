/**
 * Phase 0 helpers: sync Better Auth bearer into the iOS Keychain via NativePhase0.
 * No-op outside Capacitor. Does not change the default shell mode.
 */
import { getBearerToken } from "@/lib/auth/client";
import { isNativeApp } from "@/lib/native/runtime";

type NativePhase0Plugin = {
  syncBearer(options: { token: string | null }): Promise<{ ok: boolean }>;
  getShellMode(): Promise<{ mode: string }>;
};

async function phase0Plugin(): Promise<NativePhase0Plugin | null> {
  if (!isNativeApp()) return null;
  try {
    const { registerPlugin } = await import("@capacitor/core");
    return registerPlugin<NativePhase0Plugin>("NativePhase0");
  } catch {
    return null;
  }
}

/** Push the current WebView bearer into Keychain for URLSession. */
export async function syncBearerToKeychain(): Promise<void> {
  const plugin = await phase0Plugin();
  if (!plugin) return;
  try {
    await plugin.syncBearer({ token: getBearerToken() });
  } catch (error) {
    console.warn("[NativePhase0] syncBearer failed", error);
  }
}

export async function readNativeShellMode(): Promise<string> {
  const plugin = await phase0Plugin();
  if (!plugin) return "capacitorSite";
  try {
    return (await plugin.getShellMode()).mode;
  } catch {
    return "capacitorSite";
  }
}
