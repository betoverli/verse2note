import { bookById, type Locale } from "@/lib/bible/books";
import { parseReference } from "@/lib/bible/parse";
import { formatPassageById, type CiteStyle, type Passage } from "@/lib/bible/passage";

export type RefKind = "gospel" | "nt" | "ot";

export type NoteInline =
  | { type: "text"; text: string; bold?: boolean; italic?: boolean }
  | { type: "ref"; bookId: string; chapter: number; verseStart: number | null; verseEnd: number | null };

export type LineType = "p" | "h" | "ul" | "ol";

export type LineBlock = {
  id: string;
  type: LineType;
  inlines: NoteInline[];
};

export type SpeakerBlock = {
  id: string;
  type: "speaker";
  speakerId: string;
  title: string;
  children: LineBlock[];
};

export type NoteBlock = LineBlock | SpeakerBlock;

export type Note = {
  id: string;
  title: string;
  happenedAt: string;
  tags: string[];
  blocks: NoteBlock[];
  visibility: "private" | "unlisted";
  updatedAt: string;
};

export type Speaker = {
  id: string;
  name: string;
  color: string;
  updatedAt: string;
};

export const SPEAKER_COLORS = ["#c4a574", "#7a9e8a", "#8aa0b8", "#c4897a", "#9b8ab0", "#7aa8b0", "#b89a6a", "#8aab7a"];

const GOSPELS = new Set(["MAT", "MRK", "LUK", "JHN"]);

export function newNoteId() {
  return crypto.randomUUID().replaceAll("-", "");
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function emptyLine(type: LineType = "p"): LineBlock {
  return { id: newNoteId(), type, inlines: [] };
}

export function emptyNote(happenedAt = todayKey()): Note {
  return {
    id: newNoteId(),
    title: "",
    happenedAt,
    tags: [],
    blocks: [emptyLine()],
    visibility: "private",
    updatedAt: new Date().toISOString(),
  };
}

export function refKind(bookId: string): RefKind {
  if (GOSPELS.has(bookId)) return "gospel";
  return bookById(bookId)?.testament === "nt" ? "nt" : "ot";
}

export function inlineToPassage(part: Extract<NoteInline, { type: "ref" }>): Passage {
  return {
    bookId: part.bookId,
    chapter: part.chapter,
    verseStart: part.verseStart,
    verseEnd: part.verseEnd,
  };
}

export function passageToRef(passage: Passage): Extract<NoteInline, { type: "ref" }> {
  return {
    type: "ref",
    bookId: passage.bookId,
    chapter: passage.chapter,
    verseStart: passage.verseStart,
    verseEnd: passage.verseEnd,
  };
}

export function refLabel(passage: Passage, locale: Locale, style?: Partial<CiteStyle>) {
  return formatPassageById(passage, locale, style);
}

export function lineText(block: LineBlock) {
  return block.inlines.map((part) => (part.type === "text" ? part.text : "")).join("");
}

export function notePreview(note: Note) {
  for (const block of note.blocks) {
    if (block.type === "speaker") {
      for (const child of block.children) {
        const text = lineText(child).trim();
        if (text) return text;
      }
      continue;
    }
    const text = lineText(block).trim();
    if (text) return text;
  }
  return "";
}

export function noteSpeakerIds(note: Note) {
  const ids = new Set<string>();
  for (const block of note.blocks) {
    if (block.type === "speaker") ids.add(block.speakerId);
  }
  return [...ids];
}

export function detectTrailingRef(inlines: NoteInline[], locale: Locale) {
  let text = "";
  for (const part of inlines) {
    if (part.type === "text") text += part.text;
    else text = "";
  }
  const trimmed = text.replace(/\s+$/, "");
  if (trimmed.length < 4) return null;
  const window = trimmed.slice(Math.max(0, trimmed.length - 56));
  const offset = trimmed.length - window.length;
  const starts = [0];
  for (let i = 1; i < window.length; i++) {
    if (/\s/.test(window[i - 1]!) && !/\s/.test(window[i]!)) starts.push(i);
  }
  for (let i = starts.length - 1; i >= 0; i--) {
    const start = starts[i]!;
    const candidate = window.slice(start);
    const passage = parseReference(candidate, locale);
    if (passage?.verseStart) {
      return { passage, start: offset + start, length: candidate.trimEnd().length };
    }
  }
  return null;
}

export function replaceTrailingWithRef(inlines: NoteInline[], start: number, passage: Passage): NoteInline[] {
  const next: NoteInline[] = [];
  let seen = 0;
  let cut = false;
  for (const part of inlines) {
    if (part.type === "ref") {
      if (cut) continue;
      next.push(part);
      seen = 0;
      continue;
    }
    if (cut) continue;
    const end = seen + part.text.length;
    if (end <= start) {
      next.push(part);
      seen = end;
      continue;
    }
    const keep = start - seen;
    const head = keep > 0 ? part.text.slice(0, keep) : "";
    if (head) next.push({ ...part, text: head });
    next.push(passageToRef(passage));
    cut = true;
  }
  return next.length ? next : [passageToRef(passage)];
}

export function appendPassageToBlocks(blocks: NoteBlock[], passage: Passage, speakerId: string | null): NoteBlock[] {
  const ref = passageToRef(passage);
  if (speakerId) {
    return blocks.map((block) => {
      if (block.type !== "speaker" || block.speakerId !== speakerId) return block;
      const last = block.children[block.children.length - 1];
      if (last && lineText(last).trim() === "" && last.inlines.every((part) => part.type === "text")) {
        return { ...block, children: [...block.children.slice(0, -1), { ...last, inlines: [ref] }] };
      }
      return { ...block, children: [...block.children, { id: newNoteId(), type: "p", inlines: [ref] }] };
    });
  }
  const last = blocks[blocks.length - 1];
  if (last && last.type !== "speaker" && lineText(last).trim() === "" && last.inlines.every((part) => part.type === "text")) {
    return [...blocks.slice(0, -1), { ...last, inlines: [ref] }];
  }
  return [...blocks, { id: newNoteId(), type: "p", inlines: [ref] }];
}

function asLineType(value: unknown): LineType {
  return value === "h" || value === "ul" || value === "ol" ? value : "p";
}

function cleanInlines(input: unknown): NoteInline[] {
  if (!Array.isArray(input)) return [];
  const out: NoteInline[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (row.type === "ref") {
      const bookId = typeof row.bookId === "string" ? row.bookId : "";
      const book = bookById(bookId);
      const chapter = Number(row.chapter);
      if (!book || !Number.isInteger(chapter) || chapter < 1 || chapter > book.verses.length) continue;
      const verseStart = row.verseStart == null || row.verseStart === "" ? null : Number(row.verseStart);
      const verseEnd = row.verseEnd == null || row.verseEnd === "" ? null : Number(row.verseEnd);
      out.push({
        type: "ref",
        bookId,
        chapter,
        verseStart: verseStart && Number.isInteger(verseStart) && verseStart > 0 ? verseStart : null,
        verseEnd: verseEnd && Number.isInteger(verseEnd) && verseEnd > 0 ? verseEnd : null,
      });
      continue;
    }
    const text = typeof row.text === "string" ? row.text.slice(0, 4000) : "";
    if (!text) continue;
    out.push({
      type: "text",
      text,
      bold: row.bold === true,
      italic: row.italic === true,
    });
  }
  return out;
}

function cleanLine(input: unknown): LineBlock | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const id = typeof row.id === "string" && row.id ? row.id.slice(0, 40) : newNoteId();
  return { id, type: asLineType(row.type), inlines: cleanInlines(row.inlines) };
}

export function cleanBlocks(input: unknown): NoteBlock[] {
  if (!Array.isArray(input)) return [emptyLine()];
  const out: NoteBlock[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (row.type === "speaker") {
      const speakerId = typeof row.speakerId === "string" ? row.speakerId.slice(0, 40) : "";
      if (!speakerId) continue;
      const children = Array.isArray(row.children)
        ? row.children.map(cleanLine).filter((block): block is LineBlock => Boolean(block)).slice(0, 80)
        : [emptyLine()];
      out.push({
        id: typeof row.id === "string" && row.id ? row.id.slice(0, 40) : newNoteId(),
        type: "speaker",
        speakerId,
        title: typeof row.title === "string" ? row.title.trim().slice(0, 80) : "",
        children: children.length ? children : [emptyLine()],
      });
    } else {
      const line = cleanLine(row);
      if (line) out.push(line);
    }
    if (out.length >= 200) break;
  }
  return out.length ? out : [emptyLine()];
}

export function cleanTags(input: unknown) {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const item of input) {
    if (typeof item !== "string") continue;
    const tag = item.trim().replace(/^#+/, "").slice(0, 24);
    if (tag && !out.includes(tag)) out.push(tag);
    if (out.length >= 12) break;
  }
  return out;
}

export function asNote(input: unknown): Note | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id.slice(0, 40) : "";
  if (!id) return null;
  const happenedAt =
    typeof row.happenedAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.happenedAt) ? row.happenedAt : todayKey();
  return {
    id,
    title: typeof row.title === "string" ? row.title.trim().slice(0, 80) : "",
    happenedAt,
    tags: cleanTags(row.tags),
    blocks: cleanBlocks(row.blocks),
    visibility: row.visibility === "unlisted" ? "unlisted" : "private",
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date().toISOString(),
  };
}

export function asSpeaker(input: unknown): Speaker | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id.slice(0, 40) : "";
  const name = typeof row.name === "string" ? row.name.trim().slice(0, 40) : "";
  if (!id || !name) return null;
  const color =
    typeof row.color === "string" && SPEAKER_COLORS.includes(row.color) ? row.color : SPEAKER_COLORS[0]!;
  return {
    id,
    name,
    color,
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date().toISOString(),
  };
}

export function noteMatches(note: Note, query: string, speakers: Speaker[]) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (note.title.toLowerCase().includes(q)) return true;
  if (note.tags.some((tag) => tag.toLowerCase().includes(q))) return true;
  if (note.happenedAt.includes(q)) return true;
  for (const id of noteSpeakerIds(note)) {
    const speaker = speakers.find((item) => item.id === id);
    if (speaker?.name.toLowerCase().includes(q)) return true;
  }
  if (notePreview(note).toLowerCase().includes(q)) return true;
  return false;
}
