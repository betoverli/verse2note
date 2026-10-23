import { useEffect } from "react";
import { isNativeApp } from "@/lib/native/runtime";

export function OfflineSupport() {
  useEffect(() => {
    if (isNativeApp()) return;
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
