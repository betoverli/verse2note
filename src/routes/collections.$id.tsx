import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { CollectionDetail } from "@/components/collection-detail";
import { categoryById } from "@/lib/bible/categories";
import { collectionById } from "@/lib/bible/collections";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/collections/$id")({
  component: CollectionDetailRoute,
  validateSearch: (search: Record<string, unknown>): { from?: string } => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  head: ({ params }) => {
    const collection = collectionById(params.id);
    return {
      meta: [{ title: collection ? `Verse2Note — ${collection.names.pt}` : "Verse2Note" }],
    };
  },
});

function CollectionDetailRoute() {
  const { id } = Route.useParams();
  const { from } = Route.useSearch();
  const locale = useAppStore((s) => s.locale);
  const collection = collectionById(id);
  if (!collection) return <Navigate to="/collections" />;

  const category = from && from !== "all" ? categoryById(from) : undefined;
  const backTo = from === "all" ? "/collections/themes" : category ? "/collections/category/$categoryId" : "/collections";
  const backParams = category ? { categoryId: category.id } : undefined;
  const backLabel = category ? category.names[locale] : from === "all" ? t(locale, "allThemes") : t(locale, "collections");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
      <AppHeader title={collection.names[locale]} backTo={backTo} backParams={backParams} backLabel={backLabel} />
      <CollectionDetail collection={collection} />
    </main>
  );
}
