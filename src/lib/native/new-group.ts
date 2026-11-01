/**
 * "New group" entry for the Capacitor iOS shell.
 *
 * History: TF82–TF88 used a native text prompt then a visibility action sheet.
 * On device that prompt often never appeared (or was classified as a user
 * cancel after a false `presented` event), and `openCreate` did
 * `if (cancelled) return` — so the Novo grupo FAB / button did nothing.
 *
 * The web ViewportSheet (name + private/listed) always works in the WKWebView.
 */
import type { Locale } from "@/lib/bible/books";

export type NativeNewGroupResult =
  | { type: "web-fallback" }
  | { type: "cancelled" }
  | { type: "create"; name: string; listed: boolean };

/**
 * Always prefer the web create-group sheet.
 * Callers MUST open the ViewportSheet on `web-fallback` — never ignore the tap.
 */
export async function runNativeNewGroup(_locale: Locale): Promise<NativeNewGroupResult> {
  return { type: "web-fallback" };
}

/** Pure helper for tests / call sites: a tap must open web UI on this result. */
export function newGroupShouldOpenWeb(result: NativeNewGroupResult): boolean {
  return result.type === "web-fallback";
}
