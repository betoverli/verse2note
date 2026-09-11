import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { BadgeGrid } from "@/components/badge-grid";
import { ProfileAvatar } from "@/lib/avatars";
import { getPublicProfile, type PublicProfile } from "@/lib/badge-stats";
import { t } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/u/$handle")({
  component: PublicProfileRoute,
  head: ({ params }) =>
    pageHead({
      title: `Verse2Note — @${params.handle}`,
      description: `Perfil público de @${params.handle} no Verse2Note.`,
      path: `/u/${params.handle}`,
    }),
});

function PublicProfileRoute() {
  const { handle } = Route.useParams();
  const locale = useAppStore((s) => s.locale);
  const [profile, setProfile] = useState<PublicProfile | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void getPublicProfile({ data: { handle } }).then((row) => {
      if (!cancelled) setProfile(row);
    });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  const name = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") : "";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-8 px-4 pt-0 pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:px-6">
      <AppHeader title={profile ? `@${profile.handle}` : t(locale, "profile")} backTo="/" />
      {profile === undefined ? (
        <div className="h-40 rounded-lg bg-surface" aria-hidden="true" />
      ) : !profile ? (
        <p className="text-sm text-muted">{t(locale, "profileMissing")}</p>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <ProfileAvatar
            id={profile.avatarId}
            url={profile.avatarUrl}
            className="size-20 bg-elevated"
            iconClassName="size-8"
          />
          <p className="font-display text-xl italic text-fg">@{profile.handle}</p>
          {name ? <p className="text-sm text-muted">{name}</p> : null}
          <div className="mt-4 w-full space-y-3">
            <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "badges")}</h2>
            {profile.badges.length ? (
              <BadgeGrid earned={profile.badges} locale={locale} />
            ) : (
              <p className="text-sm text-muted">{t(locale, "badgesEmpty")}</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
