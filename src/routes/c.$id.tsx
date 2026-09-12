import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { SharedCollectionView, UserCollectionDetail } from "@/components/user-collection-detail";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getGrantedCollection, getMyCollection, getSharedCollection, type UserCollection } from "@/lib/user-collections";
import { t } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/c/$id")({
  component: UserCollectionRoute,
  head: () => {
    const seo = pageHead({
      title: "Verse2Note — Coleção",
      description: "Lista de referências bíblicas.",
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
  const [mine, setMine] = useState(false);

  useEffect(() => {
    if (isPending) return;
    let cancelled = false;
    void (async () => {
      if (user) {
        const own = await getMyCollection({ data: { id } });
        if (cancelled) return;
        if (own) {
          setCollection(own);
          setMine(true);
          return;
        }
        const granted = await getGrantedCollection({ data: { id } });
        if (cancelled) return;
        if (granted) {
          setCollection(granted);
          setMine(false);
          return;
        }
      }
      const shared = await getSharedCollection({ data: { id } });
      if (cancelled) return;
      setCollection(shared);
      setMine(false);
    })();
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

  if (!collection) {
    if (!user) {
      return (
        <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
          <AppHeader title={t(locale, "myCollections")} backTo="/collections" />
          <p className="text-sm text-muted">{t(locale, "collectionLogin")}</p>
          <Button asChild>
            <Link to="/login" search={{ create: false, next: `/c/${id}` }}>
              {t(locale, "signIn")}
            </Link>
          </Button>
        </main>
      );
    }
    return <Navigate to="/collections" />;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
      {mine ? (
        <UserCollectionDetail collection={collection} />
      ) : (
        <>
          <AppHeader title={collection.title} backTo="/collections" />
          <SharedCollectionView collection={collection} />
        </>
      )}
    </main>
  );
}
