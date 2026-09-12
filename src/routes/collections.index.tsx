import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { CollectionsPage } from "@/components/collections-page";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/collections/")({
  component: CollectionsIndexRoute,
  head: () =>
    pageHead({
      title: "Verse2Note — Coleções por tema",
      description:
        "160 listas de referências bíblicas em 14 categorias: doutrina, Jesus, vida pessoal, igreja, família e mais. Copie uma referência ou a lista toda.",
      path: "/collections",
    }),
});

function CollectionsIndexRoute() {
  const locale = useAppStore((s) => s.locale);
  const [query, setQuery] = useState("");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
      <AppHeader
        title={t(locale, "collections")}
        search={{ value: query, onChange: setQuery, placeholder: t(locale, "collectionsSearch") }}
      />
      <CollectionsPage query={query} />
    </main>
  );
}