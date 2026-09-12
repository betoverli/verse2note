import { formatPassageById, type CiteStyle, type Passage } from "@/lib/bible/passage";
import type { Locale } from "@/lib/bible/books";
import { inlineToPassage, refKind, type NoteInline } from "@/lib/notebook";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function inlinesToHtml(inlines: NoteInline[], locale: Locale, style?: Partial<CiteStyle>) {
  if (inlines.length === 0) return "";
  return inlines
    .map((part) => {
      if (part.type === "ref") {
        const label = formatPassageById(inlineToPassage(part), locale, style);
        const kind = refKind(part.bookId);
        const start = part.verseStart ?? "";
        const end = part.verseEnd ?? "";
        return `<span class="ref-pill" data-kind="${kind}" data-ref="${part.bookId}|${part.chapter}|${start}|${end}" contenteditable="false">${escapeHtml(label)}</span>`;
      }
      let html = escapeHtml(part.text).replaceAll("\n", "<br>");
      if (part.bold) html = `<b>${html}</b>`;
      if (part.italic) html = `<i>${html}</i>`;
      return html;
    })
    .join("");
}

function parseRef(value: string | null): Extract<NoteInline, { type: "ref" }> | null {
  if (!value) return null;
  const [bookId, chapterRaw, startRaw, endRaw] = value.split("|");
  const chapter = Number(chapterRaw);
  if (!bookId || !Number.isInteger(chapter)) return null;
  return {
    type: "ref",
    bookId,
    chapter,
    verseStart: startRaw ? Number(startRaw) : null,
    verseEnd: endRaw ? Number(endRaw) : null,
  };
}

function walk(node: Node, marks: { bold?: boolean; italic?: boolean }, out: NoteInline[]) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    if (!text) return;
    out.push({ type: "text", text, bold: marks.bold, italic: marks.italic });
    return;
  }
  if (!(node instanceof HTMLElement)) {
    node.childNodes.forEach((child) => walk(child, marks, out));
    return;
  }
  if (node.dataset.ref) {
    const ref = parseRef(node.dataset.ref);
    if (ref) out.push(ref);
    return;
  }
  if (node.tagName === "BR") {
    out.push({ type: "text", text: "\n", bold: marks.bold, italic: marks.italic });
    return;
  }
  const next = {
    bold: marks.bold || node.tagName === "B" || node.tagName === "STRONG",
    italic: marks.italic || node.tagName === "I" || node.tagName === "EM",
  };
  node.childNodes.forEach((child) => walk(child, next, out));
}

export function htmlToInlines(root: HTMLElement): NoteInline[] {
  const out: NoteInline[] = [];
  root.childNodes.forEach((child) => walk(child, {}, out));
  return mergeInlines(out);
}

function mergeInlines(parts: NoteInline[]) {
  const out: NoteInline[] = [];
  for (const part of parts) {
    const last = out[out.length - 1];
    if (
      part.type === "text" &&
      last?.type === "text" &&
      Boolean(last.bold) === Boolean(part.bold) &&
      Boolean(last.italic) === Boolean(part.italic)
    ) {
      last.text += part.text;
      continue;
    }
    out.push(part);
  }
  return out.filter((part) => part.type === "ref" || part.text.length > 0);
}

export function passageFromDataset(value: string): Passage | null {
  const ref = parseRef(value);
  if (!ref) return null;
  return {
    bookId: ref.bookId,
    chapter: ref.chapter,
    verseStart: ref.verseStart,
    verseEnd: ref.verseEnd,
  };
}
