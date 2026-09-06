import { Check, ChevronRight } from "lucide-react";
import { BIBLE_APPS, appHasOptions, appIcon } from "@/lib/bible/apps";
import type { Locale } from "@/lib/bible/books";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BibleAppList({
  locale,
  appId,
  onSelect,
  summary,
}: {
  locale: Locale;
  appId: string;
  onSelect: (id: string) => void;
  summary?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {BIBLE_APPS.map((item) => {
        const active = item.id === appId;
        const extra = appHasOptions(item);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={active}
            className={cn(
              "flex w-full items-start gap-3 rounded-md px-4 py-3 text-left transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.99]",
              active
                ? "bg-accent text-accent-fg"
                : "bg-surface text-fg shadow-[var(--shadow-border)] hover:bg-elevated",
            )}
          >
            <img
              src={appIcon(item.id)}
              alt=""
              width={36}
              height={36}
              draggable={false}
              className="mt-0.5 size-9 shrink-0 rounded-sm bg-elevated object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{item.names[locale]}</span>
                <span className={cn("text-xs uppercase", active ? "opacity-70" : "text-subtle")}>
                  {item.hasWeb ? t(locale, "webBadge") : null}
                  {item.hasWeb && item.hasNative ? " · " : null}
                  {item.hasNative ? t(locale, "nativeBadge") : null}
                </span>
              </span>
              <span className={cn("mt-0.5 block text-xs", active ? "opacity-70" : "text-muted")}>
                {active && summary ? summary : item.blurb[locale]}
              </span>
            </span>
            {extra ? (
              <ChevronRight
                className={cn("mt-1 size-4 shrink-0", active ? "opacity-80" : "text-muted")}
              />
            ) : active ? (
              <Check className="mt-1 size-4 shrink-0" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
