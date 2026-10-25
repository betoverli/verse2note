import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Monitor, Moon, Sun } from "lucide-react";
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
import { scrollPageTo } from "@/lib/page-scroll";

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
    <section className="space-y-2">
      <div className="space-y-1">
        <h2 className="ios-caption">{title}</h2>
        {lead ? <p className="px-4 text-[13px] leading-snug text-subtle">{lead}</p> : null}
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
      <div className="ios-segment" role="group" aria-label={t(locale, "appearance")}>
        {THEMES.map((item) => {
          const Icon = THEME_ICON[item];
          const active = theme === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setTheme(item)}
              aria-pressed={active}
              className="flex min-h-11 flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-center text-[13px] font-medium"
            >
              <Icon className="size-5" />
              <span>{t(locale, THEME_LABEL[item])}</span>
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
    if (appView !== "main") scrollPageTo(0);
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
          className="flex min-h-11 w-fit items-center gap-0.5 text-[17px] text-accent"
        >
          <ChevronLeft className="size-6" />
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
          className="flex min-h-11 w-fit items-center gap-0.5 text-[17px] text-accent"
        >
          <ChevronLeft className="size-6" />
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
        <div className="ios-group" data-inset="icon">
          <button
            type="button"
            onClick={() => {
              if (!extra) return;
              setOptionsFrom("main");
              setAppView("options");
            }}
            className="flex min-h-[60px] w-full items-center gap-3 px-4 py-2.5 text-left text-fg active:bg-fill"
          >
            <img
              src={appIcon(app.id)}
              alt=""
              width={36}
              height={36}
              draggable={false}
              className="size-9 shrink-0 rounded-[8px] bg-elevated object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[17px]">{app.names[locale]}</span>
              <span className="block truncate text-[13px] text-muted">{summary ?? app.blurb[locale]}</span>
            </span>
            {extra ? <ChevronRight className="size-4 shrink-0 text-subtle" /> : null}
          </button>
          <button
            type="button"
            onClick={() => setAppView("list")}
            className="flex min-h-11 w-full items-center px-4 text-left text-[17px] text-accent active:bg-fill"
          >
            {t(locale, "changeBible")}
          </button>
        </div>
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
