import type { Book, Locale } from "./books";
import { bookById } from "./books";

export type Passage = {
  bookId: string;
  chapter: number;
  verseStart: number | null;
  verseEnd: number | null;
};

export type CiteBook = "name" | "abbr";
export type CiteSep = "colon" | "dot" | "comma";
export type CiteStyle = { book: CiteBook; sep: CiteSep };

const SEP: Record<CiteSep, string> = {
  colon: ":",
  dot: ".",
  comma: ",",
};

export function formatPassage(
  book: Book,
  passage: Passage,
  locale: Locale,
  style?: Partial<CiteStyle>,
): string {
  const label = style?.book === "abbr" ? book.abbr[locale] : book.names[locale];
  const sep = SEP[style?.sep ?? "colon"];
  const { chapter, verseStart, verseEnd } = passage;
  if (!verseStart) return `${label} ${chapter}`;
  if (!verseEnd || verseEnd === verseStart) return `${label} ${chapter}${sep}${verseStart}`;
  const lo = Math.min(verseStart, verseEnd);
  const hi = Math.max(verseStart, verseEnd);
  return `${label} ${chapter}${sep}${lo}–${hi}`;
}

export function formatPassageById(passage: Passage, locale: Locale, style?: Partial<CiteStyle>): string {
  const book = bookById(passage.bookId);
  if (!book) return "";
  return formatPassage(book, passage, locale, style);
}

export function verseBounds(passage: Passage): { start: number | null; end: number | null } {
  const { verseStart, verseEnd } = passage;
  if (!verseStart) return { start: null, end: null };
  if (!verseEnd) return { start: verseStart, end: verseStart };
  return {
    start: Math.min(verseStart, verseEnd),
    end: Math.max(verseStart, verseEnd),
  };
}

export function samePassage(a: Passage, b: Passage): boolean {
  const aa = verseBounds(a);
  const bb = verseBounds(b);
  return a.bookId === b.bookId && a.chapter === b.chapter && aa.start === bb.start && aa.end === bb.end;
}