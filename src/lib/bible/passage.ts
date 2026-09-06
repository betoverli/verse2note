import type { Book, Locale } from "./books";
import { bookById } from "./books";

export type Passage = {
  bookId: string;
  chapter: number;
  verseStart: number | null;
  verseEnd: number | null;
};

export function formatPassage(book: Book, passage: Passage, locale: Locale): string {
  const name = book.names[locale];
  const { chapter, verseStart, verseEnd } = passage;
  if (!verseStart) return `${name} ${chapter}`;
  if (!verseEnd || verseEnd === verseStart) return `${name} ${chapter}:${verseStart}`;
  const lo = Math.min(verseStart, verseEnd);
  const hi = Math.max(verseStart, verseEnd);
  return `${name} ${chapter}:${lo}–${hi}`;
}

export function formatPassageById(passage: Passage, locale: Locale): string {
  const book = bookById(passage.bookId);
  if (!book) return "";
  return formatPassage(book, passage, locale);
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
