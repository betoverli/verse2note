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
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const done = planProgress[item.id]?.length ?? 0;
        return (
          <li key={item.id}>
            <Link
              to="/reading/$id"
              params={{ id: item.id }}
              search={from ? { from } : {}}
              className="flex min-h-11 items-center justify-between gap-3 rounded-md bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.99]"
            >
              <span>
                <span className="block text-sm font-medium">{item.names[locale]}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {done > 0
                    ? `${done} / ${item.days.length} ${t(locale, "days")}`
                    : `${item.days.length} ${t(locale, "days")}`}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
