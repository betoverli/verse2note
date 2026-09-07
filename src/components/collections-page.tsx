import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { searchCollections } from "@/lib/bible/collections";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export function CollectionsPage() {
  const locale = useAppStore((s) => s.locale);
  const [query, setQuery] = useState("");
  const items = useMemo(() => searchCollections(query, locale), [query, locale]);

  return (
    <div className="flex flex-col gap-6">
      <label className="block">
        <span className="sr-only">{t(locale, "collectionsSearch")}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t(locale, "collectionsSearch")}
          className="h-11 w-full rounded-md bg-surface px-4 text-base text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/70"
        />
      </label>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{t(locale, "collectionsEmpty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to="/collections/$id"
                params={{ id: item.id }}
                className="flex min-h-11 items-center justify-between gap-3 rounded-md bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.99]"
              >
                <span>
                  <span className="block text-sm font-medium">{item.names[locale]}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {item.passages.length} {t(locale, "refs")}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
