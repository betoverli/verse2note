import { Check, Copy, ExternalLink, Notebook, Plus, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { appById, appIcon, buildDeepLink, buildHttpLink } from "@/lib/bible/apps";
import { bookById, type Locale } from "@/lib/bible/books";
import { formatPassage, formatPassageById, samePassage, type CiteStyle, type Passage } from "@/lib/bible/passage";
import { translationById } from "@/lib/bible/translations";
import {
  canWebShare,
  copyReferences,
  shareReferences,
  type CopyItem,
} from "@/lib/copy-rich";
import { isOwnerHandle } from "@/lib/admin";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SaveToCollectionButton } from "@/components/save-to-collection";
import { appendToToday } from "@/lib/notebook-local";

function toCopyItem(
  passage: Passage,
  locale: Locale,
  appId: string,
  translationId: string,
  preferNative: boolean,
  httpOnly: boolean,
  style?: Partial<CiteStyle>,
): CopyItem | null {
  const book = bookById(passage.bookId);
  const translation = translationById(translationId);
  if (!book) return null;
  const url = httpOnly
    ? buildHttpLink(appId, passage, translation)
    : buildDeepLink(appId, passage, translation, preferNative);
  if (!url) return null;
  return { label: formatPassage(book, passage, locale, style), url };
}

export function LinkPreview() {
  const locale = useAppStore((s) => s.locale);
  const copyLocale = useAppStore((s) => s.copyLocale);
  const notebookPreview = useAppStore((s) => s.notebookPreview);
  const handle = useAppStore((s) => s.handle);
  const showNotebook = notebookPreview || isOwnerHandle(handle);
  const citeBook = useAppStore((s) => s.citeBook);
  const citeSep = useAppStore((s) => s.citeSep);
  const appId = useAppStore((s) => s.appId);
  const translationId = useAppStore((s) => s.translationId);
  const preferNative = useAppStore((s) => s.preferNative);
  const copyFormat = useAppStore((s) => s.copyFormat);
  const bookId = useAppStore((s) => s.bookId);
  const chapter = useAppStore((s) => s.chapter);
  const verseStart = useAppStore((s) => s.verseStart);
  const verseEnd = useAppStore((s) => s.verseEnd);
  const list = useAppStore((s) => s.list);
  const remember = useAppStore((s) => s.remember);
  const addToList = useAppStore((s) => s.addToList);
  const removeFromList = useAppStore((s) => s.removeFromList);
  const clearList = useAppStore((s) => s.clearList);
  const clearPassage = useAppStore((s) => s.clearPassage);
  const applyPassage = useAppStore((s) => s.applyPassage);
  const resetSelection = useAppStore((s) => s.resetSelection);
  const [copied, setCopied] = useState<"one" | "list" | null>(null);
  const [shareReady, setShareReady] = useState(false);

  useEffect(() => {
    setShareReady(canWebShare());
  }, []);

  const passage = bookId && chapter ? { bookId, chapter, verseStart, verseEnd } : null;
  const translation = translationById(translationId);
  const app = appById(appId);
  const cite = { book: citeBook, sep: citeSep };
  const current = passage
    ? toCopyItem(passage, copyLocale, appId, translationId, preferNative, false, cite)
    : null;
  const currentShare = passage
    ? toCopyItem(passage, copyLocale, appId, translationId, preferNative, true, cite)
    : current;
  const inList = Boolean(passage && list.some((item) => samePassage(item, passage)));

  function flash(kind: "one" | "list") {
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1600);
  }

  function notify(message: string, mode: "success" | "error" | "neutral" = "success") {
    const id =
      mode === "success" ? toast.success(message) : mode === "error" ? toast.error(message) : toast(message);
    window.setTimeout(() => toast.dismiss(id), 2000);
  }

  async function onCopy() {
    if (!current || !passage) return;
    try {
      await copyReferences([current], copyFormat);
      remember(passage);
      flash("one");
      notify(t(locale, "copied"));
    } catch {
      notify(t(locale, "copy"), "error");
    }
  }

  async function onShare() {
    const item = currentShare ?? current;
    if (!item || !passage) return;
    try {
      const result = await shareReferences([item]);
      if (result === "cancelled") return;
      remember(passage);
      notify(t(locale, "shared"));
    } catch {
      notify(t(locale, "share"), "error");
    }
  }

  function onAdd() {
    if (!passage || !current) return;
    if (!addToList(passage)) {
      notify(t(locale, "inList"), "neutral");
      return;
    }
    remember(passage);
    notify(t(locale, "added"));
    resetSelection();
  }

  function listItems(httpOnly: boolean) {
    return list
      .map((item) => toCopyItem(item, copyLocale, appId, translationId, preferNative, httpOnly, cite))
      .filter((item): item is CopyItem => item != null);
  }

  async function onCopyList() {
    const items = listItems(false);
    if (items.length === 0) return;
    try {
      await copyReferences(items, copyFormat);
      flash("list");
      notify(t(locale, "copiedList"));
    } catch {
      notify(t(locale, "copyList"), "error");
    }
  }

  async function onShareList() {
    const items = listItems(true);
    if (items.length === 0) return;
    try {
      const result = await shareReferences(items);
      if (result === "cancelled") return;
      notify(t(locale, "sharedList"));
    } catch {
      notify(t(locale, "shareList"), "error");
    }
  }

  if (!current && list.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 z-30 px-3 pb-3" style={{ bottom: "var(--tab-bar-height)" }}>
      <aside
        className="pointer-events-auto mx-auto max-w-4xl rounded-xl bg-elevated p-2 shadow-[var(--shadow-border)]"
        aria-live="polite"
      >
        {list.length > 0 ? (
          <div className="pb-1">
            <div className="flex items-center justify-between gap-2 px-3 pt-2">
              <p className="text-xs font-medium tracking-wide text-muted uppercase">
                {t(locale, "list")} · {list.length}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                {shareReady ? (
                  <Button size="icon" variant="outline" className="size-9" onClick={onShareList} aria-label={t(locale, "shareList")}>
                    <Share2 />
                  </Button>
                ) : null}
                <Button size="sm" onClick={onCopyList}>
                  {copied === "list" ? <Check /> : <Copy />}
                  {copied === "list" ? t(locale, "copiedList") : t(locale, "copyList")}
                </Button>
                <SaveToCollectionButton passages={list} iconOnly />
                <Button size="icon" variant="ghost" className="size-9 text-muted" onClick={clearList} aria-label={t(locale, "clearList")}>
                  <X />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto px-2 pt-2 pb-1">
              {list.map((item) => (
                <div
                  key={`${item.bookId}-${item.chapter}-${item.verseStart}-${item.verseEnd}`}
                  className="flex shrink-0 overflow-hidden rounded-full bg-surface shadow-[var(--shadow-border)]"
                >
                  <button
                    type="button"
                    onClick={() => applyPassage(item)}
                    className="min-h-11 px-3 text-sm text-fg hover:bg-elevated"
                  >
                    {formatPassageById(item, copyLocale, cite)}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromList(item)}
                    aria-label={t(locale, "remove")}
                    className="grid size-11 place-items-center text-muted hover:text-fg"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {current ? (
          <>
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium tracking-wide text-muted uppercase">
                  {t(locale, "preview")}
                </p>
                <div className="-mr-1 flex shrink-0 items-center">
                  {passage ? <SaveToCollectionButton passages={[passage]} iconOnly /> : null}
                  {passage && showNotebook ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted"
                      onClick={() => {
                        appendToToday(passage);
                        notify(t(locale, "notebookSentToday"));
                      }}
                      aria-label={t(locale, "notebookSendToday")}
                    >
                      <Notebook />
                    </Button>
                  ) : null}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted"
                    onClick={clearPassage}
                    aria-label={t(locale, "clearList")}
                  >
                    <X />
                  </Button>
                </div>
              </div>
              <p className="mt-1 truncate font-display text-2xl leading-tight font-medium tracking-tight text-accent underline decoration-accent/30 underline-offset-4 sm:text-3xl">
                {current.label}
              </p>
              <p className="mt-1 flex items-center gap-2 truncate text-xs text-subtle">
                <img
                  src={appIcon(app.id)}
                  alt=""
                  width={16}
                  height={16}
                  draggable={false}
                  className="size-4 shrink-0 rounded-sm object-cover"
                />
                <span className="truncate">
                  {app.names[locale]}
                  {app.usesTranslation ? ` · ${translation.abbr}` : ""}
                </span>
              </p>
            </div>
            <div className="flex gap-2 p-2">
              <Button
                size="icon"
                variant={inList ? "secondary" : "outline"}
                onClick={onAdd}
                aria-label={inList ? t(locale, "inList") : t(locale, "add")}
              >
                {inList ? <Check /> : <Plus />}
              </Button>
              <Button className="min-w-0 flex-1" onClick={onCopy}>
                {copied === "one" ? <Check /> : <Copy />}
                {copied === "one" ? t(locale, "copied") : t(locale, "copy")}
              </Button>
              {shareReady ? (
                <Button size="icon" variant="secondary" onClick={onShare} aria-label={t(locale, "share")}>
                  <Share2 />
                </Button>
              ) : null}
              <Button size="icon" variant="secondary" asChild>
                <a href={current.url} target="_blank" rel="noreferrer" aria-label={t(locale, "open")}>
                  <ExternalLink />
                </a>
              </Button>
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}
