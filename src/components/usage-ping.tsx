import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { pingVisit } from "@/lib/usage";

const KEY = "v2n-visit";

export function UsagePing() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useCurrentUserState();
  const last = useRef("");

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    if (last.current === pathname) return;
    last.current = pathname;
    let first = false;
    try {
      if (!sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, "1");
        first = true;
      }
    } catch {
      first = true;
    }
    void pingVisit({ data: { first, signedIn: Boolean(user) } }).catch(() => undefined);
  }, [pathname, user]);

  return null;
}
