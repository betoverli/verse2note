import { NT_BOOKS, OT_BOOKS, bookById, type Book, type Locale } from "@/lib/bible/books";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { NumberGrid } from "@/components/number-grid";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

function BookButton({
  book,
  active,
  compact,
}: {
  book: Book;
  active: boolean;
  compact: boolean;
}) {
  const locale = useAppStore((s) => s.locale);
  const selectBook = useAppStore((s) => s.selectBook);
  const name = book.names[locale];
  const abbr = book.abbr[locale];
  return (
    <button
      type="button"
      onClick={() => selectBook(book.id)}
      aria-label={name}
      title={name}
      className={cn(
        "min-h-11 rounded-sm transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96]",
        compact
          ? "px-1 text-xs font-medium sm:text-sm"
          : "flex items-center justify-between gap-2 px-3 text-left",
        active
          ? "bg-accent text-accent-fg"
          : "bg-surface text-fg shadow-[var(--shadow-border)] hover:bg-elevated",
      )}
    >
      {compact ? (
        abbr
      ) : (
        <>
          <span className="truncate text-sm">{name}</span>
          <span className="shrink-0 text-xs tabular-nums opacity-60">{abbr}</span>
        </>
      )}
    </button>
  );
}

function BookGroup({
  title,
  books,
  selectedId,
  compact,
}: {
  title: string;
  books: Book[];
  selectedId: string | null;
  compact: boolean;
}) {
  if (books.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{title}</h2>
      <div
        className={cn(
          "grid gap-2",
          compact ? "grid-cols-5 sm:grid-cols-8 lg:grid-cols-10" : "grid-cols-2 lg:grid-cols-3",
        )}
      >
        {books.map((book) => (
          <BookButton key={book.id} book={book} active={book.id === selectedId} compact={compact} />
        ))}
      </div>
    </section>
  );
}

export function Picker() {
  const locale = useAppStore((s) => s.locale);
  const step = useAppStore((s) => s.step);
  const setStep = useAppStore((s) => s.setStep);
  const bookId = useAppStore((s) => s.bookId);
  const chapter = useAppStore((s) => s.chapter);
  const verseStart = useAppStore((s) => s.verseStart);
  const verseEnd = useAppStore((s) => s.verseEnd);
  const booksCompact = useAppStore((s) => s.booksCompact);
  const setBooksCompact = useAppStore((s) => s.setBooksCompact);
  const selectChapter = useAppStore((s) => s.selectChapter);
  const selectVerse = useAppStore((s) => s.selectVerse);
  const selectWholeChapter = useAppStore((s) => s.selectWholeChapter);
  const resetSelection = useAppStore((s) => s.resetSelection);

  const book = bookId ? bookById(bookId) : undefined;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
  }, [step]);

  return (
    <div className="flex flex-col gap-6" data-tour="books">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-muted">
          <button
            type="button"
            onClick={resetSelection}
            className={cn("min-h-11 rounded-sm px-2 py-1", step === "book" ? "text-fg" : "hover:text-fg")}
          >
            {t(locale, "book")}
          </button>
          {book ? (
            <>
              <span className="text-subtle">/</span>
              <button
                type="button"
                onClick={() => setStep("chapter")}
                className={cn(
                  "min-h-11 rounded-sm px-2 py-1",
                  step === "chapter" ? "text-fg" : "hover:text-fg",
                )}
              >
                {book.names[locale]}
              </button>
            </>
          ) : null}
          {book && chapter ? (
            <>
              <span className="text-subtle">/</span>
              <button
                type="button"
                onClick={() => setStep("verse")}
                className={cn(
                  "min-h-11 rounded-sm px-2 py-1",
                  step === "verse" ? "text-fg" : "hover:text-fg",
                )}
              >
                {chapter}
              </button>
            </>
          ) : null}
        </nav>

        {step === "book" ? (
          <div className="flex rounded-full bg-surface p-1 shadow-[var(--shadow-border)]">
            <button
              type="button"
              onClick={() => setBooksCompact(true)}
              aria-pressed={booksCompact}
              className={cn(
                "min-h-11 rounded-full px-3 text-xs transition-colors duration-150",
                booksCompact ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
              )}
            >
              {t(locale, "bookAbbr")}
            </button>
            <button
              type="button"
              onClick={() => setBooksCompact(false)}
              aria-pressed={!booksCompact}
              className={cn(
                "min-h-11 rounded-full px-3 text-xs transition-colors duration-150",
                !booksCompact ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
              )}
            >
              {t(locale, "bookNames")}
            </button>
          </div>
        ) : null}
      </div>

      {step === "book" ? (
        <div className="flex flex-col gap-8">
          <BookGroup title={t(locale, "ot")} books={OT_BOOKS} selectedId={bookId} compact={booksCompact} />
          <BookGroup title={t(locale, "nt")} books={NT_BOOKS} selectedId={bookId} compact={booksCompact} />
        </div>
      ) : null}

      {step === "chapter" && book ? (
        <div className="space-y-3">
          <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
            {t(locale, "chapter")}
          </h2>
          <NumberGrid
            count={book.verses.length}
            selected={chapter}
            onSelect={selectChapter}
            columns="grid-cols-5 sm:grid-cols-8 lg:grid-cols-10"
          />
        </div>
      ) : null}

      {step === "verse" && book && chapter ? (
        <VerseColumn
          count={book.verses[chapter - 1] ?? 1}
          verseStart={verseStart}
          verseEnd={verseEnd}
          onSelect={selectVerse}
          onWhole={selectWholeChapter}
          locale={locale}
        />
      ) : null}
    </div>
  );
}

function VerseColumn({
  count,
  verseStart,
  verseEnd,
  onSelect,
  onWhole,
  locale,
}: {
  count: number;
  verseStart: number | null;
  verseEnd: number | null;
  onSelect: (n: number) => void;
  onWhole: () => void;
  locale: Locale;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
          {t(locale, "verse")}
        </h2>
        <button
          type="button"
          onClick={onWhole}
          className={cn(
            "min-h-11 rounded-full px-3 py-1 text-xs transition-colors duration-150",
            verseStart == null ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
          )}
        >
          {t(locale, "wholeChapter")}
        </button>
      </div>
      <p className="text-xs text-subtle">{t(locale, "verseHint")}</p>
      <NumberGrid
        count={count}
        rangeStart={verseStart}
        rangeEnd={verseEnd}
        onSelect={onSelect}
        columns="grid-cols-5 sm:grid-cols-8 lg:grid-cols-10"
      />
    </div>
  );
}
