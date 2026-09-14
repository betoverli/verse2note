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

const SECTION = new Set([
  "introducao",
  "intro",
  "introduction",
  "aplicacao",
  "application",
  "conclusao",
  "conclusion",
  "contexto",
  "context",
  "texto",
  "textos",
  "text",
  "pontos",
  "ponto",
  "oracao",
  "prayer",
  "notas",
  "nota",
  "notes",
  "note",
  "tema",
  "titulo",
  "title",
  "estudo",
  "estudo biblico",
  "resumo",
  "summary",
  "reflexao",
  "esboco",
  "outline",
  "body",
  "observacoes",
  "desenvolvimento",
  "ilustracao",
  "chamada",
  "convite",
  "encerramento",
  "abertura",
  "versiculos",
  "versiculo",
  "passagem",
  "objetivo",
  "ideia central",
  "perguntas",
  "questions",
  "question",
  "mensagem",
  "sermao",
  "licao",
  "capitulo",
  "aula",
]);

const ROLE =
  /^(?:pr\.?|pastor(?:a)?|rev\.?|pe\.?|padre|irmao|irma|irm\.?|hermano|hermana|brother|sister|bro\.?|sis\.?)\s+(.{2,40})$/i;

const UL_MARK = /^\s*(?:[-*+•●◦▪▫·∙➤►»]|–|—)\s+/;
const OL_MARK = /^\s*(?:\d{1,3}[.)]|\(\d{1,3}\)|[a-z][.)]|[A-Z][.)]|[ivxlcdm]+[.)]|[IVXLCDM]+[.)])\s+/;

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

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

function looksLikePerson(name: string) {
  const cleaned = name.replace(/[.:：—–-]+$/g, "").trim();
  if (cleaned.length < 3 || cleaned.length > 40) return false;
  if (SECTION.has(fold(cleaned))) return false;
  if (/\b(estudo|capitulo|licao|sermao|mensagem|aula|tema|notas?|biblico)\b/i.test(fold(cleaned))) return false;
  const words = cleaned.split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;
  const particle = /^(da|de|do|dos|das|del|von|van|e)$/i;
  return words.every((word) => particle.test(word) || /^[\p{Lu}][\p{L}'’-]*$/u.test(word));
}

function isHeadingText(value: string) {
  const plain = value.replace(/[:：]\s*$/, "").trim();
  if (plain.length < 2 || plain.length > 70) return false;
  if (SECTION.has(fold(plain))) return true;
  if (/^[IVXLCDM]+\.\s+\S/.test(plain)) return true;
  const letters = plain.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letters.length >= 4 && letters === letters.toUpperCase() && /[A-ZÀ-ÿ]/.test(letters)) return true;
  return false;
}

function speakerCandidate(line: string, locale: Locale, existing: Speaker[]): string | null {
  const trimmed = line.replace(/^#+\s*/, "").trim();
  if (trimmed.length < 2 || trimmed.length > 48) return null;
  if (UL_MARK.test(trimmed) || OL_MARK.test(trimmed)) return null;
  if (scanReferences(trimmed, locale).length) return null;
  const at = trimmed.match(/^@\s*(.{2,40})$/);
  if (at) return at[1]!.trim();
  const role = trimmed.match(ROLE);
  if (role) return role[1]!.replace(/[:：]\s*$/, "").trim();
  const naked = trimmed.replace(/[:：]\s*$/, "");
  const exact = existing.find((item) => fold(item.name) === fold(naked));
  if (exact) return exact.name;
  if (isHeadingText(naked)) return null;
  const labeled = trimmed.match(/^(.{3,40})\s*[:：]\s*$/);
  if (labeled && looksLikePerson(labeled[1]!)) return labeled[1]!.trim();
  return null;
}

function cleanSpeaker(name: string) {
  return name.replace(/^[@#]+\s*/, "").replace(/[:：]\s*$/, "").replace(/\s+/g, " ").trim();
}

function pickSpeaker(name: string, pool: Speaker[]): Speaker {
  const cleaned = cleanSpeaker(name);
  const hit = pool.find((item) => fold(item.name) === fold(cleaned));
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
    if (Number(m) > 12 && Number(d) <= 12) return `${y}-${d}-${m}`;
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

export function classifyLine(raw: string): { type: LineType; text: string } {
  const heading = raw.match(/^#{1,3}\s+(.+)$/);
  if (heading) return { type: "h", text: heading[1]!.replace(/[:：]\s*$/, "").trim() };
  const ul = raw.match(new RegExp(`${UL_MARK.source}(.+)$`));
  if (ul) return { type: "ul", text: ul[1]!.trim() };
  const ol = raw.match(new RegExp(`${OL_MARK.source}(.+)$`));
  if (ol) {
    const text = ol[1]!.replace(/[:：]\s*$/, "").trim();
    if (isHeadingText(text) || SECTION.has(fold(text))) return { type: "h", text };
    return { type: "ol", text: ol[1]!.trim() };
  }
  if (isHeadingText(raw)) return { type: "h", text: raw.trim().replace(/[:：]\s*$/, "") };
  return { type: "p", text: raw.trim() };
}

function isMark(value: string) {
  return UL_MARK.test(value) || OL_MARK.test(value) || /^#{1,3}\s/.test(value);
}

function unwrapLines(lines: string[]) {
  const out: string[] = [];
  for (const line of lines) {
    const trimmed = line.replace(/[ \t]+$/g, "");
    const prev = out[out.length - 1];
    if (
      prev &&
      trimmed.trim() &&
      !isMark(trimmed) &&
      !isMark(prev) &&
      !/[.!?:;…)"»]$/.test(prev.trim()) &&
      /^[\p{Ll}]/u.test(trimmed.trim()) &&
      !speakerCandidate(prev, "pt", [])
    ) {
      out[out.length - 1] = `${prev.trimEnd()} ${trimmed.trim()}`;
    } else {
      out.push(trimmed);
    }
  }
  return out;
}

function promoteIndented(lines: string[]) {
  return lines.map((line, index) => {
    if (!/^\s{2,}\S/.test(line) || isMark(line.trim())) return line;
    const prev = lines[index - 1]?.trim() ?? "";
    const prevKind = prev ? classifyLine(prev).type : "p";
    if (prevKind === "ul" || prevKind === "ol" || prevKind === "h") return `- ${line.trim()}`;
    return line;
  });
}

function collectSpeakers(lines: string[], locale: Locale, existing: Speaker[]) {
  const names: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const name = speakerCandidate(trimmed, locale, existing);
    if (!name) continue;
    const strong = trimmed.startsWith("@") || ROLE.test(trimmed) || existing.some((item) => fold(item.name) === fold(name));
    names.push(strong ? `!${name}` : name);
  }
  const strongCount = names.filter((name) => name.startsWith("!")).length;
  const uniquePeople = new Set(names.map((name) => fold(name.replace(/^!/, ""))));
  const allowGuess = uniquePeople.size >= 2;
  const allowed = new Set<string>();
  for (const name of names) {
    const raw = name.replace(/^!/, "");
    if (name.startsWith("!") || allowGuess) allowed.add(fold(raw));
  }
  if (strongCount === 0 && !allowGuess) allowed.clear();
  return allowed;
}

export function textToDraft(
  raw: string,
  opts: { locale: Locale; filename?: string; existing: Speaker[] },
): ImportDraft {
  const prepared = promoteIndented(
    unwrapLines(raw.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ").replace(/^[•●◦▪▫·∙](?=\S)/gm, "• ").split("\n")),
  );
  const speakers = [...opts.existing];
  const created: Speaker[] = [];
  const blocks: NoteBlock[] = [];
  let current: SpeakerBlock | null = null;
  let title = "";
  const joined = prepared.join("\n");
  const tags = parseTags(joined);
  const happenedAt = parseDate(joined) || parseDate(opts.filename ?? "") || todayKey();
  const allowedSpeakers = collectSpeakers(prepared, opts.locale, speakers);

  function pushLine(line: LineBlock) {
    if (current) {
      current.children.push(line);
      return;
    }
    blocks.push(line);
  }

  for (const rawLine of prepared) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      current = null;
      continue;
    }
    const maybeSpeaker = speakerCandidate(trimmed, opts.locale, speakers);
    if (maybeSpeaker && allowedSpeakers.has(fold(maybeSpeaker))) {
      const speaker = pickSpeaker(maybeSpeaker, speakers);
      if (!created.some((item) => item.id === speaker.id) && !opts.existing.some((item) => item.id === speaker.id)) {
        created.push(speaker);
      }
      current = { id: newNoteId(), type: "speaker", speakerId: speaker.id, title: "", children: [] };
      blocks.push(current);
      continue;
    }
    const kind = classifyLine(trimmed);
    const inlines = lineToInlines(kind.text, opts.locale);
    if (kind.type === "h") current = null;
    if (!title && kind.type === "h") {
      title = kind.text.slice(0, 80);
      pushLine(makeLine("h", inlines));
      continue;
    }
    pushLine(makeLine(kind.type, inlines));
  }

  if (!title) {
    const first = blocks.find((block): block is LineBlock => block.type !== "speaker");
    if (first) {
      const text = first.inlines.map((part) => (part.type === "text" ? part.text : "")).join("").trim();
      if (text && text.length <= 80 && !scanReferences(text, opts.locale).length) {
        title = text;
        if (first.type === "p") first.type = "h";
      }
    }
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

function inlineHtml(el: Element): string {
  let out = "";
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === 3) {
      out += node.textContent ?? "";
      continue;
    }
    if (!(node instanceof HTMLElement)) continue;
    const tag = node.tagName.toLowerCase();
    if (tag === "br") {
      out += "\n";
      continue;
    }
    if (tag === "ul" || tag === "ol" || tag === "table") continue;
    if (tag === "strong" || tag === "b") out += `**${inlineHtml(node)}**`;
    else if (tag === "em" || tag === "i") out += `*${inlineHtml(node)}*`;
    else out += inlineHtml(node);
  }
  return out.replace(/[ \t]+/g, " ").trim();
}

function walkHtml(el: Element, lines: string[]) {
  const tag = el.tagName.toLowerCase();
  if (tag === "script" || tag === "style") return;
  if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
    const depth = Math.min(Number(tag[1]) || 2, 3);
    const text = inlineHtml(el);
    if (text) lines.push(`${"#".repeat(depth)} ${text}`);
    return;
  }
  if (tag === "li") {
    const parent = el.parentElement?.tagName.toLowerCase();
    const nested = Array.from(el.children).filter((child) => child.tagName === "UL" || child.tagName === "OL");
    const clone = el.cloneNode(true) as HTMLElement;
    for (const child of Array.from(clone.children)) {
      if (child.tagName === "UL" || child.tagName === "OL") child.remove();
    }
    const text = inlineHtml(clone);
    if (parent === "ol") {
      const items = Array.from(el.parentElement?.children ?? []).filter((item) => item.tagName === "LI");
      lines.push(`${items.indexOf(el) + 1}. ${text}`);
    } else {
      lines.push(`- ${text}`);
    }
    for (const child of nested) walkHtml(child, lines);
    return;
  }
  if (tag === "ul" || tag === "ol") {
    for (const child of Array.from(el.children)) walkHtml(child, lines);
    return;
  }
  if (tag === "br") {
    lines.push("");
    return;
  }
  const nested = Array.from(el.children).some((child) =>
    /^(UL|OL|H1|H2|H3|H4|P|DIV|TABLE|LI|BLOCKQUOTE)$/.test(child.tagName),
  );
  if (nested) {
    for (const child of Array.from(el.childNodes)) {
      if (child instanceof HTMLElement) walkHtml(child, lines);
      else if (child.nodeType === 3 && child.textContent?.trim()) lines.push(child.textContent.trim());
    }
    return;
  }
  if (tag === "p" || tag === "div" || tag === "blockquote" || tag === "td" || tag === "th" || tag === "body") {
    const text = inlineHtml(el);
    if (text) {
      for (const piece of text.split("\n")) {
        if (piece.trim()) lines.push(piece.trim());
      }
    }
    return;
  }
  for (const child of Array.from(el.children)) walkHtml(child, lines);
}

export function htmlToText(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const lines: string[] = [];
  walkHtml(doc.body, lines);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
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
