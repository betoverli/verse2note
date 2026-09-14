import { scanReferences } from "@/lib/bible/parse";
import type { Locale } from "@/lib/bible/books";
import {
  emptyLine,
  newNoteId,
  passageToRef,
  SPEAKER_COLORS,
  todayKey,
  type LineBlock,
  type LineType,
  type Note,
  type NoteBlock,
  type NoteInline,
  type Speaker,
  type SpeakerBlock,
} from "@/lib/notebook";

export type ImportDraft = {
  title: string;
  happenedAt: string;
  tags: string[];
  blocks: NoteBlock[];
  speakers: Speaker[];
  refCount: number;
};

const SKIP_SPEAKER =
  /^(data|date|tema|t[íi]tulo|title|notas?|notes?|tags?|reuni[aã]o|meeting|texto|text|assunto|subject)$/i;

function markupText(value: string): NoteInline[] {
  const out: NoteInline[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value))) {
    if (match.index > last) out.push({ type: "text", text: value.slice(last, match.index) });
    if (match[1]) out.push({ type: "text", text: match[1], bold: true });
    else if (match[2]) out.push({ type: "text", text: match[2], italic: true });
    else if (match[3]) out.push({ type: "text", text: match[3], italic: true });
    last = match.index + match[0].length;
  }
  if (last < value.length) out.push({ type: "text", text: value.slice(last) });
  return out.filter((part) => part.type !== "text" || part.text);
}

function lineToInlines(line: string, locale: Locale): NoteInline[] {
  const refs = scanReferences(line, locale);
  if (!refs.length) return markupText(line);
  const out: NoteInline[] = [];
  let cursor = 0;
  for (const ref of refs) {
    if (ref.index > cursor) out.push(...markupText(line.slice(cursor, ref.index)));
    out.push(passageToRef(ref.passage));
    cursor = ref.index + ref.length;
  }
  if (cursor < line.length) out.push(...markupText(line.slice(cursor)));
  return out.filter((part) => part.type !== "text" || part.text);
}

function speakerName(line: string, locale: Locale): string | null {
  const trimmed = line.trim();
  if (trimmed.length < 2 || trimmed.length > 48) return null;
  if (/\d/.test(trimmed) && scanReferences(trimmed, locale).length) return null;
  const at = trimmed.match(/^@\s*(.{2,40})$/);
  if (at) return at[1]!.trim();
  const labeled = trimmed.match(/^(.{2,40})\s*[:：]\s*$/);
  if (labeled) return labeled[1]!.trim();
  const role = trimmed.match(
    /^(?:pr\.?|pastor(?:a)?|rev\.?|pe\.?|irmão|irmã|hermano|hermana|brother|sister)\s+(.{2,40})$/i,
  );
  if (role) return role[1]!.trim();
  return null;
}

function cleanSpeaker(name: string) {
  return name.replace(/^[@#]+\s*/, "").replace(/\s+/g, " ").trim();
}

function pickSpeaker(name: string, pool: Speaker[]): Speaker {
  const cleaned = cleanSpeaker(name);
  const hit = pool.find((item) => item.name.toLowerCase() === cleaned.toLowerCase());
  if (hit) return hit;
  const next: Speaker = {
    id: newNoteId(),
    name: cleaned,
    color: SPEAKER_COLORS[pool.length % SPEAKER_COLORS.length]!,
    updatedAt: new Date().toISOString(),
  };
  pool.push(next);
  return next;
}

function makeLine(type: LineType, inlines: NoteInline[]): LineBlock {
  return { id: newNoteId(), type, inlines: inlines.length ? inlines : [{ type: "text", text: "" }] };
}

function parseDate(text: string): string | null {
  const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const br = text.match(/\b(\d{1,2})[/.](\d{1,2})[/.](20\d{2}|\d{2})\b/);
  if (br) {
    const d = br[1]!.padStart(2, "0");
    const m = br[2]!.padStart(2, "0");
    let y = br[3]!;
    if (y.length === 2) y = `20${y}`;
    return `${y}-${m}-${d}`;
  }
  return null;
}

function parseTags(text: string) {
  const tags = new Set<string>();
  for (const match of text.matchAll(/#([\p{L}\p{N}_-]{2,24})/gu)) {
    tags.add(match[1]!.toLowerCase());
  }
  return [...tags].slice(0, 12);
}

function lineKind(raw: string): { type: LineType; text: string } {
  const heading = raw.match(/^#{1,3}\s+(.+)$/);
  if (heading) return { type: "h", text: heading[1]!.trim() };
  const ul = raw.match(/^\s*[-*•]\s+(.+)$/);
  if (ul) return { type: "ul", text: ul[1]!.trim() };
  const ol = raw.match(/^\s*\d+[.)]\s+(.+)$/);
  if (ol) return { type: "ol", text: ol[1]!.trim() };
  return { type: "p", text: raw.trim() };
}

export function textToDraft(
  raw: string,
  opts: { locale: Locale; filename?: string; existing: Speaker[] },
): ImportDraft {
  const text = raw.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ").trim();
  const speakers = [...opts.existing];
  const created: Speaker[] = [];
  const blocks: NoteBlock[] = [];
  let current: SpeakerBlock | null = null;
  let title = "";
  const tags = parseTags(text);
  const happenedAt = parseDate(text) || parseDate(opts.filename ?? "") || todayKey();

  function pushLine(line: LineBlock) {
    if (current) {
      current.children.push(line);
      return;
    }
    blocks.push(line);
  }

  for (const rawLine of text.split("\n")) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    const maybeSpeaker = speakerName(trimmed, opts.locale);
    if (maybeSpeaker && !SKIP_SPEAKER.test(cleanSpeaker(maybeSpeaker))) {
      const speaker = pickSpeaker(maybeSpeaker, speakers);
      if (!created.some((item) => item.id === speaker.id) && !opts.existing.some((item) => item.id === speaker.id)) {
        created.push(speaker);
      }
      current = { id: newNoteId(), type: "speaker", speakerId: speaker.id, title: "", children: [] };
      blocks.push(current);
      continue;
    }
    const kind = lineKind(trimmed);
    const inlines = lineToInlines(kind.text, opts.locale);
    if (!title && kind.type === "h") {
      title = kind.text.slice(0, 80);
      continue;
    }
    if (!title && kind.type === "p" && kind.text.length <= 80 && !scanReferences(kind.text, opts.locale).length) {
      title = kind.text.slice(0, 80);
      continue;
    }
    pushLine(makeLine(kind.type, inlines));
  }

  if (!title) {
    title = (opts.filename ?? "").replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " ").trim().slice(0, 80);
  }

  const noteBlocks = blocks.length ? blocks : [emptyLine()];
  let refCount = 0;
  const walk = (items: NoteBlock[]) => {
    for (const block of items) {
      if (block.type === "speaker") {
        walk(block.children);
        continue;
      }
      refCount += block.inlines.filter((part) => part.type === "ref").length;
    }
  };
  walk(noteBlocks);

  return {
    title,
    happenedAt,
    tags,
    blocks: noteBlocks,
    speakers: created,
    refCount,
  };
}

export function htmlToText(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out: string[] = [];
  const walk = (node: Node) => {
    if (node.nodeType === 3) {
      out.push(node.textContent ?? "");
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    const tag = node.tagName.toLowerCase();
    if (tag === "script" || tag === "style") return;
    if (tag === "br") {
      out.push("\n");
      return;
    }
    if (["p", "div", "h1", "h2", "h3", "h4", "li", "tr"].includes(tag)) out.push("\n");
    if (tag === "h1" || tag === "h2" || tag === "h3") out.push("## ");
    if (tag === "li") out.push("- ");
    if (tag === "strong" || tag === "b") out.push("**");
    if (tag === "em" || tag === "i") out.push("*");
    for (const child of Array.from(node.childNodes)) walk(child);
    if (tag === "strong" || tag === "b") out.push("**");
    if (tag === "em" || tag === "i") out.push("*");
    if (["p", "div", "h1", "h2", "h3", "h4", "li", "tr"].includes(tag)) out.push("\n");
  };
  walk(doc.body);
  return out.join("").replace(/\n{3,}/g, "\n\n").trim();
}

export function draftToNote(draft: ImportDraft): Note {
  return {
    id: newNoteId(),
    title: draft.title,
    happenedAt: draft.happenedAt,
    tags: draft.tags,
    blocks: draft.blocks,
    visibility: "private",
    updatedAt: new Date().toISOString(),
  };
}
