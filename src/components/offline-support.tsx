import { useEffect } from "react";

/**
 * Registers the app-shell service worker.
 *
 * On the website this powers offline PWA. Inside the Capacitor iOS shell the
 * WebView still loads https://verse2note.com (auth cookies / Google return),
 * so the same SW can keep the shell and notebook routes cached after the
 * first online open. Cold launch with zero cache still needs the native
 * offline.html fallback.
 */
export function OfflineSupport() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (import.meta.env.DEV && !standalone) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      /* registration is best-effort */
    });
  }, []);
  return null;
}
