import { Link, useRouterState } from "@tanstack/react-router";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function VerseSectionTabs() {
  const locale = useAppStore((s) => s.locale);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const books = pathname === "/app";
  const collections = pathname === "/collections" || pathname.startsWith("/collections/");

  return (
    <div className="flex gap-2">
      <Link
        to="/app"
        className={cn(
          "min-h-9 rounded-full px-3 text-xs font-medium inline-flex items-center",
          books ? "bg-accent text-accent-fg" : "bg-surface text-muted",
        )}
      >
        {t(locale, "verseBooks")}
      </Link>
      <Link
        to="/collections"
        data-tour="collections"
        className={cn(
          "min-h-9 rounded-full px-3 text-xs font-medium inline-flex items-center",
          collections ? "bg-accent text-accent-fg" : "bg-surface text-muted",
        )}
      >
        {t(locale, "collections")}
      </Link>
    </div>
  );
}
