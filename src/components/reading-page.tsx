import { Link } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Clock, Library } from "lucide-react";
import { useMemo, useState, type ComponentType } from "react";
import {
  PLAN_TOTAL,
  planById,
  searchPlanCategories,
  searchPlans,
  type PlanCategory,
  type ReadingPlan,
} from "@/lib/bible/reading-plans";
import { t } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAppStore } from "@/lib/store";
import { PlanList } from "@/components/plan-list";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  duration: Clock,
  gospels: BookOpen,
  "new-testament": BookOpen,
  books: Library,
};

export function ReadingPage() {
  const locale = useAppStore((s) => s.locale);
  const activePlans = useAppStore((s) => s.activePlans);
  const { user } = useCurrentUserState();
  const [query, setQuery] = useState("");
  const categories = useMemo(() => searchPlanCategories(query, locale), [query, locale]);
  const plans = useMemo(() => searchPlans(query, locale), [query, locale]);
  const mine = useMemo(
    () => activePlans.map((id) => planById(id)).filter((plan): plan is ReadingPlan => Boolean(plan)),
    [activePlans],
  );
  const searching = query.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <label className="block">
        <span className="sr-only">{t(locale, "readingSearch")}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t(locale, "readingSearch")}
          className="h-11 w-full rounded-md bg-surface px-4 text-base text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/70"
        />
      </label>
      {searching ? (
        <>
          {categories.length > 0 ? <CategoryGrid items={categories} /> : null}
          <PlanList items={plans} />
        </>
      ) : (
        <>
          {user && mine.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "myPlans")}</h2>
              <PlanList items={mine} />
            </section>
          ) : null}
          <section className="space-y-3">
            <h2 className="text-xs font-medium tracking-wide text-muted uppercase">{t(locale, "browsePlans")}</h2>
            <CategoryGrid items={categories} />
            <Link
              to="/reading/all"
              className="flex min-h-16 items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.99]"
            >
              <span className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-elevated text-muted">
                  <CalendarDays className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{t(locale, "allPlans")}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {PLAN_TOTAL} {t(locale, "plans")}
                  </span>
                </span>
              </span>
            </Link>
          </section>
        </>
      )}
    </div>
  );
}

function CategoryGrid({ items }: { items: PlanCategory[] }) {
  const locale = useAppStore((s) => s.locale);
  return (
    <ul className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const Icon = ICONS[item.id] ?? CalendarDays;
        return (
          <li key={item.id}>
            <Link
              to="/reading/category/$categoryId"
              params={{ categoryId: item.id }}
              className="flex min-h-[8.25rem] flex-col items-start justify-between rounded-lg bg-surface p-4 text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.99]"
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-elevated text-muted">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-medium leading-snug">{item.names[locale]}</span>
                <span className="mt-1 block text-xs text-muted">
                  {item.planIds.length} {t(locale, "plans")}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
