import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { t } from "@/lib/i18n";
import { getUsageStats, type UsageStats } from "@/lib/usage";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-surface px-4 py-4 shadow-[var(--shadow-border)]">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl italic text-fg">{value}</p>
    </div>
  );
}

export function AdminPage() {
  const locale = useAppStore((s) => s.locale);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getUsageStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setDenied(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (denied) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted">{t(locale, "adminDenied")}</p>
        <Button variant="secondary" asChild>
          <Link to="/profile">{t(locale, "profile")}</Link>
        </Button>
      </div>
    );
  }

  if (!stats) return <div className="h-40 rounded-lg bg-surface" aria-hidden="true" />;

  return (
    <div className="flex flex-col gap-8 pb-8">
      <section className="grid grid-cols-2 gap-3">
        <Stat label={t(locale, "adminUsers")} value={stats.users} />
        <Stat label={t(locale, "adminUsers7")} value={stats.users7} />
        <Stat label={t(locale, "adminUsers30")} value={stats.users30} />
        <Stat label={t(locale, "adminVisitsToday")} value={stats.visitsToday} />
        <Stat label={t(locale, "adminVisits7")} value={stats.visits7} />
        <Stat label={t(locale, "adminViewsToday")} value={stats.pageviewsToday} />
        <Stat label={t(locale, "adminCollections")} value={stats.collections} />
        <Stat label={t(locale, "adminPlans")} value={stats.plans} />
      </section>

      {stats.providers.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "adminProviders")}</h2>
          <ul className="flex flex-col gap-2">
            {stats.providers.map((item) => (
              <li
                key={item.provider}
                className="flex items-center justify-between rounded-lg bg-surface px-4 py-3 text-sm text-fg shadow-[var(--shadow-border)]"
              >
                <span>{item.provider}</span>
                <span className="text-muted">{item.n}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "adminDays")}</h2>
        <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <thead className="text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">{t(locale, "adminDay")}</th>
                <th className="px-2 py-3 font-medium">{t(locale, "adminVisits")}</th>
                <th className="px-2 py-3 font-medium">{t(locale, "adminViews")}</th>
                <th className="px-4 py-3 font-medium">{t(locale, "adminSignups")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.days.map((row) => (
                <tr key={row.day} className="border-t border-border/60 text-fg">
                  <td className="px-4 py-2.5">{row.day}</td>
                  <td className="px-2 py-2.5">{row.visits}</td>
                  <td className="px-2 py-2.5">{row.pageviews}</td>
                  <td className="px-4 py-2.5">{row.signups}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
