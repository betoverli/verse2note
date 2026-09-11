import type { Locale } from "@/lib/bible/books";
import { BADGE_COPY, BADGE_IDS, type BadgeId } from "@/lib/badges";
import { BadgeSeal } from "@/components/badge-seal";
import { cn } from "@/lib/utils";

export function BadgeGrid({
  earned,
  locale,
  locked,
}: {
  earned: BadgeId[];
  locale: Locale;
  locked?: boolean;
}) {
  const ids = locked ? BADGE_IDS : earned;
  if (ids.length === 0) return null;
  const have = new Set(earned);
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-6">
      {ids.map((id) => {
        const on = have.has(id);
        const copy = BADGE_COPY[id];
        return (
          <li key={id} className={cn("flex flex-col items-center gap-2.5 text-center", on ? "text-fg" : "text-subtle")}>
            <BadgeSeal id={id} earned={on} />
            <span className="font-display text-lg leading-tight italic">{copy.names[locale]}</span>
            <span className="max-w-[11rem] text-xs leading-snug text-muted">{copy.hints[locale]}</span>
          </li>
        );
      })}
    </ul>
  );
}
