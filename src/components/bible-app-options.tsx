import type { Locale } from "@/lib/bible/books";
import { appById } from "@/lib/bible/apps";
import { TRANSLATIONS } from "@/lib/bible/translations";
import { t, type I18nKey } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { OptionPicker } from "@/components/native-option-picker";

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
  const selected = TRANSLATIONS.find((item) => item.id === translationId);

  return (
    <div className="flex flex-col gap-8">
      {app.usesTranslation ? (
        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
            {t(locale, "translation")}
          </h2>
          <OptionPicker
            label={t(locale, "translation")}
            value={translationId}
            valueLabel={selected ? `${selected.abbr} · ${selected.name[locale]}` : t(locale, "translation")}
            columns={1}
            options={LOCALES.map((group) => ({
              id: `group-${group}`,
              title: t(locale, LOCALE_LABEL[group]),
              symbol: "globe",
              children: TRANSLATIONS.filter((item) => item.locale === group).map((item) => ({
                id: item.id,
                title: item.abbr,
                subtitle: item.name[locale],
                symbol: "book",
              })),
            }))}
            onChange={(id) => {
              if (id.startsWith("group-")) return;
              setTranslationId(id);
            }}
          />
        </section>
      ) : null}

      {app.hasNative && app.hasWeb ? (
        <section className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
              {t(locale, "linkStyle")}
            </h2>
            <p className="text-sm text-subtle">
              {preferNative ? t(locale, "nativeHint") : t(locale, "webHint")}
            </p>
          </div>
          <OptionPicker
            label={t(locale, "linkStyle")}
            value={preferNative ? "native" : "web"}
            valueLabel={preferNative ? t(locale, "nativeLinks") : t(locale, "webLinks")}
            columns={1}
            options={[
              {
                id: "web",
                title: t(locale, "webLinks"),
                subtitle: t(locale, "webHint"),
                symbol: "safari",
              },
              {
                id: "native",
                title: t(locale, "nativeLinks"),
                subtitle: t(locale, "nativeHint"),
                symbol: "arrow.up.forward.app",
              },
            ]}
            onChange={(id) => setPreferNative(id === "native")}
          />
        </section>
      ) : null}
    </div>
  );
}
