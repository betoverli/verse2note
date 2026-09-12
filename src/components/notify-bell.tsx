import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { t } from "@/lib/i18n";
import { getUnreadCount } from "@/lib/notify";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function NotifyBell() {
  const locale = useAppStore((s) => s.locale);
  const { user } = useCurrentUserState();
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!user) return;
    void getUnreadCount()
      .then((n) => setCount(typeof n === "number" ? n : 0))
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  if (!user) return null;

  return (
    <Button variant="ghost" size="icon" asChild className="relative size-12 text-fg [&_svg]:size-6">
      <Link to="/inbox" aria-label={t(locale, "notifications")}>
        <Bell />
        {count > 0 ? (
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-accent" aria-hidden />
        ) : null}
      </Link>
    </Button>
  );
}
