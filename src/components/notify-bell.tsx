import { useCallback, useEffect, useState } from "react";
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
import { SheetGrabber, ViewportSheet, formSheetClass } from "@/components/viewport-sheet";
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
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative size-12 text-fg [&_svg]:size-6"
        aria-label={t(locale, "notifications")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Bell />
        {count > 0 ? <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-accent" aria-hidden /> : null}
      </Button>
      {open ? (
        <ViewportSheet onClose={() => setOpen(false)}>
          <div className={cn(formSheetClass, "px-4")}>
            <SheetGrabber />
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <p className="text-[17px] font-semibold text-fg">{t(locale, "notifications")}</p>
              {unread ? (
                <button type="button" className="text-[17px] text-accent active:opacity-60" onClick={() => void markAll()}>
                  {t(locale, "notifyMarkAll")}
                </button>
              ) : null}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {items == null ? (
                <div className="h-16 rounded-[16px] bg-surface" aria-hidden />
              ) : items.length === 0 ? (
                <p className="px-1 py-6 text-center text-[15px] text-muted">{t(locale, "notifyEmpty")}</p>
              ) : (
                <ul className="ios-group">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full flex-col gap-0.5 px-4 py-3 text-left text-fg active:bg-fill",
                          !item.read && "bg-fill/50",
                        )}
                        onClick={() => void openItem(item)}
                      >
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="text-[17px] font-medium">{item.title}</span>
                          <span className="shrink-0 text-[13px] text-muted">{ago(item.createdAt, locale)}</span>
                        </span>
                        <span className="text-[15px] leading-snug text-muted">{item.body}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link
              to="/profile/notifications"
              className="mt-2 flex min-h-11 items-center justify-center text-[17px] text-accent active:opacity-60"
              onClick={() => setOpen(false)}
            >
              {t(locale, "notifySetup")}
            </Link>
          </div>
        </ViewportSheet>
      ) : null}
    </>
  );
}
