import { Check, Copy, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { buildDeepLink } from "@/lib/bible/apps";
import { bookById, type Locale } from "@/lib/bible/books";
import { formatPassage, samePassage, type Passage } from "@/lib/bible/passage";
import { translationById } from "@/lib/bible/translations";
import { copyReferences, type CopyItem } from "@/lib/copy-rich";
import { t } from "@/lib/i18n";
import {
  deleteMyCollection,
  listMyCollections,
  updateMyCollection,
  type UserCollection,
} from "@/lib/user-collections";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function toCopyItem(
  passage: Passage,
  locale: Locale,
  appId: string,
  translationId: string,
  preferNative: boolean,
): CopyItem | null {
  const book = bookById(passage.bookId);
  const translation = translationById(translationId);
  if (!book) return null;
  const url = buildDeepLink(appId, passage, translation, preferNative);
  if (!url) return null;
  return { label: formatPassage(book, passage, locale), url };
}

export function UserCollectionDetail({ collection }: { collection: UserCollection }) {
  const locale = useAppStore((s) => s.locale);
  const appId = useAppStore((s) => s.appId);
  const translationId = useAppStore((s) => s.translationId);
  const preferNative = useAppStore((s) => s.preferNative);
  const copyFormat = useAppStore((s) => s.copyFormat);
  const remember = useAppStore((s) => s.remember);
  const setMyCollections = useAppStore((s) => s.setMyCollections);
  const navigate = useNavigate();
  const [title, setTitle] = useState(collection.title);
  const [passages, setPassages] = useState(collection.passages);
  const [copied, setCopied] = useState<"all" | string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const items = passages
    .map((item) => toCopyItem(item, locale, appId, translationId, preferNative))
    .filter((item): item is CopyItem => item != null);

  function flash(key: "all" | string) {
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  }

  function notify(message: string, mode: "success" | "error" = "success") {
    const id = mode === "success" ? toast.success(message) : toast.error(message);
    window.setTimeout(() => toast.dismiss(id), 2000);
  }

  async function persist(next: { title?: string; passages?: Passage[] }) {
    await updateMyCollection({
      data: { id: collection.id, title: next.title ?? title, passages: next.passages ?? passages },
    });
    const rows = await listMyCollections();
    setMyCollections(rows);
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

  async function onRemove(passage: Passage) {
    const next = passages.filter((item) => !samePassage(item, passage));
    setPassages(next);
    await persist({ passages: next });
  }

  async function onRename() {
    const next = title.trim();
    if (!next || next === collection.title) return;
    await persist({ title: next });
  }

  async function onDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteMyCollection({ data: { id: collection.id } });
    const rows = await listMyCollections();
    setMyCollections(rows);
    await navigate({ to: "/collections" });
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void onRename();
        }}
      >
        <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={60} />
        <Button type="submit" variant="secondary">
          {t(locale, "collectionRename")}
        </Button>
      </form>

      {passages.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">{t(locale, "collectionEmpty")}</p>
          <Button variant="secondary" asChild>
            <Link to="/app">{t(locale, "navBooks")}</Link>
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {passages.map((passage, index) => {
            const item = items[index];
            if (!item) return null;
            const key = `${passage.bookId}-${passage.chapter}-${passage.verseStart}`;
            return (
              <li key={key} className="rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-fg">{item.label}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" asChild className="size-9">
                      <a href={item.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-9"
                      onClick={() => void onCopyOne(item, passage)}
                    >
                      {copied === key ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-9 text-muted"
                      onClick={() => void onRemove(passage)}
                      aria-label={t(locale, "removeFromCollection")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        {items.length > 0 ? (
          <Button onClick={() => void onCopyAll()}>
            {copied === "all" ? t(locale, "copiedCollection") : t(locale, "copyCollection")}
          </Button>
        ) : null}
        <Button variant="ghost" className="text-muted" onClick={() => void onDelete()}>
          {confirmDelete ? t(locale, "collectionDeleteConfirm") : t(locale, "collectionDelete")}
        </Button>
      </div>
    </div>
  );
}
