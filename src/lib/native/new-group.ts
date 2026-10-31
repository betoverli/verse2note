/**
 * Native "new group" flow: UIAlertController prompt for the name, then an
 * action sheet for private vs listed. Web callers fall back to ViewportSheet.
 */
import type { Locale } from "@/lib/bible/books";
import { t } from "@/lib/i18n";
import {
  canUseNativeMenus,
  presentNativeMenu,
  presentNativePrompt,
  rectFromElement,
} from "@/lib/native/menus";

export type NativeNewGroupResult =
  | { type: "web-fallback" }
  | { type: "cancelled" }
  | { type: "create"; name: string; listed: boolean };

export async function runNativeNewGroup(locale: Locale): Promise<NativeNewGroupResult> {
  if (!(await canUseNativeMenus())) return { type: "web-fallback" };

  const prompted = await presentNativePrompt({
    title: t(locale, "notebookGroupNew"),
    cancelLabel: t(locale, "linkCancel"),
    okLabel: t(locale, "notebookGroupCreate"),
    placeholder: t(locale, "notebookGroupName"),
  });
  if (prompted.failed) return { type: "web-fallback" };
  const name = (prompted.value ?? "").trim();
  if (name.length < 2) return { type: "cancelled" };

  const visibility = await presentNativeMenu({
    style: "sheet",
    title: t(locale, "notebookGroupNew"),
    message: name,
    cancelLabel: t(locale, "linkCancel"),
    anchor: rectFromElement(null),
    items: [
      { id: "private", title: t(locale, "notebookGroupPrivate"), symbol: "lock.fill" },
      { id: "listed", title: t(locale, "notebookGroupListed"), symbol: "globe" },
    ],
  });
  if (visibility.failed) return { type: "web-fallback" };
  if (visibility.cancelled || !visibility.id) return { type: "cancelled" };
  return { type: "create", name, listed: visibility.id === "listed" };
}
