import { useEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Notebook, User, Users } from "lucide-react";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const TABS = [
  {
    to: "/app" as const,
    key: "navBooks" as const,
    icon: BookOpen,
    tour: undefined,
    match: (path: string) =>
      path === "/app" || path.startsWith("/collections") || path.startsWith("/c/"),
  },
  {
    to: "/groups" as const,
    key: "notebookGroups" as const,
    icon: Users,
    tour: "groups",
    match: (path: string) => path === "/groups" || path.startsWith("/groups/") || path.startsWith("/notebook/g"),
  },
  {
    to: "/notebook" as const,
    key: "notebook" as const,
    icon: Notebook,
    tour: undefined,
    match: (path: string) =>
      path === "/notebook" ||
      (path.startsWith("/notebook/") && !path.startsWith("/notebook/g")) ||
      path.startsWith("/n/"),
  },
  {
    to: "/reading" as const,
    key: "reading" as const,
    icon: CalendarDays,
    tour: "reading",
    match: (path: string) => path === "/reading" || path.startsWith("/reading/") || path.startsWith("/g/"),
  },
  {
    to: "/profile" as const,
    key: "profile" as const,
    icon: User,
    tour: "settings",
    match: (path: string) => path === "/profile" || path.startsWith("/profile/"),
  },
];

export function showTabBar(pathname: string) {
  if (pathname.startsWith("/n/")) return false;
  if (pathname.startsWith("/notebook/") && !pathname.startsWith("/notebook/g")) return false;
  return (
    pathname === "/app" ||
    pathname === "/inbox" ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname.startsWith("/collections") ||
    pathname.startsWith("/c/") ||
    pathname.startsWith("/g/") ||
    pathname.startsWith("/reading") ||
    pathname === "/notebook" ||
    pathname === "/groups" ||
    pathname.startsWith("/groups/") ||
    pathname.startsWith("/notebook/g")
  );
}

export function TabBar() {
  const locale = useAppStore((s) => s.locale);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }, [pathname]);

  useEffect(() => {
    const vv = window.visualViewport;
    const sync = () => {
      const open = Boolean(vv && window.innerHeight - vv.height > 120);
      document.documentElement.classList.toggle("keyboard-open", open);
    };
    sync();
    vv?.addEventListener("resize", sync);
    return () => {
      vv?.removeEventListener("resize", sync);
      document.documentElement.classList.remove("keyboard-open");
    };
  }, []);

  return (
    <nav
      ref={ref}
      className="tab-bar fixed inset-x-0 z-40 border-t border-border/70 bg-bg/88 backdrop-blur-xl"
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
                data-tour={tab.tour}
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
