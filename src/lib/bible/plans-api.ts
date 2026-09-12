import type { Locale } from "@/lib/bible/books";
import { formatPassageById } from "@/lib/bible/passage";
import { LINK_USAGE, resolveLinks, type LinkOk } from "@/lib/bible/link-api";
import { readingToPassage, planLead } from "@/lib/bible/reading-plans";
import {
  PLAN_CATEGORIES,
  PLAN_TOTAL,
  planById,
  planCategoryById,
  plansInCategory,
  searchPlanCategories,
  searchPlans,
  type ReadingPlan,
} from "@/lib/bible/reading-plans";

const USAGE =
  "GET /api/plans?locale=pt — or ?q=evangelho — or ?category=duration — or ?id=gospels-30&day=1&app=youversion";

export type PlanQuery = {
  q?: string;
  id?: string;
  category?: string;
  day?: string | number;
  locale?: string;
  app?: string;
  translation?: string;
  native?: boolean;
};

function asLocale(value: string | undefined): Locale {
  if (value === "en" || value === "es" || value === "pt") return value;
  return "pt";
}

function planCard(plan: ReadingPlan, locale: Locale) {
  return {
    id: plan.id,
    name: plan.names[locale],
    names: plan.names,
    days: plan.days.length,
    chapters: plan.days.reduce((n, day) => n + day.readings.length, 0),
    description: planLead(plan.id, locale),
    categoryIds: plan.categoryIds,
  };
}

function categoryCard(id: string, locale: Locale) {
  const category = planCategoryById(id);
  if (!category) return null;
  return {
    id: category.id,
    name: category.names[locale],
    names: category.names,
    count: category.planIds.length,
  };
}

export function queryPlansFromSearch(search: URLSearchParams): PlanQuery {
  return {
    q: search.get("q") ?? search.get("query") ?? undefined,
    id: search.get("id") ?? search.get("plan") ?? undefined,
    category: search.get("category") ?? undefined,
    day: search.get("day") ?? undefined,
    locale: search.get("locale") ?? undefined,
    app: search.get("app") ?? undefined,
    translation: search.get("translation") ?? undefined,
    native: search.get("native") === "1" || search.get("native") === "true",
  };
}

export function resolvePlans(query: PlanQuery) {
  const locale = asLocale(query.locale);
  const q = query.q?.trim() ?? "";

  if (query.id) {
    const plan = planById(query.id);
    if (!plan) return { ok: false as const, error: `Unknown plan "${query.id}".`, usage: USAGE };

    const dayNum = query.day != null && query.day !== "" ? Number(query.day) : NaN;
    if (Number.isFinite(dayNum)) {
      const day = plan.days.find((item) => item.day === dayNum);
      if (!day) {
        return { ok: false as const, error: `Unknown day ${dayNum} in plan "${query.id}".`, usage: USAGE };
      }
      const refs = day.readings.map((reading) => formatPassageById(readingToPassage(reading), locale)).filter(Boolean);
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
        kind: "day" as const,
        locale,
        plan: planCard(plan, locale),
        day: day.day,
        labels: refs,
        markdown: links.markdown,
        html: links.html,
        plain: links.plain,
        items: (links as LinkOk).items,
        app: links.app,
        translation: links.translation,
        native: links.native,
      };
    }

    return {
      ok: true as const,
      kind: "plan" as const,
      locale,
      plan: planCard(plan, locale),
      days: plan.days.map((day) => ({
        day: day.day,
        labels: day.readings.map((reading) => formatPassageById(readingToPassage(reading), locale)),
      })),
    };
  }

  if (query.category) {
    const category = planCategoryById(query.category);
    if (!category) return { ok: false as const, error: `Unknown category "${query.category}".`, usage: USAGE };
    return {
      ok: true as const,
      kind: "category" as const,
      locale,
      category: categoryCard(category.id, locale),
      plans: plansInCategory(category.id, locale).map((item) => planCard(item, locale)),
    };
  }

  if (q) {
    return {
      ok: true as const,
      kind: "search" as const,
      locale,
      query: q,
      categories: searchPlanCategories(q, locale).map((item) => categoryCard(item.id, locale)!),
      plans: searchPlans(q, locale).map((item) => planCard(item, locale)),
    };
  }

  return {
    ok: true as const,
    kind: "index" as const,
    locale,
    planTotal: PLAN_TOTAL,
    categories: PLAN_CATEGORIES.map((item) => categoryCard(item.id, locale)!),
    plans: searchPlans("", locale).map((item) => planCard(item, locale)),
    usage: USAGE,
    linkUsage: LINK_USAGE,
  };
}
