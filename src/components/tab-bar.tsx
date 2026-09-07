import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Library, Settings2 } from "lucide-react";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/app" as const, key: "navBooks" as const, icon: BookOpen, match: (path: string) => path === "/app" },
  {
    to: "/collections" as const,
    key: "collections" as const,
    icon: Library,
    match: (path: string) => path === "/collections" || path.startsWith("/collections/"),
  },
  { to: "/settings" as const, key: "settings" as const, icon: Settings2, match: (path: string) => path === "/settings" },
];

export function showTabBar(pathname: string) {
  return pathname === "/app" || pathname === "/settings" || pathname.startsWith("/collections");
}

export function TabBar() {
  const locale = useAppStore((s) => s.locale);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="tab-bar fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-bg/88 backdrop-blur-xl"
      aria-label={t(locale, "appName")}
    >
      <ul className="mx-auto flex max-w-4xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          return (
            <li key={tab.to} className="flex-1">
              <Link
                to={tab.to}
                aria-current={active ? "page" : undefined}
                data-tour={tab.to === "/collections" ? "collections" : tab.to === "/settings" ? "settings" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 pt-1 text-[10px] font-medium",
                  active ? "text-fg" : "text-subtle",
                )}
              >
                <Icon className={cn("size-5", active ? "stroke-[2.25]" : "stroke-[1.75]")} />
                {t(locale, tab.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
