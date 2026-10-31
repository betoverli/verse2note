import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { subscribeOnlineStatus } from "@/lib/online-status";
import { useAppStore } from "@/lib/store";

/**
 * Subtle strip when the device is confirmed offline. Sits below the native
 * top chrome so it never covers ← / …. Never uses auth/API errors.
 */
export function OfflineBanner() {
  const locale = useAppStore((s) => s.locale);
  const [online, setOnline] = useState(true);

  useEffect(() => subscribeOnlineStatus(setOnline), []);

  if (online) return null;

  return (
    <div
      role="status"
      className="offline-banner pointer-events-none fixed inset-x-0 z-[45] flex justify-center px-3"
      style={{
        // Below the Liquid Glass nav (native-top-inset) and a little breathing room.
        top: "calc(var(--native-top-inset, env(safe-area-inset-top, 0px)) + 8px)",
      }}
    >
      <p className="max-w-md rounded-full bg-fill/95 px-3 py-1.5 text-center text-[12px] font-medium text-muted shadow-sm backdrop-blur-md">
        {t(locale, "offlineBanner")}
      </p>
    </div>
  );
}
