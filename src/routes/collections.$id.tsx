import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { CollectionDetail } from "@/components/collection-detail";
import { collectionById } from "@/lib/bible/collections";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/collections/$id")({
  component: CollectionDetailRoute,
  head: ({ params }) => {
    const collection = collectionById(params.id);
    return {
      meta: [{ title: collection ? `Verse2Note — ${collection.names.pt}` : "Verse2Note" }],
    };
  },
});

function CollectionDetailRoute() {
  const { id } = Route.useParams();
  const locale = useAppStore((s) => s.locale);
  const collection = collectionById(id);
  if (!collection) return <Navigate to="/collections" />;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:px-6">
      <AppHeader title={collection.names[locale]} backTo="/collections" backLabel={t(locale, "collections")} />
      <CollectionDetail collection={collection} />
    </main>
  );
}
