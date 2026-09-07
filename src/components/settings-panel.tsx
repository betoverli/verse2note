import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Monitor, Moon, Sun } from "lucide-react";
import type { Locale } from "@/lib/bible/books";
import { appById, appHasOptions, appIcon } from "@/lib/bible/apps";
import { TRANSLATIONS } from "@/lib/bible/translations";
import { clipboardDropsHtmlLinks, type CopyFormat } from "@/lib/copy-rich";
import { t, type I18nKey } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import type { Theme } from "@/lib/theme";
import { BibleAppList } from "@/components/bible-app-list";
import { BibleAppOptions } from "@/components/bible-app-options";
import { Choice } from "@/components/choice";
import { AccountCard } from "@/components/account-card";
import { cn } from "@/lib/utils";

const LOCALES: Locale[] = ["pt", "en", "es"];
const COPY_FORMATS: CopyFormat[] = ["rich", "markdown", "plain"];
const THEMES: Theme[] = ["light", "dark", "system"];

const LOCALE_LABEL: Record<Locale, I18nKey> = {
  pt: "localePt",
  en: "localeEn",
  es: "localeEs",
};

const THEME_LABEL: Record<Theme, I18nKey> = {
  light: "themeLight",
  dark: "themeDark",
  system: "themeSystem",
};

const THEME_ICON = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

function Section({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{title}</h2>
        {lead ? <p className="text-sm text-subtle">{lead}</p> : null}
      </div>
      {children}
    </section>
  );
}

function appSummary(
  locale: Locale,
  appId: string,
  translationId: string,
  preferNative: boolean,
): string | undefined {
  const app = appById(appId);
  if (!appHasOptions(app)) return undefined;
  const parts: string[] = [];
  if (app.usesTranslation) {
    const translation = TRANSLATIONS.find((item) => item.id === translationId);
    if (translation) parts.push(translation.abbr);
  }
  if (app.hasNative && app.hasWeb) {
    parts.push(preferNative ? t(locale, "nativeBadge") : t(locale, "webBadge"));
  }
  parts.push(t(locale, "appOptions"));
  return parts.join(" · ");
}

export function SettingsPanel() {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const appId = useAppStore((s) => s.appId);
  const setAppId = useAppStore((s) => s.setAppId);
  const translationId = useAppStore((s) => s.translationId);
  const preferNative = useAppStore((s) => s.preferNative);
  const copyFormat = useAppStore((s) => s.copyFormat);
  const setCopyFormat = useAppStore((s) => s.setCopyFormat);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const [appView, setAppView] = useState<"list" | "options">("list");

  const app = appById(appId);

  useEffect(() => {
    if (appView === "options") window.scrollTo({ top: 0, behavior: "auto" });
  }, [appView]);

  function pickApp(id: string) {
    setAppId(id);
    if (appHasOptions(appById(id))) setAppView("options");
  }

  if (appView === "options" && appHasOptions(app)) {
    return (
      <div className="flex flex-col gap-8">
        <button
          type="button"
          onClick={() => setAppView("list")}
          className="flex min-h-11 w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          {t(locale, "bibleApp")}
        </button>
        <div className="flex items-center gap-3">
          <img
            src={appIcon(app.id)}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-sm bg-elevated object-cover"
          />
          <div>
            <h2 className="text-sm font-medium text-fg">{app.names[locale]}</h2>
            <p className="text-xs text-muted">{t(locale, "appOptionsLead")}</p>
          </div>
        </div>
        <BibleAppOptions locale={locale} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <Section title={t(locale, "account")} lead={t(locale, "accountLead")}>
        <AccountCard />
      </Section>

      <Section title={t(locale, "language")}>
        <div className="grid grid-cols-3 gap-2">
          {LOCALES.map((item) => (
            <Choice
              key={item}
              active={locale === item}
              title={item.toUpperCase()}
              subtitle={t(locale, LOCALE_LABEL[item])}
              onClick={() => setLocale(item)}
            />
          ))}
        </div>
      </Section>

      <Section
        title={t(locale, "appearance")}
        lead={theme === "system" ? t(locale, "themeSystemHint") : undefined}
      >
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((item) => {
            const Icon = THEME_ICON[item];
            const active = theme === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setTheme(item)}
                aria-pressed={active}
                className={cn(
                  "flex min-h-20 w-full flex-col items-center justify-center gap-2 rounded-md px-2 py-3 text-center transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.99]",
                  active
                    ? "bg-accent text-accent-fg"
                    : "bg-surface text-fg shadow-[var(--shadow-border)] hover:bg-elevated",
                )}
              >
                <Icon className="size-5" />
                <span className="text-sm font-medium">{t(locale, THEME_LABEL[item])}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t(locale, "bibleApp")}>
        <BibleAppList
          locale={locale}
          appId={appId}
          onSelect={pickApp}
          summary={appSummary(locale, appId, translationId, preferNative)}
        />
      </Section>

      <Section title={t(locale, "copyFormat")} lead={clipboardDropsHtmlLinks() ? t(locale, "copyAndroidHint") : undefined}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {COPY_FORMATS.map((item) => (
            <Choice
              key={item}
              active={copyFormat === item}
              title={t(locale, item)}
              onClick={() => setCopyFormat(item)}
            />
          ))}
        </div>
      </Section>

      <Section title={t(locale, "install")} lead={t(locale, "installHint")} />

      <Link
        to="/about"
        className="flex min-h-11 items-center justify-between rounded-md bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.99]"
      >
        <span className="text-sm font-medium">{t(locale, "aboutTitle")}</span>
        <ChevronRight className="size-4 text-muted" />
      </Link>

      <Link
        to="/for-ai"
        className="flex min-h-11 items-center justify-between rounded-md bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.99]"
      >
        <span className="text-sm font-medium">{t(locale, "forAiTitle")}</span>
        <ChevronRight className="size-4 text-muted" />
      </Link>
    </div>
  );
}
