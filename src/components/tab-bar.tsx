import { useEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Library, Notebook, User } from "lucide-react";
import { t } from "@/lib/i18n";
import { isOwnerHandle } from "@/lib/admin";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/app" as const, key: "navBooks" as const, icon: BookOpen, match: (path: string) => path === "/app" },
  {
    to: "/collections" as const,
    key: "collections" as const,
    icon: Library,
    match: (path: string) =>
      path === "/collections" || path.startsWith("/collections/") || path.startsWith("/c/"),
  },
  {
    to: "/notebook" as const,
    key: "notebook" as const,
    icon: Notebook,
    match: (path: string) =>
      path === "/notebook" || path.startsWith("/notebook/") || path.startsWith("/n/"),
  },
  {
    to: "/reading" as const,
    key: "reading" as const,
    icon: CalendarDays,
    match: (path: string) => path === "/reading" || path.startsWith("/reading/") || path.startsWith("/g/"),
  },
  {
    to: "/profile" as const,
    key: "profile" as const,
    icon: User,
    match: (path: string) => path === "/profile" || path.startsWith("/profile/"),
  },
];

export function showTabBar(pathname: string) {
  if (pathname.startsWith("/notebook/") || pathname.startsWith("/n/")) return false;
  return (
    pathname === "/app" ||
    pathname === "/inbox" ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname.startsWith("/collections") ||
    pathname.startsWith("/c/") ||
    pathname.startsWith("/g/") ||
    pathname.startsWith("/reading") ||
    pathname === "/notebook"
  );
}

export function TabBar() {
  const locale = useAppStore((s) => s.locale);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const notebookPreview = useAppStore((s) => s.notebookPreview);
  const handle = useAppStore((s) => s.handle);
  const tabs = TABS.filter((tab) => tab.to !== "/notebook" || notebookPreview || isOwnerHandle(handle));
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const reset = () => {
      const y = window.scrollY;
      window.scrollTo(0, y + 1);
      window.scrollTo(0, y);
    };
    const t1 = window.setTimeout(reset, 50);
    const t2 = window.setTimeout(reset, 320);
    window.visualViewport?.addEventListener("resize", reset);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.visualViewport?.removeEventListener("resize", reset);
    };
  }, [pathname]);

  return (
    <nav
      ref={ref}
      className="tab-bar fixed inset-x-0 z-40 border-t border-border/70 bg-bg/88 backdrop-blur-xl"
      aria-label={t(locale, "appName")}
    >
      <ul className="mx-auto flex max-w-4xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          return (
            <li key={tab.to} className="flex-1">
              <Link
                to={tab.to}
                aria-current={active ? "page" : undefined}
                data-tour={
                  tab.to === "/collections"
                    ? "collections"
                    : tab.to === "/reading"
                      ? "reading"
                      : tab.to === "/profile"
                        ? "settings"
                        : undefined
                }
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
