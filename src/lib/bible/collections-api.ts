import type { Locale } from "@/lib/bible/books";
import {
  CATEGORIES,
  categoryById,
  searchCategories,
  themesInCategory,
  THEME_TOTAL,
} from "@/lib/bible/categories";
import { collectionById, searchCollections, type Collection } from "@/lib/bible/collections";
import { formatPassageById } from "@/lib/bible/passage";
import { LINK_USAGE, resolveLinks, type LinkOk } from "@/lib/bible/link-api";

const USAGE =
  "GET /api/collections?locale=pt — or ?q=oracao — or ?category=doctrine — or ?id=salvation&app=youversion";

export type CollectionQuery = {
  q?: string;
  id?: string;
  category?: string;
  locale?: string;
  app?: string;
  translation?: string;
  native?: boolean;
};

type ThemeCard = {
  id: string;
  name: string;
  names: Collection["names"];
  count: number;
  snippet: string;
};

type CategoryCard = {
  id: string;
  name: string;
  names: (typeof CATEGORIES)[number]["names"];
  count: number;
};

function asLocale(value: string | undefined): Locale {
  if (value === "en" || value === "es" || value === "pt") return value;
  return "pt";
}

function themeCard(item: Collection, locale: Locale): ThemeCard {
  return {
    id: item.id,
    name: item.names[locale],
    names: item.names,
    count: item.passages.length,
    snippet: item.passages[0]?.snippet[locale] ?? "",
  };
}

function categoryCard(id: string, locale: Locale): CategoryCard | null {
  const category = categoryById(id) ?? CATEGORIES.find((item) => item.id === id);
  if (!category) return null;
  return {
    id: category.id,
    name: category.names[locale],
    names: category.names,
    count: category.themeIds.length,
  };
}

export function queryCollectionsFromSearch(search: URLSearchParams): CollectionQuery {
  return {
    q: search.get("q") ?? search.get("query") ?? undefined,
    id: search.get("id") ?? search.get("theme") ?? undefined,
    category: search.get("category") ?? undefined,
    locale: search.get("locale") ?? undefined,
    app: search.get("app") ?? undefined,
    translation: search.get("translation") ?? undefined,
    native: search.get("native") === "1" || search.get("native") === "true",
  };
}

export function resolveCollections(query: CollectionQuery) {
  const locale = asLocale(query.locale);
  const q = query.q?.trim() ?? "";

  if (query.id) {
    const collection = collectionById(query.id);
    if (!collection) {
      return { ok: false as const, error: `Unknown theme "${query.id}".`, usage: USAGE };
    }
    const refs = collection.passages
      .map((passage) => formatPassageById(passage, locale))
      .filter(Boolean);
    const links = resolveLinks({
      refs,
      app: query.app,
      translation: query.translation,
      locale,
      native: query.native,
    });
    if (!links.ok) return links;
    return {
      ok: true as const,
      kind: "theme" as const,
      locale,
      theme: themeCard(collection, locale),
      passages: collection.passages.map((passage) => ({
        bookId: passage.bookId,
        chapter: passage.chapter,
        verseStart: passage.verseStart,
        verseEnd: passage.verseEnd,
        label: formatPassageById(passage, locale),
        snippet: passage.snippet[locale],
      })),
      markdown: links.markdown,
      html: links.html,
      plain: links.plain,
      items: (links as LinkOk).items,
      app: links.app,
      translation: links.translation,
      native: links.native,
    };
  }

  if (query.category) {
    const category = categoryById(query.category);
    if (!category) {
      return { ok: false as const, error: `Unknown category "${query.category}".`, usage: USAGE };
    }
    return {
      ok: true as const,
      kind: "category" as const,
      locale,
      category: categoryCard(category.id, locale),
      themes: themesInCategory(category.id, locale).map((item) => themeCard(item, locale)),
    };
  }

  if (q) {
    return {
      ok: true as const,
      kind: "search" as const,
      locale,
      query: q,
      categories: searchCategories(q, locale).map((item) => categoryCard(item.id, locale)!),
      themes: searchCollections(q, locale).map((item) => themeCard(item, locale)),
    };
  }

  return {
    ok: true as const,
    kind: "index" as const,
    locale,
    themeTotal: THEME_TOTAL,
    categories: CATEGORIES.map((item) => categoryCard(item.id, locale)!),
    usage: USAGE,
    linkUsage: LINK_USAGE,
  };
}
