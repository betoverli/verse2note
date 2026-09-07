import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { t } from "@/lib/i18n";
import { isAppleUa } from "@/lib/platform";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

type BackTo =
  | "/"
  | "/settings"
  | "/app"
  | "/collections"
  | "/collections/themes"
  | "/collections/category/$categoryId"
  | "/reading"
  | "/reading/all"
  | "/reading/category/$categoryId";

export function AppHeader({
  title,
  backTo,
  backParams,
  backLabel,
  trailing,
}: {
  title?: string;
  backTo?: BackTo;
  backParams?: { categoryId: string };
  backLabel?: string;
  trailing?: ReactNode;
}) {
  const locale = useAppStore((s) => s.locale);
  const [apple, setApple] = useState(false);
  useEffect(() => setApple(isAppleUa()), []);
  const BackIcon = apple ? ChevronLeft : ArrowLeft;

  return (
    <header className="app-header sticky top-0 z-20 -mx-4 bg-bg/85 px-2 pb-2 backdrop-blur-xl sm:-mx-6 sm:px-3">
      <div className="grid h-11 grid-cols-[minmax(2.75rem,1fr)_minmax(0,auto)_minmax(2.75rem,1fr)] items-center gap-1">
        <div className="justify-self-start">
          {backTo ? (
            <Button variant="ghost" size={backLabel ? "sm" : "icon"} asChild className="-ml-1 text-fg">
              {(backTo === "/collections/category/$categoryId" || backTo === "/reading/category/$categoryId") &&
              backParams ? (
                <Link to={backTo} params={backParams} aria-label={t(locale, "back")}>
                  <BackIcon className="size-5" />
                  {backLabel ? <span className="max-w-[9rem] truncate font-normal">{backLabel}</span> : null}
                </Link>
              ) : (
                <Link to={backTo} aria-label={t(locale, "back")}>
                  <BackIcon className="size-5" />
                  {backLabel ? <span className="max-w-[9rem] truncate font-normal">{backLabel}</span> : null}
                </Link>
              )}
            </Button>
          ) : null}
        </div>
        <h1 className="truncate px-1 text-center text-[17px] font-semibold tracking-tight text-fg">
          {title}
        </h1>
        <div className="justify-self-end">{trailing}</div>
      </div>
    </header>
  );
}
