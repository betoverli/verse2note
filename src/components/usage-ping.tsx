import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { pingVisit } from "@/lib/usage";

const KEY = "v2n-visit";

export function UsagePing() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
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
    void pingVisit({ data: { first } }).catch(() => undefined);
  }, [pathname]);

  return null;
}
