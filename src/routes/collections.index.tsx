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
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 pt-0 pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:px-6">
      <AppHeader backTo="/app" />
      <h1 className="font-display text-3xl tracking-tight text-fg italic">{t(locale, "collections")}</h1>
      <CollectionsPage />
    </main>
  );
}
