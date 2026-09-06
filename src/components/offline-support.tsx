import { useEffect } from "react";

export function OfflineSupport() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (import.meta.env.DEV && !standalone) return;
    void navigator.serviceWorker.register("/sw.js");
  }, []);
  return null;
}
