/**
 * Native note-settings flow (UIAlertController sheet + prompts).
 * Kept out of notebook-editor.tsx so ios-check can still forbid wiring the
 * Liquid Glass … button through NativeMenus.present.
 */
import type { Locale } from "@/lib/bible/books";
import { t } from "@/lib/i18n";
import {
  canUseNativeMenus,
  presentNativeMenu,
  presentNativePrompt,
  rectFromElement,
} from "@/lib/native/menus";
import type { Note } from "@/lib/notebook";

export type NativeNoteSettingsAction =
  | { type: "web-fallback" }
  | { type: "cancelled" }
  | { type: "set-date"; value: string }
  | { type: "add-tag"; value: string }
  | { type: "clear-speaker" }
  | { type: "pick-speaker" };

export async function runNativeNoteSettings(input: {
  locale: Locale;
  note: Note;
}): Promise<NativeNoteSettingsAction> {
  if (!(await canUseNativeMenus())) return { type: "web-fallback" };
  const result = await presentNativeMenu({
    style: "sheet",
    title: t(input.locale, "settings"),
    cancelLabel: t(input.locale, "linkCancel"),
    anchor: rectFromElement(null),
    items: [
      { id: "date", title: t(input.locale, "notebookDate"), symbol: "calendar" },
      { id: "tag", title: t(input.locale, "notebookTagAdd"), symbol: "tag" },
      { id: "speaker", title: t(input.locale, "notebookNoteSpeaker"), symbol: "person" },
      ...(input.note.speakerId
        ? [{ id: "clear-speaker", title: t(input.locale, "notebookNoteSpeakerNone"), symbol: "person.slash" }]
        : []),
    ],
  });
  if (result.failed) return { type: "web-fallback" };
  if (result.cancelled || !result.id) return { type: "cancelled" };

  if (result.id === "date") {
    const prompted = await presentNativePrompt({
      title: t(input.locale, "notebookDate"),
      cancelLabel: t(input.locale, "linkCancel"),
      okLabel: t(input.locale, "collectionDone"),
      placeholder: "YYYY-MM-DD",
      defaultValue: input.note.happenedAt,
    });
    if (prompted.failed) return { type: "web-fallback" };
    const next = (prompted.value ?? "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(next)) return { type: "set-date", value: next };
    return { type: "cancelled" };
  }

  if (result.id === "tag") {
    const prompted = await presentNativePrompt({
      title: t(input.locale, "notebookTagAdd"),
      cancelLabel: t(input.locale, "linkCancel"),
      okLabel: t(input.locale, "collectionDone"),
      placeholder: t(input.locale, "notebookTagAdd"),
    });
    if (prompted.failed) return { type: "web-fallback" };
    const next = (prompted.value ?? "").replace(/^#+/, "").slice(0, 24);
    if (!next) return { type: "cancelled" };
    return { type: "add-tag", value: next };
  }

  if (result.id === "clear-speaker") return { type: "clear-speaker" };
  if (result.id === "speaker") return { type: "pick-speaker" };
  return { type: "cancelled" };
}
