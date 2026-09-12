import { useCallback, useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, useRouter } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { t } from "@/lib/i18n";
import {
  getUnreadCount,
  listNotifications,
  markNotificationsRead,
  type InboxItem,
} from "@/lib/notify";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ago(iso: string, locale: "pt" | "en" | "es") {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.max(0, Math.round(diff / 60_000));
  if (min < 1) return t(locale, "notifyNow");
  if (min < 60) return `${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.round(hours / 24)} d`;
}

export function NotifyBell() {
  const locale = useAppStore((s) => s.locale);
  const { user } = useCurrentUserState();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<InboxItem[] | null>(null);

  const refreshCount = useCallback(() => {
    if (!user) return;
    void getUnreadCount()
      .then((n) => setCount(typeof n === "number" ? n : 0))
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  useEffect(() => {
    const onFocus = () => refreshCount();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refreshCount]);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    void listNotifications()
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  if (!user) return null;

  const unread = items?.some((item) => !item.read);

  async function markAll() {
    await markNotificationsRead({ data: {} });
    setItems((list) => list?.map((item) => ({ ...item, read: true })) ?? list);
    setCount(0);
  }

  async function openItem(item: InboxItem) {
    try {
      if (!item.read) {
        await markNotificationsRead({ data: { id: item.id } });
        setItems((list) => list?.map((row) => (row.id === item.id ? { ...row, read: true } : row)) ?? list);
        setCount((n) => Math.max(0, n - 1));
      }
    } catch {
      /* still open */
    }
    setOpen(false);
    router.history.push(item.href);
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-12 text-fg [&_svg]:size-6"
          aria-label={t(locale, "notifications")}
        >
          <Bell />
          {count > 0 ? (
            <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-accent" aria-hidden />
          ) : null}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          collisionPadding={12}
          className="z-50 flex w-[min(calc(100vw-1.5rem),22rem)] max-h-[min(70dvh,28rem)] flex-col overflow-hidden rounded-lg bg-elevated shadow-[var(--shadow-border)] outline-none"
        >
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <DropdownMenu.Label className="text-xs font-medium tracking-wide text-muted uppercase">
              {t(locale, "notifications")}
            </DropdownMenu.Label>
            {unread ? (
              <button
                type="button"
                className="text-xs font-medium text-muted hover:text-fg"
                onClick={() => void markAll()}
              >
                {t(locale, "notifyMarkAll")}
              </button>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-1">
            {items == null ? (
              <div className="h-16 rounded-md bg-surface" aria-hidden />
            ) : items.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted">{t(locale, "notifyEmpty")}</p>
            ) : (
              items.map((item) => (
                <DropdownMenu.Item
                  key={item.id}
                  className={cn(
                    "flex cursor-pointer flex-col gap-0.5 rounded-md px-3 py-2.5 text-left text-fg outline-none data-[highlighted]:bg-surface",
                    !item.read && "bg-surface/60",
                  )}
                  onSelect={(event) => {
                    event.preventDefault();
                    void openItem(item);
                  }}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="shrink-0 text-xs text-muted">{ago(item.createdAt, locale)}</span>
                  </span>
                  <span className="text-sm leading-snug text-muted">{item.body}</span>
                </DropdownMenu.Item>
              ))
            )}
          </div>
          <DropdownMenu.Separator className="h-px bg-border/70" />
          <DropdownMenu.Item asChild>
            <Link
              to="/profile/notifications"
              className="mx-1 mb-1 rounded-md px-3 py-2 text-xs font-medium text-muted outline-none data-[highlighted]:bg-surface data-[highlighted]:text-fg"
            >
              {t(locale, "notifySetup")}
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
