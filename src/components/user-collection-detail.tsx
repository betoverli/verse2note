import { Check, Copy, ExternalLink, Link2, Pencil, Trash2 } from "lucide-react";
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
  remixCollection,
  updateMyCollection,
  type UserCollection,
} from "@/lib/user-collections";
import type { CollectionPassage } from "@/lib/user-collection";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/app-header";
import { SendToFriendButton } from "@/components/send-to-friend";

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

function passageKey(passage: Passage) {
  return `${passage.bookId}-${passage.chapter}-${passage.verseStart}-${passage.verseEnd}`;
}

export function CollectionPassageCards({
  passages,
  editable,
  onTitle,
  onTitleSave,
  onRemove,
}: {
  passages: CollectionPassage[];
  editable?: boolean;
  onTitle?: (passage: CollectionPassage, title: string) => void;
  onTitleSave?: (passage: CollectionPassage, title: string) => void;
  onRemove?: (passage: CollectionPassage) => void;
}) {
  const locale = useAppStore((s) => s.locale);
  const appId = useAppStore((s) => s.appId);
  const translationId = useAppStore((s) => s.translationId);
  const preferNative = useAppStore((s) => s.preferNative);
  const copyFormat = useAppStore((s) => s.copyFormat);
  const remember = useAppStore((s) => s.remember);
  const [copied, setCopied] = useState<string | null>(null);

  function flash(key: string) {
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
      flash(passageKey(passage));
      notify(t(locale, "copied"));
    } catch {
      notify(t(locale, "copy"), "error");
    }
  }

  return (
    <ul className="flex flex-col gap-2">
      {passages.map((passage) => {
        const item = toCopyItem(passage, locale, appId, translationId, preferNative);
        if (!item) return null;
        const key = passageKey(passage);
        return (
          <li key={key} className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
            {passage.title && !editable ? (
              <p className="text-pretty font-display text-lg leading-snug font-medium wrap-break-word italic text-fg">
                {passage.title}
              </p>
            ) : null}
            {editable ? (
              <textarea
                value={passage.title ?? ""}
                maxLength={80}
                rows={1}
                placeholder={t(locale, "passageTitle")}
                onChange={(event) => {
                  event.currentTarget.style.height = "auto";
                  event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
                  onTitle?.(passage, event.target.value);
                }}
                onBlur={(event) => onTitleSave?.(passage, event.target.value)}
                ref={(node) => {
                  if (!node) return;
                  node.style.height = "auto";
                  node.style.height = `${node.scrollHeight}px`;
                }}
                className="mb-1 w-full resize-none overflow-hidden bg-transparent font-display text-lg leading-snug italic text-fg outline-none placeholder:text-subtle"
              />
            ) : null}
            <div className="mt-1 flex items-center gap-1">
              <p
                className={
                  passage.title || editable
                    ? "min-w-0 flex-1 text-sm leading-snug wrap-break-word text-muted"
                    : "min-w-0 flex-1 text-sm leading-snug font-medium wrap-break-word text-fg"
                }
              >
                {item.label}
              </p>
              <div className="flex shrink-0">
                <Button size="icon" variant="ghost" asChild className="size-9">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                <Button size="icon" variant="ghost" className="size-9" onClick={() => void onCopyOne(item, passage)}>
                  {copied === key ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
                {onRemove ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-9 text-muted"
                    onClick={() => onRemove(passage)}
                    aria-label={t(locale, "removeFromCollection")}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function UserCollectionDetail({ collection }: { collection: UserCollection }) {
  const locale = useAppStore((s) => s.locale);
  const appId = useAppStore((s) => s.appId);
  const translationId = useAppStore((s) => s.translationId);
  const preferNative = useAppStore((s) => s.preferNative);
  const copyFormat = useAppStore((s) => s.copyFormat);
  const setMyCollections = useAppStore((s) => s.setMyCollections);
  const navigate = useNavigate();
  const [title, setTitle] = useState(collection.title);
  const [passages, setPassages] = useState(collection.passages);
  const [visibility, setVisibility] = useState(collection.visibility);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);

  const items = passages
    .map((item) => toCopyItem(item, locale, appId, translationId, preferNative))
    .filter((item): item is CopyItem => item != null);

  async function persist(next: {
    title?: string;
    passages?: CollectionPassage[];
    visibility?: UserCollection["visibility"];
  }) {
    await updateMyCollection({
      data: {
        id: collection.id,
        title: next.title ?? title,
        passages: next.passages ?? passages,
        visibility: next.visibility ?? visibility,
      },
    });
    const rows = await listMyCollections();
    setMyCollections(rows);
  }

  async function onCopyAll() {
    if (items.length === 0) return;
    try {
      await copyReferences(items, copyFormat);
      const id = toast.success(t(locale, "copiedCollection"));
      window.setTimeout(() => toast.dismiss(id), 2000);
    } catch {
      const id = toast.error(t(locale, "copyCollection"));
      window.setTimeout(() => toast.dismiss(id), 2000);
    }
  }

  function onTitle(passage: CollectionPassage, value: string) {
    setPassages((current) => current.map((item) => (samePassage(item, passage) ? { ...item, title: value } : item)));
  }

  function onTitleSave(passage: CollectionPassage, value: string) {
    const next = passages.map((item) => (samePassage(item, passage) ? { ...item, title: value } : item));
    setPassages(next);
    void persist({ passages: next });
  }

  async function onRemove(passage: CollectionPassage) {
    const next = passages.filter((item) => !samePassage(item, passage));
    setPassages(next);
    await persist({ passages: next });
  }

  async function onRename() {
    const next = title.trim();
    if (!next) {
      setTitle(collection.title);
      return;
    }
    if (next === collection.title) return;
    setTitle(next);
    await persist({ title: next });
  }

  async function toggleEdit() {
    if (editing) await onRename();
    setEditing((open) => !open);
    setConfirmDelete(false);
  }

  async function onShare() {
    const next = visibility === "private" ? "unlisted" : "private";
    setVisibility(next);
    await persist({ visibility: next });
  }

  async function onCopyLink() {
    if (visibility === "private") {
      setVisibility("unlisted");
      await persist({ visibility: "unlisted" });
    }
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/c/${collection.id}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
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
    <>
      <AppHeader
        title={title}
        backTo="/collections"
        titleField={
          editing ? (
            <input
              value={title}
              maxLength={60}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={() => void onRename()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void onRename();
                  (event.target as HTMLInputElement).blur();
                }
              }}
              aria-label={t(locale, "collectionName")}
              className="h-10 w-full rounded-md bg-surface px-3 text-center text-base font-semibold text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          ) : undefined
        }
        trailing={
          <Button
            variant="ghost"
            size="icon"
            className="size-12 text-fg [&_svg]:size-5"
            aria-label={t(locale, editing ? "collectionDone" : "collectionEdit")}
            onClick={() => void toggleEdit()}
          >
            {editing ? <Check /> : <Pencil />}
          </Button>
        }
      />
      <div className="flex flex-col gap-6 pb-8">
      {passages.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">{t(locale, "collectionEmpty")}</p>
          <Button variant="secondary" asChild>
            <Link to="/app">{t(locale, "navBooks")}</Link>
          </Button>
        </div>
      ) : (
        <CollectionPassageCards
          passages={passages}
          editable={editing}
          onTitle={editing ? onTitle : undefined}
          onTitleSave={editing ? onTitleSave : undefined}
          onRemove={editing ? (passage) => void onRemove(passage) : undefined}
        />
      )}

      {editing ? (
        <div className="flex flex-col gap-2">
          <Button variant="secondary" asChild>
            <Link to="/app">{t(locale, "addToCollection")}</Link>
          </Button>
          <Button variant="ghost" className="text-muted" onClick={() => void onDelete()}>
            {confirmDelete ? t(locale, "collectionDeleteConfirm") : t(locale, "collectionDelete")}
          </Button>
        </div>
      ) : (
      <div className="flex flex-col gap-2">
        {items.length > 0 ? (
          <Button onClick={() => void onCopyAll()}>{t(locale, "copyCollection")}</Button>
        ) : null}
        <Button variant="secondary" onClick={() => void onCopyLink()}>
          <Link2 className="size-4" />
          {copied ? t(locale, "collectionLinkCopied") : t(locale, "collectionCopyLink")}
        </Button>
        <SendToFriendButton kind="collection" targetId={collection.id} />
        <button type="button" onClick={() => void onShare()} className="text-center text-xs text-muted">
          {visibility === "private" ? t(locale, "collectionPrivate") : t(locale, "collectionShared")}
        </button>
      </div>
      )}
    </div>
    </>
  );
}

export function SharedCollectionView({ collection }: { collection: UserCollection }) {
  const locale = useAppStore((s) => s.locale);
  const appId = useAppStore((s) => s.appId);
  const translationId = useAppStore((s) => s.translationId);
  const preferNative = useAppStore((s) => s.preferNative);
  const copyFormat = useAppStore((s) => s.copyFormat);
  const setMyCollections = useAppStore((s) => s.setMyCollections);
  const navigate = useNavigate();
  const { user } = useCurrentUserState();
  const items = collection.passages
    .map((item) => toCopyItem(item, locale, appId, translationId, preferNative))
    .filter((item): item is CopyItem => item != null);

  async function onCopyAll() {
    if (items.length === 0) return;
    try {
      await copyReferences(items, copyFormat);
      const id = toast.success(t(locale, "copiedCollection"));
      window.setTimeout(() => toast.dismiss(id), 2000);
    } catch {
      const id = toast.error(t(locale, "copyCollection"));
      window.setTimeout(() => toast.dismiss(id), 2000);
    }
  }

  async function onRemix() {
    const result = await remixCollection({ data: { id: collection.id } });
    if (result && "ok" in result && result.ok) {
      const rows = await listMyCollections();
      setMyCollections(rows);
      await navigate({ to: "/c/$id", params: { id: result.id } });
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <CollectionPassageCards passages={collection.passages} />
      {items.length > 0 ? <Button onClick={() => void onCopyAll()}>{t(locale, "copyCollection")}</Button> : null}
      <div className="space-y-2">
        {user ? (
          <Button variant="secondary" className="w-full" onClick={() => void onRemix()}>
            {t(locale, "collectionRemix")}
          </Button>
        ) : (
          <Button variant="secondary" className="w-full" asChild>
            <Link to="/login" search={{ create: false, next: `/c/${collection.id}` }}>
              {t(locale, "collectionRemix")}
            </Link>
          </Button>
        )}
        <p className="text-center text-xs text-muted">{t(locale, "collectionRemixHint")}</p>
      </div>
    </div>
  );
}
