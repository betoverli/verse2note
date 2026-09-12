import { formatPassageById, type CiteStyle, type Passage } from "@/lib/bible/passage";
import { parseReference } from "@/lib/bible/parse";
import type { Locale } from "@/lib/bible/books";
import {
  emptyLine,
  inlineToPassage,
  newNoteId,
  passageToRef,
  refKind,
  type LineBlock,
  type LineType,
  type NoteBlock,
  type NoteInline,
  type Speaker,
} from "@/lib/notebook";

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
        return `<span class="ref-pill" data-kind="${kind}" data-ref="${part.bookId}|${part.chapter}|${start}|${end}" contenteditable="false">${escapeHtml(label)}</span>\u200B`;
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
    const text = (node.textContent ?? "").replaceAll("\u200B", "");
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
  if (node.tagName === "A") {
    const label = (node.textContent ?? "").replaceAll("\u200B", "").trim();
    const passage = parseCopiedLabel(label);
    if (passage) {
      out.push(passageToRef(passage));
      return;
    }
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

export function parseCopiedLabel(label: string): Passage | null {
  const text = label.trim();
  if (!text) return null;
  return parseReference(text, "pt") ?? parseReference(text, "en") ?? parseReference(text, "es");
}

export function parseClipboardPassages(html: string, plain: string): Passage[] {
  const out: Passage[] = [];
  const seen = new Set<string>();
  function add(passage: Passage | null) {
    if (!passage) return;
    const key = `${passage.bookId}:${passage.chapter}:${passage.verseStart}:${passage.verseEnd}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(passage);
  }
  if (html) {
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      doc.querySelectorAll("[data-ref]").forEach((el) => add(passageFromDataset(el.getAttribute("data-ref") ?? "")));
      doc.querySelectorAll("a").forEach((el) => add(parseCopiedLabel(el.textContent ?? "")));
    } catch {
      /* ignore */
    }
  }
  if (!out.length && plain) {
    for (const raw of plain.split(/\n+/)) {
      const line = raw.trim();
      if (!line || /^[a-z][a-z0-9+.-]*:\/\//i.test(line)) continue;
      const md = line.match(/^\[([^\]]+)\]\([^)]+\)$/);
      add(parseCopiedLabel(md ? md[1] : line));
    }
  }
  return out;
}

function lineClass(block: LineBlock, emptyClass: boolean) {
  return [
    "note-line",
    emptyClass && block.inlines.length === 0 ? "note-line-empty" : "",
    block.type === "h" ? "note-line-h" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function lineToHtml(block: LineBlock, locale: Locale, style: Partial<CiteStyle> | undefined, placeholder?: string) {
  const ph = placeholder ? ` data-placeholder="${escapeHtml(placeholder)}"` : "";
  const body = inlinesToHtml(block.inlines, locale, style) || "<br>";
  return `<div class="${lineClass(block, true)}" data-line-id="${block.id}" data-kind="${block.type}"${ph}>${body}</div>`;
}

export function blocksToHtml(
  blocks: NoteBlock[],
  locale: Locale,
  style: Partial<CiteStyle> | undefined,
  speakers: Speaker[],
  placeholder?: string,
) {
  const firstId = blocks.find((block) => block.type !== "speaker")?.id;
  return blocks
    .map((block) => {
      if (block.type !== "speaker") {
        return lineToHtml(block, locale, style, block.id === firstId ? placeholder : undefined);
      }
      const speaker = speakers.find((item) => item.id === block.speakerId);
      const color = speaker?.color ?? "#c4a574";
      const children = block.children.map((child) => lineToHtml(child, locale, style)).join("");
      return `<section class="note-speaker" data-speaker-block="${block.id}" data-speaker-id="${block.speakerId}" style="border-color:${escapeHtml(color)}"><div class="note-speaker-head" contenteditable="false"><span class="note-speaker-name">${escapeHtml(speaker?.name ?? "—")}</span><button type="button" class="note-speaker-remove" data-remove-speaker="${block.id}">×</button></div>${children}</section>`;
    })
    .join("");
}

function readKind(value: string | undefined): LineType {
  return value === "h" || value === "ul" || value === "ol" ? value : "p";
}

function readLine(el: HTMLElement): LineBlock {
  let inlines = htmlToInlines(el);
  if (inlines.length === 1 && inlines[0]?.type === "text" && inlines[0].text === "\n") inlines = [];
  return {
    id: el.dataset.lineId || newNoteId(),
    type: readKind(el.dataset.kind),
    inlines,
  };
}

export function htmlToBlocks(root: HTMLElement): NoteBlock[] {
  const out: NoteBlock[] = [];
  for (const node of [...root.children]) {
    if (!(node instanceof HTMLElement)) continue;
    if (node.dataset.speakerBlock) {
      const children = [...node.querySelectorAll<HTMLElement>(":scope > .note-line")].map(readLine);
      out.push({
        id: node.dataset.speakerBlock,
        type: "speaker",
        speakerId: node.dataset.speakerId || newNoteId(),
        title: "",
        children: children.length ? children : [emptyLine()],
      });
      continue;
    }
    if (node.classList.contains("note-speaker-head")) continue;
    out.push(readLine(node));
  }
  return out.length ? out : [emptyLine()];
}

export function blocksSignature(blocks: NoteBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === "speaker") {
        return `s:${block.id}:${block.speakerId}:${block.children.map((child) => `${child.id}:${child.type}:${child.inlines.filter((part) => part.type === "ref").length}`).join(",")}`;
      }
      return `l:${block.id}:${block.type}:${block.inlines.filter((part) => part.type === "ref").length}`;
    })
    .join("|");
}
