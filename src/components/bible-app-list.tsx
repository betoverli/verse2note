import { Check, ChevronRight } from "lucide-react";
import { BIBLE_APPS, appHasOptions, appIcon } from "@/lib/bible/apps";
import type { Locale } from "@/lib/bible/books";

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
    <div className="ios-group" data-inset="icon">
      {BIBLE_APPS.map((item) => {
        const active = item.id === appId;
        const extra = appHasOptions(item);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={active}
            className="flex min-h-[60px] w-full items-center gap-3 px-4 py-2.5 text-left text-fg active:bg-fill"
          >
            <img
              src={appIcon(item.id)}
              alt=""
              width={36}
              height={36}
              draggable={false}
              className="size-9 shrink-0 rounded-[8px] bg-elevated object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[17px]">{item.names[locale]}</span>
              <span className="block truncate text-[13px] text-muted">
                {active && summary ? summary : item.blurb[locale]}
              </span>
            </span>
            {active ? (
              <Check className="size-5 shrink-0 text-accent" />
            ) : extra ? (
              <ChevronRight className="size-4 shrink-0 text-subtle" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
