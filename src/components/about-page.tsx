import { t } from "@/lib/i18n";
import { DONATE_URL } from "@/lib/donate";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

const HELP_KEYS = ["helpPick", "helpCopy", "helpList", "helpSettings", "helpInstall", "helpLimits", "helpCollections"] as const;

export function AboutPage() {
  const locale = useAppStore((s) => s.locale);

  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-3">
        <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
          {t(locale, "aboutOriginTitle")}
        </h2>
        <p className="max-w-xl text-pretty text-base leading-relaxed text-fg">{t(locale, "aboutOrigin")}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "helpTitle")}</h2>
        <ol className="max-w-xl space-y-3">
          {HELP_KEYS.map((key, i) => (
            <li key={key} className="flex gap-3 text-sm leading-relaxed text-fg">
              <span className="mt-0.5 w-5 shrink-0 font-display text-base italic text-muted">{i + 1}</span>
              <span>{t(locale, key)}</span>
            </li>
          ))}
        </ol>
      </section>

      <Link
        to="/for-ai"
        className="flex min-h-11 items-center justify-between gap-3 rounded-md bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.99]"
      >
        <span>
          <span className="block text-sm font-medium">{t(locale, "forAiTitle")}</span>
          <span className="mt-1 block text-xs text-muted">{t(locale, "helpForAi")}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted" />
      </Link>

      <section className="max-w-xl space-y-4 rounded-lg bg-surface px-5 py-6 shadow-[var(--shadow-border)]">
        <div className="space-y-2">
          <h2 className="font-display text-2xl tracking-tight text-fg italic">{t(locale, "donateTitle")}</h2>
          <p className="text-sm leading-relaxed text-muted">{t(locale, "donateLead")}</p>
        </div>
        {DONATE_URL ? (
          <Button asChild>
            <a href={DONATE_URL} target="_blank" rel="noopener noreferrer">
              {t(locale, "donateCta")}
            </a>
          </Button>
        ) : null}
      </section>
    </div>
  );
}
