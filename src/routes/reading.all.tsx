import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { PlanList } from "@/components/plan-list";
import { searchPlans } from "@/lib/bible/reading-plans";
import { t } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/reading/all")({
  component: AllPlansRoute,
  head: () =>
    pageHead({
      title: "Verse2Note — Todos os planos",
      description: "Lista de planos de leitura bíblica. Capítulos completos, com progresso no aparelho.",
      path: "/reading/all",
    }),
});

function AllPlansRoute() {
  const locale = useAppStore((s) => s.locale);
  const [query, setQuery] = useState("");
  const items = useMemo(() => searchPlans(query, locale), [query, locale]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
      <AppHeader title={t(locale, "allPlans")} backTo="/reading" backLabel={t(locale, "reading")} />
      <label className="block">
        <span className="sr-only">{t(locale, "readingSearch")}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t(locale, "readingSearch")}
          className="h-11 w-full rounded-md bg-surface px-4 text-base text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/70"
        />
      </label>
      <PlanList items={items} from="all" />
    </main>
  );
}
