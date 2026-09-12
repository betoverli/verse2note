import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { buildDeepLink } from "@/lib/bible/apps";
import { SNIPPET_SOURCES, type Collection } from "@/lib/bible/collections";
import { bookById, type Locale } from "@/lib/bible/books";
import { formatPassage, type CiteStyle, type Passage } from "@/lib/bible/passage";
import { translationById } from "@/lib/bible/translations";
import { copyReferences, type CopyItem } from "@/lib/copy-rich";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

function toCopyItem(
  passage: Passage,
  locale: Locale,
  appId: string,
  translationId: string,
  preferNative: boolean,
  style?: Partial<CiteStyle>,
): CopyItem | null {
  const book = bookById(passage.bookId);
  const translation = translationById(translationId);
  if (!book) return null;
  const url = buildDeepLink(appId, passage, translation, preferNative);
  if (!url) return null;
  return { label: formatPassage(book, passage, locale, style), url };
}

export function CollectionDetail({ collection }: { collection: Collection }) {
  const locale = useAppStore((s) => s.locale);
  const copyLocale = useAppStore((s) => s.copyLocale);
  const citeBook = useAppStore((s) => s.citeBook);
  const citeSep = useAppStore((s) => s.citeSep);
  const appId = useAppStore((s) => s.appId);
  const translationId = useAppStore((s) => s.translationId);
  const preferNative = useAppStore((s) => s.preferNative);
  const copyFormat = useAppStore((s) => s.copyFormat);
  const remember = useAppStore((s) => s.remember);
  const [copied, setCopied] = useState<"all" | string | null>(null);

  const items = collection.passages
    .map((item) => toCopyItem(item, copyLocale, appId, translationId, preferNative, { book: citeBook, sep: citeSep }))
    .filter((item): item is CopyItem => item != null);

  function flash(key: "all" | string) {
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  }

  function notify(message: string, mode: "success" | "error" = "success") {
    const id = mode === "success" ? toast.success(message) : toast.error(message);
    window.setTimeout(() => toast.dismiss(id), 2000);
  }

  async function onCopyOne(item: CopyItem, passage: Passage) {
    try {
      await copyReferences([item], copyFormat);
      remember(passage);
      flash(`${passage.bookId}-${passage.chapter}-${passage.verseStart}`);
      notify(t(locale, "copied"));
    } catch {
      notify(t(locale, "copy"), "error");
    }
  }

  async function onCopyAll() {
    if (items.length === 0) return;
    try {
      await copyReferences(items, copyFormat);
      flash("all");
      notify(t(locale, "copiedCollection"));
    } catch {
      notify(t(locale, "copyCollection"), "error");
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <ul className="flex flex-col gap-2">
        {collection.passages.map((passage, index) => {
          const item = items[index];
          if (!item) return null;
          const key = `${passage.bookId}-${passage.chapter}-${passage.verseStart}`;
          return (
            <li
              key={key}
              className="flex min-h-11 items-center gap-1 rounded-md bg-surface shadow-[var(--shadow-border)]"
            >
              <div className="min-w-0 flex-1 px-4 py-3">
                <p className="font-display text-lg italic text-fg">{item.label}</p>
                {passage.snippet[copyLocale] ? (
                  <p className="mt-1 text-xs leading-relaxed text-muted">{passage.snippet[copyLocale]}</p>
                ) : null}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => void onCopyOne(item, passage)}
                aria-label={t(locale, "copy")}
              >
                {copied === key ? <Check /> : <Copy />}
              </Button>
              <Button size="icon" variant="ghost" asChild>
                <a href={item.url} target="_blank" rel="noreferrer" aria-label={t(locale, "open")}>
                  <ExternalLink />
                </a>
              </Button>
            </li>
          );
        })}
      </ul>
      <Button className="w-full" onClick={() => void onCopyAll()}>
        {copied === "all" ? <Check /> : <Copy />}
        {copied === "all" ? t(locale, "copiedCollection") : t(locale, "copyCollection")}
      </Button>
      <p className="text-center text-xs leading-relaxed text-subtle">{t(locale, "snippetNote")} {SNIPPET_SOURCES[locale]}</p>
    </div>
  );
}
