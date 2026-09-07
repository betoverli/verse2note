import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { ThemeList } from "@/components/theme-list";
import { categoryById, themesInCategory } from "@/lib/bible/categories";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/collections/category/$categoryId")({
  component: CategoryRoute,
  head: ({ params }) => {
    const category = categoryById(params.categoryId);
    return {
      meta: [{ title: category ? `Verse2Note — ${category.names.pt}` : "Verse2Note" }],
    };
  },
});

function CategoryRoute() {
  const { categoryId } = Route.useParams();
  const locale = useAppStore((s) => s.locale);
  const category = categoryById(categoryId);
  if (!category) return <Navigate to="/collections" />;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
      <AppHeader
        title={category.names[locale]}
        backTo="/collections"
        backLabel={t(locale, "collections")}
      />
      <ThemeList items={themesInCategory(categoryId, locale)} from={categoryId} />
    </main>
  );
}
