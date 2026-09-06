import { useState } from "react";
import { Check } from "lucide-react";
import type { Locale } from "@/lib/bible/books";
import { appById, appHasOptions, appIcon } from "@/lib/bible/apps";
import { t, type I18nKey } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { BibleAppList } from "@/components/bible-app-list";
import { BibleAppOptions } from "@/components/bible-app-options";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/utils";

const LOCALES: Locale[] = ["pt", "en", "es"];
const LOCALE_LABEL: Record<Locale, I18nKey> = {
  pt: "localePt",
  en: "localeEn",
  es: "localeEs",
};

export function Onboarding({ onBack }: { onBack?: () => void }) {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const appId = useAppStore((s) => s.appId);
  const setAppId = useAppStore((s) => s.setAppId);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [stage, setStage] = useState<"language" | "app" | "options">("language");

  const extra = appHasOptions(appById(appId));
  const steps = stage === "options" || (stage === "app" && extra) ? 3 : 2;
  const current = stage === "language" ? 1 : stage === "app" ? 2 : 3;
  const app = appById(appId);

  function title() {
    if (stage === "language") return t(locale, "wizardLanguage");
    if (stage === "options") return t(locale, "wizardOptions");
    return t(locale, "wizardApp");
  }

  function pickApp(id: string) {
    setAppId(id);
  }

  function nextFromApp() {
    if (appHasOptions(appById(appId))) setStage("options");
    else completeOnboarding();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:px-6">
      <Wordmark size="lg" />
      <h1 className="mt-6 font-display text-3xl tracking-tight text-fg italic">{title()}</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        {stage === "options" ? t(locale, "appOptionsLead") : t(locale, "welcomeLead")}
      </p>
      <div className="mt-4 flex items-center gap-2">
        {Array.from({ length: steps }, (_, i) => (
          <span
            key={i}
            className={cn("h-1 w-8 rounded-full", i + 1 === current ? "bg-accent" : "bg-elevated")}
          />
        ))}
        <p className="text-xs font-medium tracking-wide text-subtle uppercase">
          {current} / {steps}
        </p>
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
        {stage === "language" ? (
          <div className="grid grid-cols-1 gap-2">
            {LOCALES.map((item) => {
              const active = locale === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLocale(item)}
                  aria-pressed={active}
                  className={cn(
                    "flex min-h-14 w-full items-center justify-between gap-3 rounded-md px-4 py-3 text-left transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.99]",
                    active
                      ? "bg-accent text-accent-fg"
                      : "bg-surface text-fg shadow-[var(--shadow-border)] hover:bg-elevated",
                  )}
                >
                  <span className="flex flex-col items-start">
                    <span className="text-sm font-medium">{item.toUpperCase()}</span>
                    <span className={cn("mt-0.5 text-xs", active ? "opacity-70" : "text-muted")}>
                      {t(locale, LOCALE_LABEL[item])}
                    </span>
                  </span>
                  {active ? <Check className="size-4 shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        ) : stage === "app" ? (
          <BibleAppList locale={locale} appId={appId} onSelect={pickApp} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img
                src={appIcon(app.id)}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-sm bg-elevated object-cover"
              />
              <p className="text-sm font-medium text-fg">{app.names[locale]}</p>
            </div>
            <BibleAppOptions locale={locale} />
          </div>
        )}
      </div>

      <div className="mt-6 shrink-0">
        {stage === "language" ? (
          onBack ? (
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" size="lg" onClick={onBack}>
                {t(locale, "back")}
              </Button>
              <Button className="flex-[2]" size="lg" onClick={() => setStage("app")}>
                {t(locale, "continue")}
              </Button>
            </div>
          ) : (
            <Button className="w-full" size="lg" onClick={() => setStage("app")}>
              {t(locale, "continue")}
            </Button>
          )
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              size="lg"
              onClick={() => setStage(stage === "options" ? "app" : "language")}
            >
              {t(locale, "back")}
            </Button>
            <Button
              className="flex-[2]"
              size="lg"
              onClick={stage === "app" ? nextFromApp : completeOnboarding}
            >
              {stage === "app" && extra ? t(locale, "continue") : t(locale, "start")}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
