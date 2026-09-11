import {
  Award,
  Bookmark,
  BookOpen,
  CalendarCheck,
  Crown,
  Flag,
  Flame,
  Library,
  Link2,
  Sparkles,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Locale } from "@/lib/bible/books";
import { BADGE_COPY, BADGE_IDS, type BadgeId } from "@/lib/badges";
import { cn } from "@/lib/utils";

const ICONS: Record<BadgeId, LucideIcon> = {
  plan_1: Flag,
  plan_3: BookOpen,
  plan_5: Award,
  plan_10: Crown,
  days_7: CalendarCheck,
  days_30: Flame,
  days_100: Sparkles,
  invite_1: UserPlus,
  invite_3: Users,
  invite_5: Users,
  invite_10: Award,
  list_1: Library,
  list_5: Bookmark,
  share_1: Link2,
};

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
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {ids.map((id) => {
        const Icon = ICONS[id];
        const on = have.has(id);
        const copy = BADGE_COPY[id];
        return (
          <li
            key={id}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg px-2 py-3 text-center",
              on ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-subtle",
            )}
            title={copy.hints[locale]}
          >
            <span
              className={cn(
                "grid size-10 place-items-center rounded-full",
                on ? "bg-accent text-accent-fg" : "bg-elevated text-subtle",
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="text-[11px] leading-tight font-medium">{copy.names[locale]}</span>
          </li>
        );
      })}
    </ul>
  );
}
