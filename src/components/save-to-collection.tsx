import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { BookmarkPlus } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { samePassage, type Passage } from "@/lib/bible/passage";
import { t } from "@/lib/i18n";
import {
  createMyCollection,
  listMyCollections,
  updateMyCollection,
  type UserCollection,
} from "@/lib/user-collections";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SaveToCollectionButton({
  passages,
  iconOnly = false,
}: {
  passages: Passage[];
  iconOnly?: boolean;
}) {
  const locale = useAppStore((s) => s.locale);
  const { user } = useCurrentUserState();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<UserCollection[]>([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    void listMyCollections().then(setItems);
  }, [open, user]);

  if (passages.length === 0) return null;

  const label = passages.length > 1 ? t(locale, "saveListAsCollection") : t(locale, "addToCollection");

  if (!user) {
    return (
      <Button size={iconOnly ? "icon" : "sm"} variant={iconOnly ? "ghost" : "outline"} className={iconOnly ? "size-8 text-muted" : undefined} asChild>
        <Link to="/login" search={{ create: false }} aria-label={label}>
          <BookmarkPlus />
          {iconOnly ? null : label}
        </Link>
      </Button>
    );
  }

  async function addTo(target: UserCollection) {
    if (busy) return;
    setBusy(true);
    const merged = [...target.passages];
    for (const passage of passages) {
      if (!merged.some((item) => samePassage(item, passage))) merged.push(passage);
    }
    await updateMyCollection({ data: { id: target.id, passages: merged } });
    setBusy(false);
    setOpen(false);
    const id = toast.success(t(locale, "addedToCollection"));
    window.setTimeout(() => toast.dismiss(id), 2000);
  }

  async function onCreate() {
    const name = title.trim();
    if (!name || busy) return;
    setBusy(true);
    const result = await createMyCollection({ data: { title: name, passages } });
    setBusy(false);
    if (result && "ok" in result && result.ok) {
      setTitle("");
      setOpen(false);
      const id = toast.success(t(locale, "addedToCollection"));
      window.setTimeout(() => toast.dismiss(id), 2000);
    }
  }

  const sheet =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-4 py-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))]"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)]"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-sm font-medium text-fg">{t(locale, "addToCollection")}</p>
              {items.length > 0 ? (
                <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void addTo(item)}
                        className="flex min-h-12 w-full items-center justify-between rounded-md bg-surface px-3 text-left text-sm text-fg"
                      >
                        <span>{item.title}</span>
                        <span className="text-xs text-muted">{item.passages.length}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <form
                className="mt-3 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void onCreate();
                }}
              >
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t(locale, "newCollection")}
                  maxLength={60}
                />
                <Button type="submit" disabled={busy || !title.trim()}>
                  {t(locale, "collectionSave")}
                </Button>
              </form>
              <Button variant="ghost" className="mt-2 w-full text-muted" onClick={() => setOpen(false)}>
                {t(locale, "back")}
              </Button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <Button
        size={iconOnly ? "icon" : "sm"}
        variant={iconOnly ? "ghost" : "outline"}
        className={iconOnly ? "size-8 text-muted" : undefined}
        onClick={() => setOpen(true)}
        aria-label={label}
      >
        <BookmarkPlus />
        {iconOnly ? null : label}
      </Button>
      {sheet}
    </>
  );
}
