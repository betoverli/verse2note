import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { ThemeList } from "@/components/theme-list";
import { searchCollections } from "@/lib/bible/collections";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/collections/themes")({
  component: AllThemesRoute,
  head: () => ({
    meta: [{ title: "Verse2Note — Temas" }],
  }),
});

function AllThemesRoute() {
  const locale = useAppStore((s) => s.locale);
  const [query, setQuery] = useState("");
  const items = useMemo(() => searchCollections(query, locale), [query, locale]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
      <AppHeader title={t(locale, "allThemes")} backTo="/collections" backLabel={t(locale, "collections")} />
      <label className="block">
        <span className="sr-only">{t(locale, "collectionsSearch")}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t(locale, "collectionsSearch")}
          className="h-11 w-full rounded-md bg-surface px-4 text-base text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/70"
        />
      </label>
      <ThemeList items={items} from="all" />
    </main>
  );
}
