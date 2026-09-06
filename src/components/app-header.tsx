import { Link } from "@tanstack/react-router";
import { ArrowLeft, Settings2 } from "lucide-react";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { RecentsMenu } from "@/components/recents-menu";
import { Wordmark } from "@/components/wordmark";

export function AppHeader({ backTo }: { backTo?: "/" | "/settings" | "/app" }) {
  const locale = useAppStore((s) => s.locale);

  return (
    <header className="app-header sticky top-0 z-20 -mx-4 flex items-center justify-between gap-4 bg-bg px-5 pb-3 sm:-mx-6 sm:px-7">
      <Link to="/app" className="flex min-w-0 items-baseline gap-3">
        <Wordmark />
        <span className="hidden truncate text-sm text-muted sm:inline">{t(locale, "tagline")}</span>
      </Link>
      {backTo ? (
        <Button variant="ghost" size="icon" asChild aria-label={t(locale, "back")}>
          <Link to={backTo}>
            <ArrowLeft />
          </Link>
        </Button>
      ) : (
        <div className="flex shrink-0 items-center">
          <RecentsMenu />
          <Button variant="ghost" size="icon" asChild aria-label={t(locale, "settings")}>
            <Link to="/settings">
              <Settings2 />
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}
