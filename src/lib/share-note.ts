/**
 * Share a note through the native iOS share sheet (UIActivityViewController via
 * Capacitor Share) when running in the app; Web Share API on supporting browsers.
 */
import { notePlainText, type Note, type Speaker } from "@/lib/notebook";
import { isNativeApp } from "@/lib/native/runtime";
import { canWebShare } from "@/lib/copy-rich";

export async function shareNote(
  note: Note,
  speakers: Speaker[],
  fallbackTitle: string,
): Promise<"shared" | "cancelled" | "unavailable"> {
  const title = note.title.trim() || fallbackTitle;
  const text = notePlainText(note, speakers) || title;
  const url =
    typeof window !== "undefined" ? `${window.location.origin}/n/${note.id}` : undefined;

  if (isNativeApp()) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({
        title,
        text,
        ...(url ? { url } : {}),
        dialogTitle: title,
      });
      return "shared";
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/cancel/i.test(message)) return "cancelled";
      /* fall through to web share */
    }
  }

  if (!canWebShare()) return "unavailable";
  try {
    const data: ShareData = url ? { title, text, url } : { title, text };
    await navigator.share(data);
    return "shared";
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return "cancelled";
    return "unavailable";
  }
}
