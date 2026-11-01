/**
 * Note-settings entry for the Capacitor iOS shell.
 *
 * History: TF82–TF88 chained `NativeMenus.present` (action sheet + prompts)
 * after the Liquid Glass … UIMenu selected "Settings". That path silently
 * dropped taps — either the alert never appeared, or PR #33's early
 * `presented` event made a failed present look like a user cancel, and
 * `notebook-editor` did `if (cancelled) return` with no web sheet.
 *
 * Multi-step forms (date / tag / speaker) belong on the web ViewportSheet,
 * which always paints inside the WKWebView. NativeMenus stays for one-shot
 * ActionSheet confirms (delete, etc.).
 */
import type { Locale } from "@/lib/bible/books";
import type { Note } from "@/lib/notebook";

export type NativeNoteSettingsAction =
  | { type: "web-fallback" }
  | { type: "cancelled" }
  | { type: "set-date"; value: string }
  | { type: "add-tag"; value: string }
  | { type: "clear-speaker" }
  | { type: "pick-speaker" };

/**
 * Always prefer the web note-settings sheet.
 * Callers MUST open the ViewportSheet on `web-fallback` — never ignore the tap.
 */
export async function runNativeNoteSettings(_input: {
  locale: Locale;
  note: Note;
}): Promise<NativeNoteSettingsAction> {
  return { type: "web-fallback" };
}

/** Pure helper for tests / call sites: a tap must open web UI on this result. */
export function noteSettingsShouldOpenWeb(action: NativeNoteSettingsAction): boolean {
  return action.type === "web-fallback";
}
