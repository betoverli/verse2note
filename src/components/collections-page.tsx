import { Link } from "@tanstack/react-router";
import {
  BookMarked,
  Briefcase,
  CalendarDays,
  Church,
  Cross,
  Flame,
  Heart,
  Home,
  Hourglass,
  Library,
  Music,
  Scale,
  ScrollText,
  Smile,
  Sparkles,
} from "lucide-react";
import { useMemo, useState, type ComponentType } from "react";
import { searchCategories, THEME_TOTAL, type Category } from "@/lib/bible/categories";
import { searchCollections } from "@/lib/bible/collections";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { MyCollections } from "@/components/my-collections";
import { ThemeList } from "@/components/theme-list";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  doctrine: BookMarked,
  jesus: Cross,
  personal: Heart,
  "church-life": Church,
  home: Home,
  seasons: CalendarDays,
  society: Scale,
  character: Sparkles,
  spirit: Flame,
  "last-things": Hourglass,
  stories: ScrollText,
  emotions: Smile,
  "work-money": Briefcase,
  "worship-prayer": Music,
};

export function CollectionsPage() {
  const locale = useAppStore((s) => s.locale);
  const [query, setQuery] = useState("");
  const categories = useMemo(() => searchCategories(query, locale), [query, locale]);
  const themes = useMemo(() => searchCollections(query, locale), [query, locale]);
  const searching = query.trim().length > 0;

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

      {searching ? (
        <>
          {categories.length > 0 ? <CategoryGrid items={categories} /> : null}
          <ThemeList items={themes} />
        </>
      ) : (
        <>
          <MyCollections />
          <CategoryGrid items={categories} />
          <Link
            to="/collections/themes"
            className="flex min-h-16 items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3 text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.99]"
          >
            <span className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-elevated text-muted">
                <Library className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-medium">{t(locale, "allThemes")}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {THEME_TOTAL} {t(locale, "themes")}
                </span>
              </span>
            </span>
          </Link>
        </>
      )}
    </div>
  );
}

function CategoryGrid({ items }: { items: Category[] }) {
  const locale = useAppStore((s) => s.locale);
  return (
    <ul className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const Icon = ICONS[item.id] ?? BookMarked;
        return (
          <li key={item.id}>
            <Link
              to="/collections/category/$categoryId"
              params={{ categoryId: item.id }}
              className="flex min-h-[8.25rem] flex-col items-start justify-between rounded-lg bg-surface p-4 text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.99]"
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-elevated text-muted">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-medium leading-snug">{item.names[locale]}</span>
                <span className="mt-1 block text-xs text-muted">
                  {item.themeIds.length} {t(locale, "themes")}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
