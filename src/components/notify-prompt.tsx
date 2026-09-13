import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { t } from "@/lib/i18n";
import { enablePush, isStandalone, pushSupported } from "@/lib/push-client";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function NotifyPrompt() {
  const locale = useAppStore((s) => s.locale);
  const tourDone = useAppStore((s) => s.tourDone);
  const asked = useAppStore((s) => s.notifyPromptDone);
  const complete = useAppStore((s) => s.completeNotifyPrompt);
  const { user } = useCurrentUserState();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (asked || !tourDone || !pushSupported() || !isStandalone()) return;
    const permission = Notification.permission;
    if (permission === "denied") {
      complete();
      return;
    }
    if (permission === "granted") {
      if (user) void enablePush();
      complete();
      return;
    }
    setOpen(true);
  }, [asked, tourDone, user, complete]);

  async function allow() {
    if (busy) return;
    setBusy(true);
    try {
      if (user) await enablePush();
      else await Notification.requestPermission();
    } finally {
      complete();
      setOpen(false);
      setBusy(false);
    }
  }

  function later() {
    complete();
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-fg/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-xl bg-elevated p-5 shadow-[var(--shadow-border)]">
        <div className="mb-3 flex size-11 items-center justify-center rounded-md bg-surface text-fg">
          <Bell className="size-5" />
        </div>
        <p className="text-base font-semibold text-fg">{t(locale, "notifyPromptTitle")}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t(locale, "notifyPromptLead")}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Button className="w-full" disabled={busy} onClick={() => void allow()}>
            {t(locale, "notifyPromptAllow")}
          </Button>
          <Button className="w-full" variant="ghost" disabled={busy} onClick={later}>
            {t(locale, "notifyPromptLater")}
          </Button>
        </div>
      </div>
    </div>
  );
}
