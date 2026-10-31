import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

/** Subtle strip when the device reports offline. Notes keep working locally. */
export function OfflineBanner() {
  const locale = useAppStore((s) => s.locale);
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="offline-banner pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-3"
      style={{ top: "max(0.5rem, env(safe-area-inset-top))" }}
    >
      <p className="max-w-md rounded-full bg-fill/95 px-3 py-1.5 text-center text-[12px] font-medium text-muted shadow-sm backdrop-blur-md">
        {t(locale, "offlineBanner")}
      </p>
    </div>
  );
}
