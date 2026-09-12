import { useEffect, useState } from "react";
import { OT_BOOKS, NT_BOOKS, bookById, type Book } from "@/lib/bible/books";
import type { Passage } from "@/lib/bible/passage";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { NumberGrid } from "@/components/number-grid";
import { Button } from "@/components/ui/button";
import { ViewportSheet } from "@/components/viewport-sheet";

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
  const [bookId, setBookId] = useState<string | null>(null);
  const [chapter, setChapter] = useState<number | null>(null);
  const [verseStart, setVerseStart] = useState<number | null>(null);
  const [verseEnd, setVerseEnd] = useState<number | null>(null);
  const book = bookId ? bookById(bookId) : undefined;

  useEffect(() => {
    if (!open) return;
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
    if (verseStart == null) {
      setVerseStart(verse);
      setVerseEnd(verse);
      return;
    }
    if (verseEnd == null || verseStart === verseEnd) {
      setVerseEnd(verse);
      return;
    }
    setVerseStart(verse);
    setVerseEnd(verse);
  }

  function pickWhole() {
    setVerseStart(null);
    setVerseEnd(null);
  }

  function confirm() {
    if (!bookId || !chapter) return;
    onPick({ bookId, chapter, verseStart, verseEnd });
    onClose();
  }

  if (!open) return null;

  return (
    <ViewportSheet onClose={onClose}>
      <div
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-t-xl bg-elevated p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-border)] sm:rounded-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-fg">{t(locale, "notebookAddRef")}</p>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t(locale, "back")}
          </Button>
        </div>
        {!book ? (
          <div className="grid grid-cols-6 gap-1.5">
            {[...OT_BOOKS, ...NT_BOOKS].map((item: Book) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pickBook(item.id)}
                className="min-h-11 rounded-sm bg-surface px-1 text-xs font-medium text-fg shadow-[var(--shadow-border)]"
              >
                {item.abbr[copyLocale]}
              </button>
            ))}
          </div>
        ) : chapter == null ? (
          <NumberGrid count={book.verses.length} onSelect={pickChapter} />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-subtle">{t(locale, "verseHint")}</p>
              <button
                type="button"
                onClick={pickWhole}
                className={`min-h-9 rounded-full px-3 text-xs ${
                  verseStart == null ? "bg-accent text-accent-fg" : "text-muted"
                }`}
              >
                {t(locale, "wholeChapter")}
              </button>
            </div>
            <NumberGrid
              count={book.verses[chapter - 1] ?? 1}
              rangeStart={verseStart}
              rangeEnd={verseEnd}
              onSelect={pickVerse}
            />
            <Button className="w-full" onClick={confirm}>
              {t(locale, "notebookInsert")}
            </Button>
          </div>
        )}
        {book ? (
          <button
            type="button"
            className="mt-3 text-sm text-muted"
            onClick={() => (chapter ? setChapter(null) : setBookId(null))}
          >
            {t(locale, "back")}
          </button>
        ) : null}
      </div>
    </ViewportSheet>
  );
}
