import { useEffect, useState } from "react";
import { getGoogleSignInEnabled } from "./google-status";

/** `false` until the server confirms both Google OAuth env vars are set. */
export function useGoogleSignInEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void getGoogleSignInEnabled()
      .then((result) => {
        if (!cancelled) setEnabled(result.enabled);
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return enabled;
}
