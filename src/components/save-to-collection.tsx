import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookmarkPlus } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createLocalCollection, upsertLocalCollection } from "@/lib/collections-local";
import { t } from "@/lib/i18n";
import type { UserCollection } from "@/lib/user-collection";
import { samePassage, type Passage } from "@/lib/bible/passage";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetGrabber, ViewportSheet, formSheetClass } from "@/components/viewport-sheet";
import { cn } from "@/lib/utils";

export function SaveToCollectionButton({
  passages,
  iconOnly = false,
}: {
  passages: Passage[];
  iconOnly?: boolean;
}) {
  const locale = useAppStore((s) => s.locale);
  const { user } = useCurrentUserState();
  const items = useAppStore((s) => s.myCollections);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  if (passages.length === 0) return null;

  const label = passages.length > 1 ? t(locale, "saveListAsCollection") : t(locale, "addToCollection");

  if (!user) {
    return (
      <Button size={iconOnly ? "icon" : "sm"} variant={iconOnly ? "ghost" : "outline"} className={iconOnly ? "size-8 text-muted" : undefined} asChild>
        <Link to="/login" search={{ create: false, next: "/app" }} aria-label={label}>
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
    upsertLocalCollection({ ...target, passages: merged });
    setBusy(false);
    setOpen(false);
    const id = toast.success(t(locale, "addedToCollection"));
    window.setTimeout(() => toast.dismiss(id), 2000);
  }

  async function onCreate() {
    const name = title.trim();
    if (!name || busy) return;
    setBusy(true);
    createLocalCollection(name, passages);
    setTitle("");
    setOpen(false);
    setBusy(false);
  }

  const sheet = open ? (
    <ViewportSheet onClose={() => setOpen(false)}>
      <div className={cn(formSheetClass, "px-4")}>
        <SheetGrabber />
        <p className="mb-3 text-center text-[17px] font-semibold text-fg">{t(locale, "addToCollection")}</p>
        {items.length > 0 ? (
          <ul className="ios-group max-h-64 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void addTo(item)}
                  className="flex min-h-[52px] w-full items-center justify-between px-4 text-left text-[17px] text-fg active:bg-fill disabled:opacity-40"
                >
                  <span className="truncate">{item.title}</span>
                  <span className="ml-3 shrink-0 text-[15px] text-muted">{item.passages.length}</span>
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
        <button
          type="button"
          className="mt-1 flex min-h-11 w-full items-center justify-center text-[17px] font-semibold text-accent active:opacity-60"
          onClick={() => setOpen(false)}
        >
          {t(locale, "linkCancel")}
        </button>
      </div>
    </ViewportSheet>
  ) : null;

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
