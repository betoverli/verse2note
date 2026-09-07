import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { CollectionsPage } from "@/components/collections-page";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/collections/")({
  component: CollectionsIndexRoute,
  head: () => ({
    meta: [{ title: "Verse2Note — Coleções" }],
  }),
});

function CollectionsIndexRoute() {
  const locale = useAppStore((s) => s.locale);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
      <AppHeader title={t(locale, "collections")} />
      <CollectionsPage />
    </main>
  );
}
