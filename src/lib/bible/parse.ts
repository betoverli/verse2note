import { BOOKS, type Book, type Locale } from "./books";
import type { Passage } from "./passage";

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bookAliases(book: Book): string[] {
  const raw = [
    book.names.pt,
    book.names.en,
    book.names.es,
    book.abbr.pt,
    book.abbr.en,
    book.abbr.es,
    book.id,
    book.osis,
    book.logos,
  ];
  const extra: string[] = [];
  if (book.id === "PSA") extra.push("salmo", "psalm", "psalmo");
  if (book.id === "SNG") extra.push("cantares", "canticos", "song of solomon", "cantico");
  if (book.id === "JHN") extra.push("joao", "juan");
  return [...raw, ...extra];
}

function rankedBooks(locale: Locale): Book[] {
  const prefer = locale === "en" ? 1 : locale === "es" ? 2 : 0;
  return [...BOOKS].sort((a, b) => {
    const aLen = a.names[locale].length + a.abbr[locale].length;
    const bLen = b.names[locale].length + b.abbr[locale].length;
    return bLen - aLen || prefer;
  });
}

export function filterBooks(query: string, locale: Locale): Book[] {
  const q = fold(query);
  if (!q) return BOOKS;
  return BOOKS.filter((book) => bookAliases(book).some((alias) => fold(alias).includes(q)));
}

const REF_TAIL = /(\d+)\s*[:.]\s*(\d+)(?:\s*[–\-]\s*(\d+))?/;
const CHAPTER_TAIL = /(\d+)\s*$/;

export function parseReference(input: string, locale: Locale): Passage | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const folded = fold(trimmed);

  const numbered = folded.match(/^(1|2|3)\s+/);
  const head = numbered ? numbered[1] : "";

  let matched: Book | undefined;
  let rest = folded;

  // Prefer accent-aware João vs Jó before folding collisions.
  if (locale === "pt" && /^\s*jó\b/i.test(trimmed)) {
    matched = BOOKS.find((b) => b.id === "JOB");
    rest = fold(trimmed.replace(/^\s*jó\b/i, ""));
  }

  if (!matched) {
    for (const book of rankedBooks(locale)) {
      const aliases = bookAliases(book)
        .map(fold)
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);
      for (const alias of aliases) {
        const prefix = head && !/^\d/.test(alias) ? `${head} ${alias}` : alias;
        if (folded === prefix || folded.startsWith(`${prefix} `) || folded.startsWith(`${prefix}:`)) {
          matched = book;
          rest = folded.slice(prefix.length).trim();
          break;
        }
      }
      if (matched) break;
    }
  }

  if (!matched) return null;

  const verseMatch = rest.match(REF_TAIL);
  if (verseMatch) {
    const chapter = Number(verseMatch[1]);
    const verseStart = Number(verseMatch[2]);
    const verseEnd = verseMatch[3] ? Number(verseMatch[3]) : verseStart;
    if (chapter < 1 || chapter > matched.verses.length) return null;
    const max = matched.verses[chapter - 1] ?? 1;
    return {
      bookId: matched.id,
      chapter,
      verseStart: Math.min(verseStart, max),
      verseEnd: Math.min(Math.max(verseEnd, verseStart), max),
    };
  }

  const chapterMatch = rest.match(CHAPTER_TAIL);
  if (chapterMatch) {
    const chapter = Number(chapterMatch[1]);
    if (chapter < 1 || chapter > matched.verses.length) return null;
    return { bookId: matched.id, chapter, verseStart: null, verseEnd: null };
  }

  return { bookId: matched.id, chapter: 1, verseStart: null, verseEnd: null };
}
