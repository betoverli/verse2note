import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookmarkPlus, ListPlus } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { t } from "@/lib/i18n";
import {
  createMyCollection,
  listMyCollections,
  type UserCollection,
} from "@/lib/user-collections";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MyCollections() {
  const locale = useAppStore((s) => s.locale);
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [items, setItems] = useState<UserCollection[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    let cancelled = false;
    void listMyCollections().then((rows) => {
      if (!cancelled) setItems(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isPending) return <div className="h-24 rounded-lg bg-surface" aria-hidden="true" />;

  if (!user) {
    return (
      <section className="space-y-3">
        <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "myCollections")}</h2>
        <Link
          to="/login"
          search={{ create: false }}
          className="flex min-h-16 items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)]"
        >
          <span className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-elevated text-muted">
              <BookmarkPlus className="size-5" />
            </span>
            <span className="text-sm">{t(locale, "collectionLogin")}</span>
          </span>
        </Link>
      </section>
    );
  }

  async function onCreate() {
    const name = title.trim();
    if (!name || busy) return;
    setBusy(true);
    const result = await createMyCollection({ data: { title: name } });
    setBusy(false);
    if (result && "ok" in result && result.ok) {
      setTitle("");
      setCreating(false);
      await navigate({ to: "/c/$id", params: { id: result.id } });
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "myCollections")}</h2>
        <button
          type="button"
          onClick={() => setCreating((open) => !open)}
          className="text-xs font-medium text-muted hover:text-fg"
        >
          {t(locale, "newCollection")}
        </button>
      </div>

      {creating ? (
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void onCreate();
          }}
        >
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t(locale, "collectionName")}
            maxLength={60}
            autoFocus
          />
          <Button type="submit" disabled={busy || !title.trim()}>
            {t(locale, "collectionSave")}
          </Button>
        </form>
      ) : null}

      {items && items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to="/c/$id"
                params={{ id: item.id }}
                className="flex min-h-14 items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.99]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-elevated text-muted">
                    <ListPlus className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {item.passages.length} {t(locale, "refs")}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
