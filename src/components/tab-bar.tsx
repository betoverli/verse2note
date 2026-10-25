import { useEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Notebook, User, Users } from "lucide-react";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { APP_TABS, type AppTabId } from "@/lib/tabs";
import { cn } from "@/lib/utils";

const ICONS: Record<AppTabId, typeof BookOpen> = {
  verses: BookOpen,
  groups: Users,
  notebook: Notebook,
  reading: CalendarDays,
  profile: User,
};

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
      className="tab-bar fixed inset-x-0 z-40"
      aria-label={t(locale, "appName")}
    >
      <ul className="mx-auto flex max-w-4xl">
        {APP_TABS.map((tab) => {
          const Icon = ICONS[tab.id];
          const active = tab.match(pathname);
          return (
            <li key={tab.to} className="flex-1">
              <Link
                to={tab.to}
                aria-current={active ? "page" : undefined}
                data-tour={tab.tour}
                className={cn(
                  "flex min-h-[49px] flex-col items-center justify-center gap-0.5 pt-1 text-[10px] font-medium tracking-[-0.01em]",
                  active ? "text-accent" : "text-muted",
                )}
              >
                <Icon className={cn("size-6", active ? "stroke-[2.25]" : "stroke-[1.75]")} />
                {t(locale, tab.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
