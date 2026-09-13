import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Monitor, Moon, Sun } from "lucide-react";
import type { Locale } from "@/lib/bible/books";
import { bookById } from "@/lib/bible/books";
import { formatPassage, type CiteBook, type CiteSep } from "@/lib/bible/passage";
import { appById, appHasOptions, appIcon } from "@/lib/bible/apps";
import { TRANSLATIONS } from "@/lib/bible/translations";
import { clipboardDropsHtmlLinks, type CopyFormat } from "@/lib/copy-rich";
import { t, type I18nKey } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import type { Theme } from "@/lib/theme";
import { AboutPage } from "@/components/about-page";
import { BibleAppList } from "@/components/bible-app-list";
import { BibleAppOptions } from "@/components/bible-app-options";
import { Choice } from "@/components/choice";
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

function CiteFormatSection() {
  const locale = useAppStore((s) => s.locale);
  const copyLocale = useAppStore((s) => s.copyLocale);
  const citeBook = useAppStore((s) => s.citeBook);
  const citeSep = useAppStore((s) => s.citeSep);
  const setCiteBook = useAppStore((s) => s.setCiteBook);
  const setCiteSep = useAppStore((s) => s.setCiteSep);
  const john = bookById("JHN");
  const sample = john
    ? formatPassage(
        john,
        { bookId: "JHN", chapter: 3, verseStart: 16, verseEnd: 18 },
        copyLocale,
        { book: citeBook, sep: citeSep },
      )
    : "";
  return (
    <Section title={t(locale, "citeFormat")} lead={sample || t(locale, "citeFormatLead")}>
      <div className="grid grid-cols-2 gap-2">
        {(["name", "abbr"] as CiteBook[]).map((item) => (
          <Choice
            key={item}
            active={citeBook === item}
            title={t(locale, item === "name" ? "citeName" : "citeAbbr")}
            onClick={() => setCiteBook(item)}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(["colon", "dot", "comma"] as CiteSep[]).map((item) => (
          <Choice
            key={item}
            active={citeSep === item}
            title={item === "colon" ? "3:16" : item === "dot" ? "3.16" : "3,16"}
            onClick={() => setCiteSep(item)}
          />
        ))}
      </div>
    </Section>
  );
}

export function LanguageSettings() {
  const locale = useAppStore((s) => s.locale);
  const copyLocale = useAppStore((s) => s.copyLocale);
  const setLocale = useAppStore((s) => s.setLocale);
  const setCopyLocale = useAppStore((s) => s.setCopyLocale);
  return (
    <div className="flex flex-col gap-6">
      <Section title={t(locale, "uiLanguage")} lead={t(locale, "uiLanguageLead")}>
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
      <Section title={t(locale, "copyLanguage")} lead={t(locale, "copyLanguageLead")}>
        <div className="grid grid-cols-3 gap-2">
          {LOCALES.map((item) => (
            <Choice
              key={item}
              active={copyLocale === item}
              title={item.toUpperCase()}
              subtitle={t(locale, LOCALE_LABEL[item])}
              onClick={() => setCopyLocale(item)}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

export function AppearanceSettings() {
  const locale = useAppStore((s) => s.locale);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  return (
    <Section title={t(locale, "appearance")} lead={theme === "system" ? t(locale, "themeSystemHint") : undefined}>
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
  );
}

export function BibleSettings() {
  const locale = useAppStore((s) => s.locale);
  const appId = useAppStore((s) => s.appId);
  const setAppId = useAppStore((s) => s.setAppId);
  const translationId = useAppStore((s) => s.translationId);
  const preferNative = useAppStore((s) => s.preferNative);
  const copyFormat = useAppStore((s) => s.copyFormat);
  const setCopyFormat = useAppStore((s) => s.setCopyFormat);
  const [appView, setAppView] = useState<"main" | "list" | "options">("main");
  const [optionsFrom, setOptionsFrom] = useState<"main" | "list">("main");
  const app = appById(appId);
  const summary = appSummary(locale, appId, translationId, preferNative);

  useEffect(() => {
    if (appView !== "main") window.scrollTo({ top: 0, behavior: "auto" });
  }, [appView]);

  function pickApp(id: string) {
    setAppId(id);
    if (appHasOptions(appById(id))) {
      setOptionsFrom("list");
      setAppView("options");
      return;
    }
    setAppView("main");
  }

  if (appView === "options" && appHasOptions(app)) {
    return (
      <div className="flex flex-col gap-8">
        <button
          type="button"
          onClick={() => setAppView(optionsFrom)}
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

  if (appView === "list") {
    return (
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={() => setAppView("main")}
          className="flex min-h-11 w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          {t(locale, "bibleApp")}
        </button>
        <Section title={t(locale, "changeBible")}>
          <BibleAppList locale={locale} appId={appId} onSelect={pickApp} summary={summary} />
        </Section>
      </div>
    );
  }

  const extra = appHasOptions(app);

  return (
    <div className="flex flex-col gap-8">
      <Section title={t(locale, "bibleApp")}>
        <button
          type="button"
          onClick={() => {
            if (!extra) return;
            setOptionsFrom("main");
            setAppView("options");
          }}
          className="flex w-full items-start gap-3 rounded-md bg-accent px-4 py-3 text-left text-accent-fg"
        >
          <img
            src={appIcon(app.id)}
            alt=""
            width={36}
            height={36}
            draggable={false}
            className="mt-0.5 size-9 shrink-0 rounded-sm bg-elevated object-cover"
          />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{app.names[locale]}</span>
              <span className="text-xs uppercase opacity-70">
                {app.hasWeb ? t(locale, "webBadge") : null}
                {app.hasWeb && app.hasNative ? " · " : null}
                {app.hasNative ? t(locale, "nativeBadge") : null}
              </span>
            </span>
            <span className="mt-0.5 block text-xs opacity-70">{summary ?? app.blurb[locale]}</span>
          </span>
          {extra ? <span className="mt-1 text-xs opacity-80">{t(locale, "appOptions")}</span> : null}
        </button>
        <button
          type="button"
          onClick={() => setAppView("list")}
          className="flex min-h-11 w-full items-center justify-center rounded-md bg-surface text-sm font-medium text-fg shadow-[var(--shadow-border)]"
        >
          {t(locale, "changeBible")}
        </button>
      </Section>
      <CiteFormatSection />
      <Section title={t(locale, "copyFormat")} lead={clipboardDropsHtmlLinks() ? t(locale, "copyAndroidHint") : undefined}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {COPY_FORMATS.map((item) => (
            <Choice key={item} active={copyFormat === item} title={t(locale, item)} onClick={() => setCopyFormat(item)} />
          ))}
        </div>
      </Section>
    </div>
  );
}

export function HelpSettings() {
  const locale = useAppStore((s) => s.locale);
  return (
    <div className="flex flex-col gap-8">
      <Section title={t(locale, "install")} lead={t(locale, "installHint")} />
      <AboutPage />
    </div>
  );
}

export function themeLabel(locale: Locale, theme: Theme) {
  return t(locale, THEME_LABEL[theme]);
}

export function localeLabel(locale: Locale) {
  return t(locale, LOCALE_LABEL[locale]);
}

export function languagesLabel(locale: Locale, copyLocale: Locale) {
  if (locale === copyLocale) return localeLabel(locale);
  return `${locale.toUpperCase()} · ${copyLocale.toUpperCase()}`;
}
