import { useState } from "react";
import { createPortal } from "react-dom";
import { OT_BOOKS, NT_BOOKS, bookById, type Book } from "@/lib/bible/books";
import type { Passage } from "@/lib/bible/passage";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { NumberGrid } from "@/components/number-grid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const book = bookId ? bookById(bookId) : undefined;

  function pickBook(id: string) {
    setBookId(id);
    setChapter(null);
  }

  function pickChapter(value: number) {
    setChapter(value);
  }

  function pickVerse(verse: number) {
    if (!bookId || !chapter) return;
    onPick({ bookId, chapter, verseStart: verse, verseEnd: verse });
    setBookId(null);
    setChapter(null);
    onClose();
  }

  function pickWhole() {
    if (!bookId || !chapter) return;
    onPick({ bookId, chapter, verseStart: null, verseEnd: null });
    setBookId(null);
    setChapter(null);
    onClose();
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-fg/50 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[80dvh] w-full max-w-lg overflow-y-auto rounded-t-xl bg-elevated p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-border)] sm:rounded-xl"
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
            <Button variant="outline" className="w-full" onClick={pickWhole}>
              {t(locale, "wholeChapter")}
            </Button>
            <NumberGrid count={book.verses[chapter - 1] ?? 1} onSelect={pickVerse} />
          </div>
        )}
        {book ? (
          <button
            type="button"
            className={cn("mt-3 text-sm text-muted")}
            onClick={() => (chapter ? setChapter(null) : setBookId(null))}
          >
            {t(locale, "back")}
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
