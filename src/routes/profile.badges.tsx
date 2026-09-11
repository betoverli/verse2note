import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { BadgeGrid } from "@/components/badge-grid";
import { getMyBadges } from "@/lib/badge-stats";
import type { BadgeId } from "@/lib/badges";
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

  return (
    <>
      <AppHeader title={t(locale, "badges")} backTo="/profile" />
      <div className="flex flex-col gap-4">
        {badges.length === 0 ? <p className="text-sm text-muted">{t(locale, "badgesEmpty")}</p> : null}
        <BadgeGrid earned={badges} locale={locale} locked />
      </div>
    </>
  );
}
