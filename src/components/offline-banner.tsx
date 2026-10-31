import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { subscribeOnlineStatus } from "@/lib/online-status";
import { useAppStore } from "@/lib/store";

/**
 * Discreet offline pill — never blocks taps or covers native chrome.
 * Confirmed via subscribeOnlineStatus (never seeds from the browser online flag).
 */
export function OfflineBanner() {
  const locale = useAppStore((s) => s.locale);
  const [online, setOnline] = useState(true);

  useEffect(() => subscribeOnlineStatus(setOnline), []);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="offline-banner pointer-events-none fixed z-[45]"
      style={{
        top: "calc(var(--native-top-inset, env(safe-area-inset-top, 0px)) + 8px)",
        right: "max(10px, env(safe-area-inset-right, 0px))",
      }}
    >
      <p
        className="inline-flex items-center gap-1.5 rounded-full bg-fill/90 px-2.5 py-1 text-[11px] font-medium text-muted shadow-sm backdrop-blur-md"
        title={t(locale, "offlineBanner")}
      >
        <WifiOff className="size-3.5 shrink-0" aria-hidden />
        <span className="sr-only">{t(locale, "offlineBanner")}</span>
        <span aria-hidden>Offline</span>
      </p>
    </div>
  );
}
