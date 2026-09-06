import type { Locale } from "@/lib/bible/books";
import { appById } from "@/lib/bible/apps";
import { TRANSLATIONS } from "@/lib/bible/translations";
import { clipboardDropsHtmlLinks } from "@/lib/copy-rich";
import { t, type I18nKey } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Choice } from "@/components/choice";

const LOCALES: Locale[] = ["pt", "en", "es"];
const LOCALE_LABEL: Record<Locale, I18nKey> = {
  pt: "localePt",
  en: "localeEn",
  es: "localeEs",
};

export function BibleAppOptions({ locale }: { locale: Locale }) {
  const appId = useAppStore((s) => s.appId);
  const translationId = useAppStore((s) => s.translationId);
  const setTranslationId = useAppStore((s) => s.setTranslationId);
  const preferNative = useAppStore((s) => s.preferNative);
  const setPreferNative = useAppStore((s) => s.setPreferNative);
  const app = appById(appId);

  return (
    <div className="flex flex-col gap-8">
      {app.usesTranslation ? (
        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
            {t(locale, "translation")}
          </h2>
          <div className="flex flex-col gap-6">
            {LOCALES.map((group) => {
              const items = TRANSLATIONS.filter((item) => item.locale === group);
              return (
                <div key={group} className="space-y-2">
                  <p className="text-xs text-subtle">{t(locale, LOCALE_LABEL[group])}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {items.map((item) => (
                      <Choice
                        key={item.id}
                        active={translationId === item.id}
                        title={item.abbr}
                        subtitle={item.name[locale]}
                        onClick={() => setTranslationId(item.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {app.hasNative && app.hasWeb && !clipboardDropsHtmlLinks() ? (
        <section className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
              {t(locale, "linkStyle")}
            </h2>
            <p className="text-sm text-subtle">
              {preferNative ? t(locale, "nativeHint") : t(locale, "webHint")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Choice
              active={!preferNative}
              title={t(locale, "webLinks")}
              subtitle={t(locale, "webHint")}
              onClick={() => setPreferNative(false)}
            />
            <Choice
              active={preferNative}
              title={t(locale, "nativeLinks")}
              subtitle={t(locale, "nativeHint")}
              onClick={() => setPreferNative(true)}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
