import { useEffect, useState } from "react";
import { OT_BOOKS, NT_BOOKS, bookById, type Book } from "@/lib/bible/books";
import type { Passage } from "@/lib/bible/passage";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

function Cell({
  label,
  active,
  dim,
  onClick,
}: {
  label: string;
  active?: boolean;
  dim?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={
        active
          ? "h-8 rounded-md bg-accent text-[11px] font-medium tabular-nums text-accent-fg"
          : dim
            ? "h-8 rounded-md bg-accent/15 text-[11px] font-medium tabular-nums text-fg"
            : "h-8 rounded-md bg-surface text-[11px] font-medium tabular-nums text-fg"
      }
    >
      {label}
    </button>
  );
}

export function NotebookPickerSheet({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (passage: Passage) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const copyLocale = useAppStore((s) => s.copyLocale);
  const [testament, setTestament] = useState<"ot" | "nt">("ot");
  const [bookId, setBookId] = useState<string | null>(null);
  const [chapter, setChapter] = useState<number | null>(null);
  const [verseStart, setVerseStart] = useState<number | null>(null);
  const [verseEnd, setVerseEnd] = useState<number | null>(null);
  const book = bookId ? bookById(bookId) : undefined;
  const books = testament === "ot" ? OT_BOOKS : NT_BOOKS;
  const lo = verseStart != null && verseEnd != null ? Math.min(verseStart, verseEnd) : verseStart;
  const hi = verseStart != null && verseEnd != null ? Math.max(verseStart, verseEnd) : verseEnd;

  useEffect(() => {
    if (!open) return;
    setTestament("ot");
    setBookId(null);
    setChapter(null);
    setVerseStart(null);
    setVerseEnd(null);
  }, [open]);

  function pickBook(id: string) {
    setBookId(id);
    setChapter(null);
    setVerseStart(null);
    setVerseEnd(null);
  }

  function pickChapter(value: number) {
    setChapter(value);
    setVerseStart(null);
    setVerseEnd(null);
  }

  function pickVerse(verse: number) {
    if (verseStart == null || (verseStart !== verseEnd && verseEnd != null)) {
      setVerseStart(verse);
      setVerseEnd(verse);
      return;
    }
    setVerseEnd(verse);
  }

  function confirm() {
    if (!bookId || !chapter) return;
    onPick({ bookId, chapter, verseStart, verseEnd });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="flex max-h-[min(38dvh,220px)] flex-col border-t border-border/60 px-1 pb-2 pt-1">
      <div className="mb-1.5 flex items-center gap-1 text-[13px]">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => (book ? (chapter ? setChapter(null) : setBookId(null)) : onClose())}
          className="px-1 text-muted"
        >
          {t(locale, "back")}
        </button>
        <span className="min-w-0 flex-1 truncate text-center font-medium text-fg">
          {book ? (chapter ? `${book.abbr[copyLocale]} ${chapter}` : book.names[copyLocale]) : t(locale, "notebookAddRef")}
        </span>
        {book && chapter ? (
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={confirm} className="px-1 font-semibold text-accent">
            {t(locale, "notebookInsert")}
          </button>
        ) : (
          <span className="w-10" />
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!book ? (
          <>
            <div className="mb-1.5 grid grid-cols-2 gap-1 rounded-lg bg-surface p-0.5">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setTestament("ot")}
                className={testament === "ot" ? "h-7 rounded-md bg-elevated text-[11px] font-medium text-fg" : "h-7 rounded-md text-[11px] text-muted"}
              >
                {t(locale, "ot")}
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setTestament("nt")}
                className={testament === "nt" ? "h-7 rounded-md bg-elevated text-[11px] font-medium text-fg" : "h-7 rounded-md text-[11px] text-muted"}
              >
                {t(locale, "nt")}
              </button>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {books.map((item: Book) => (
                <Cell key={item.id} label={item.abbr[copyLocale]} onClick={() => pickBook(item.id)} />
              ))}
            </div>
          </>
        ) : chapter == null ? (
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: book.verses.length }, (_, i) => i + 1).map((n) => (
              <Cell key={n} label={String(n)} onClick={() => pickChapter(n)} />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-1.5 flex justify-end">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setVerseStart(null);
                  setVerseEnd(null);
                }}
                className={`h-7 rounded-full px-2.5 text-[11px] ${verseStart == null ? "bg-accent text-accent-fg" : "text-muted"}`}
              >
                {t(locale, "wholeChapter")}
              </button>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: book.verses[chapter - 1] ?? 1 }, (_, i) => i + 1).map((n) => (
                <Cell
                  key={n}
                  label={String(n)}
                  active={n === lo || n === hi}
                  dim={lo != null && hi != null && n > lo && n < hi}
                  onClick={() => pickVerse(n)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
