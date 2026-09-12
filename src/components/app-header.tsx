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
  | "/profile"
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
    <header className="app-header sticky top-0 z-20 -mx-4 bg-bg px-2 pb-2 sm:-mx-6 sm:px-3">
      <div className="grid min-h-11 grid-cols-3 items-center gap-1">
        <div className="min-w-0 justify-self-start">
          {backTo ? (
            <Button
              variant="ghost"
              size={backLabel ? "sm" : "icon"}
              asChild
              className="-ml-1 max-w-full min-w-0 text-fg"
            >
              {(backTo === "/collections/category/$categoryId" || backTo === "/reading/category/$categoryId") &&
              backParams ? (
                <Link to={backTo} params={backParams} aria-label={t(locale, "back")} className="max-w-full min-w-0">
                  <BackIcon className="size-5 shrink-0" />
                  {backLabel ? <span className="min-w-0 truncate font-normal">{backLabel}</span> : null}
                </Link>
              ) : (
                <Link to={backTo} aria-label={t(locale, "back")} className="max-w-full min-w-0">
                  <BackIcon className="size-5 shrink-0" />
                  {backLabel ? <span className="min-w-0 truncate font-normal">{backLabel}</span> : null}
                </Link>
              )}
            </Button>
          ) : null}
        </div>
        <h1 className="min-w-0 truncate px-1 text-center text-[17px] leading-snug font-semibold text-fg">{title}</h1>
        <div className="min-w-0 justify-self-end">{trailing}</div>
      </div>
    </header>
  );
}
