import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReadingPlan } from "@/lib/bible/reading-plans";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export function PlanList({ items, from }: { items: ReadingPlan[]; from?: string }) {
  const locale = useAppStore((s) => s.locale);
  const planProgress = useAppStore((s) => s.planProgress);

  if (items.length === 0) {
    return <p className="text-sm text-muted">{t(locale, "plansEmpty")}</p>;
  }

  return (
    <ul className="ios-group">
      {items.map((item) => {
        const done = planProgress[item.id]?.length ?? 0;
        return (
          <li key={item.id}>
            <Link
              to="/reading/$id"
              params={{ id: item.id }}
              search={from ? { from } : {}}
              className="flex min-h-11 items-center justify-between gap-3 px-4 py-3 text-fg active:bg-fill"
            >
              <span className="min-w-0">
                <span className="block truncate text-[17px]">{item.names[locale]}</span>
                <span className="mt-0.5 block text-[13px] text-muted">
                  {done > 0
                    ? `${done} / ${item.days.length} ${t(locale, "days")}`
                    : `${item.days.length} ${t(locale, "days")}`}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-subtle" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
