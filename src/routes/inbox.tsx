import { useEffect, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { listNotifications, markNotificationsRead, type InboxItem } from "@/lib/notify";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/inbox")({
  component: InboxPage,
  head: () => {
    const seo = pageHead({
      title: "Verse2Note — Avisos",
      description: "Avisos de planos, amigos e coleções.",
      path: "/inbox",
    });
    return { ...seo, meta: [...seo.meta, { name: "robots", content: "noindex" }] };
  },
});

function ago(iso: string, locale: "pt" | "en" | "es") {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.max(0, Math.round(diff / 60_000));
  if (min < 1) return t(locale, "notifyNow");
  if (min < 60) return `${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.round(hours / 24)} d`;
}

function InboxPage() {
  const locale = useAppStore((s) => s.locale);
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[] | null>(null);

  useEffect(() => {
    void listNotifications()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const unread = items?.some((item) => !item.read);

  async function markAll() {
    await markNotificationsRead({ data: {} });
    setItems((list) => list?.map((item) => ({ ...item, read: true })) ?? list);
  }

  async function open(item: InboxItem) {
    try {
      if (!item.read) {
        await markNotificationsRead({ data: { id: item.id } });
        setItems((list) => list?.map((row) => (row.id === item.id ? { ...row, read: true } : row)) ?? list);
      }
    } catch {
      /* still open */
    }
    router.history.push(item.href);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
      <AppHeader
        title={t(locale, "notifications")}
        backTo="/app"
        trailing={
          unread ? (
            <Button variant="ghost" size="sm" className="text-muted" onClick={() => void markAll()}>
              {t(locale, "notifyMarkAll")}
            </Button>
          ) : null
        }
      />
      {items == null ? (
        <div className="h-24 rounded-lg bg-surface" aria-hidden />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">{t(locale, "notifyEmpty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  void open(item);
                }}
                className={cn(
                  "flex w-full flex-col gap-1 rounded-lg bg-surface px-4 py-3 text-left text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.99]",
                  !item.read && "shadow-[var(--shadow-border-hover)]",
                )}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="shrink-0 text-xs text-muted">{ago(item.createdAt, locale)}</span>
                </span>
                <span className="text-sm leading-snug text-muted">{item.body}</span>
                {!item.read ? <span className="mt-1 size-1.5 rounded-full bg-accent" aria-hidden /> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
