import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { BadgeGrid } from "@/components/badge-grid";
import { getMyBadges } from "@/lib/badge-stats";
import { BADGE_IDS, type BadgeId } from "@/lib/badges";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/profile/badges")({
  component: ProfileBadges,
});

function ProfileBadges() {
  const locale = useAppStore((s) => s.locale);
  const [badges, setBadges] = useState<BadgeId[]>([]);

  useEffect(() => {
    void getMyBadges()
      .then(setBadges)
      .catch(() => setBadges([]));
  }, []);

  const locked = BADGE_IDS.filter((id) => !badges.includes(id));

  return (
    <>
      <AppHeader title={t(locale, "badges")} backTo="/profile" />
      <div className="flex flex-col gap-10">
        <section className="space-y-4">
          <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "badgesEarned")}</h2>
          {badges.length ? (
            <BadgeGrid earned={badges} locale={locale} />
          ) : (
            <p className="text-sm text-muted">{t(locale, "badgesEmpty")}</p>
          )}
        </section>
        {locked.length ? (
          <section className="space-y-4">
            <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "badgesLocked")}</h2>
            <BadgeGrid earned={badges} locale={locale} locked />
          </section>
        ) : null}
      </div>
    </>
  );
}