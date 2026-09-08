import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { UserCollectionDetail } from "@/components/user-collection-detail";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyCollection, type UserCollection } from "@/lib/user-collections";
import { t } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { useAppStore } from "@/lib/store";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/c/$id")({
  component: UserCollectionRoute,
  head: () => {
    const seo = pageHead({
      title: "Verse2Note — Coleção",
      description: "Lista pessoal de referências bíblicas.",
      path: "/c",
    });
    return { ...seo, meta: [...seo.meta, { name: "robots", content: "noindex" }] };
  },
});

function UserCollectionRoute() {
  const { id } = Route.useParams();
  const locale = useAppStore((s) => s.locale);
  const { user, isPending } = useCurrentUserState();
  const [collection, setCollection] = useState<UserCollection | null | undefined>(undefined);

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setCollection(null);
      return;
    }
    let cancelled = false;
    void getMyCollection({ data: { id } }).then((row) => {
      if (!cancelled) setCollection(row);
    });
    return () => {
      cancelled = true;
    };
  }, [id, user, isPending]);

  if (isPending || collection === undefined) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
        <AppHeader title={t(locale, "myCollections")} backTo="/collections" />
        <div className="h-40 rounded-lg bg-surface" aria-hidden="true" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
        <AppHeader title={t(locale, "myCollections")} backTo="/collections" />
        <p className="text-sm text-muted">{t(locale, "collectionLogin")}</p>
        <Button asChild>
          <Link to="/login" search={{ create: false }}>
            {t(locale, "signIn")}
          </Link>
        </Button>
      </main>
    );
  }

  if (!collection) return <Navigate to="/collections" />;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
      <AppHeader title={collection.title} backTo="/collections" />
      <UserCollectionDetail collection={collection} />
    </main>
  );
}
