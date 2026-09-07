import { BOOKS, bookById, NT_BOOKS, type Book, type Locale } from "./books";
import type { Passage } from "./passage";

export type Reading = { bookId: string; chapter: number };

export type PlanDay = { day: number; readings: Reading[] };

export type ReadingPlan = {
  id: string;
  names: Record<Locale, string>;
  categoryIds: string[];
  days: PlanDay[];
};

export type PlanCategory = {
  id: string;
  names: Record<Locale, string>;
  planIds: string[];
};

function chaptersOf(books: Book[]): Reading[] {
  return books.flatMap((book) => book.verses.map((_, index) => ({ bookId: book.id, chapter: index + 1 })));
}

function booksByIds(ids: string[]): Book[] {
  return ids.map((id) => bookById(id)).filter((book): book is Book => Boolean(book));
}

function pack(chapters: Reading[], dayCount: number): PlanDay[] {
  const n = chapters.length;
  const days = Math.min(Math.max(dayCount, 1), n);
  const base = Math.floor(n / days);
  const extra = n % days;
  const out: PlanDay[] = [];
  let i = 0;
  for (let day = 1; day <= days; day += 1) {
    const take = base + (day <= extra ? 1 : 0);
    out.push({ day, readings: chapters.slice(i, i + take) });
    i += take;
  }
  return out;
}

const GOSPELS = booksByIds(["MAT", "MRK", "LUK", "JHN"]);
const PAUL = booksByIds(["ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM"]);
const PENTATEUCH = booksByIds(["GEN", "EXO", "LEV", "NUM", "DEU"]);

export const READING_PLANS: ReadingPlan[] = [
  {
    id: "bible-year",
    names: { pt: "Bíblia em 1 ano", en: "Bible in a year", es: "Biblia en 1 año" },
    categoryIds: ["duration"],
    days: pack(chaptersOf(BOOKS), 365),
  },
  {
    id: "bible-90",
    names: { pt: "Bíblia em 90 dias", en: "Bible in 90 days", es: "Biblia en 90 días" },
    categoryIds: ["duration"],
    days: pack(chaptersOf(BOOKS), 90),
  },
  {
    id: "nt-90",
    names: { pt: "Novo Testamento em 90 dias", en: "NT in 90 days", es: "NT en 90 días" },
    categoryIds: ["duration", "new-testament"],
    days: pack(chaptersOf(NT_BOOKS), 90),
  },
  {
    id: "nt-30",
    names: { pt: "Novo Testamento em 30 dias", en: "NT in 30 days", es: "NT en 30 días" },
    categoryIds: ["duration", "new-testament"],
    days: pack(chaptersOf(NT_BOOKS), 30),
  },
  {
    id: "gospels-30",
    names: { pt: "Evangelhos em 30 dias", en: "Gospels in 30 days", es: "Evangelios en 30 días" },
    categoryIds: ["duration", "gospels"],
    days: pack(chaptersOf(GOSPELS), 30),
  },
  {
    id: "john-21",
    names: { pt: "João em 21 dias", en: "John in 21 days", es: "Juan en 21 días" },
    categoryIds: ["gospels", "books"],
    days: pack(chaptersOf(booksByIds(["JHN"])), 21),
  },
  {
    id: "matthew-28",
    names: { pt: "Mateus em 28 dias", en: "Matthew in 28 days", es: "Mateo en 28 días" },
    categoryIds: ["gospels", "books"],
    days: pack(chaptersOf(booksByIds(["MAT"])), 28),
  },
  {
    id: "luke-24",
    names: { pt: "Lucas em 24 dias", en: "Luke in 24 days", es: "Lucas en 24 días" },
    categoryIds: ["gospels", "books"],
    days: pack(chaptersOf(booksByIds(["LUK"])), 24),
  },
  {
    id: "acts-28",
    names: { pt: "Atos em 28 dias", en: "Acts in 28 days", es: "Hechos en 28 días" },
    categoryIds: ["new-testament", "books"],
    days: pack(chaptersOf(booksByIds(["ACT"])), 28),
  },
  {
    id: "romans-16",
    names: { pt: "Romanos em 16 dias", en: "Romans in 16 days", es: "Romanos en 16 días" },
    categoryIds: ["new-testament", "books"],
    days: pack(chaptersOf(booksByIds(["ROM"])), 16),
  },
  {
    id: "proverbs-31",
    names: { pt: "Provérbios em 31 dias", en: "Proverbs in 31 days", es: "Proverbios en 31 días" },
    categoryIds: ["books"],
    days: pack(chaptersOf(booksByIds(["PRO"])), 31),
  },
  {
    id: "psalms-30",
    names: { pt: "Salmos em 30 dias", en: "Psalms in 30 days", es: "Salmos en 30 días" },
    categoryIds: ["books"],
    days: pack(chaptersOf(booksByIds(["PSA"])), 30),
  },
  {
    id: "pentateuch-90",
    names: { pt: "Pentateuco em 90 dias", en: "Pentateuch in 90 days", es: "Pentateuco en 90 días" },
    categoryIds: ["books", "duration"],
    days: pack(chaptersOf(PENTATEUCH), 90),
  },
  {
    id: "paul-letters",
    names: { pt: "Cartas de Paulo", en: "Letters of Paul", es: "Cartas de Pablo" },
    categoryIds: ["new-testament", "duration"],
    days: pack(chaptersOf(PAUL), 30),
  },
];

export const PLAN_CATEGORIES: PlanCategory[] = [
  {
    id: "duration",
    names: { pt: "Por duração", en: "By length", es: "Por duración" },
    planIds: READING_PLANS.filter((plan) => plan.categoryIds.includes("duration")).map((plan) => plan.id),
  },
  {
    id: "gospels",
    names: { pt: "Evangelhos", en: "Gospels", es: "Evangelios" },
    planIds: READING_PLANS.filter((plan) => plan.categoryIds.includes("gospels")).map((plan) => plan.id),
  },
  {
    id: "new-testament",
    names: { pt: "Novo Testamento", en: "New Testament", es: "Nuevo Testamento" },
    planIds: READING_PLANS.filter((plan) => plan.categoryIds.includes("new-testament")).map((plan) => plan.id),
  },
  {
    id: "books",
    names: { pt: "Livros", en: "Books", es: "Libros" },
    planIds: READING_PLANS.filter((plan) => plan.categoryIds.includes("books")).map((plan) => plan.id),
  },
];

export function planById(id: string): ReadingPlan | undefined {
  return READING_PLANS.find((plan) => plan.id === id);
}

export function planCategoryById(id: string): PlanCategory | undefined {
  return PLAN_CATEGORIES.find((item) => item.id === id);
}

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function sortPlans(items: ReadingPlan[], locale: Locale): ReadingPlan[] {
  const collator = new Intl.Collator(locale === "pt" ? "pt" : locale === "es" ? "es" : "en", {
    sensitivity: "base",
  });
  return [...items].sort((a, b) => collator.compare(a.names[locale], b.names[locale]));
}

export function searchPlans(query: string, locale: Locale): ReadingPlan[] {
  const q = fold(query);
  const list = !q
    ? READING_PLANS
    : READING_PLANS.filter((plan) => fold(`${plan.names.pt} ${plan.names.en} ${plan.names.es} ${plan.id}`).includes(q));
  return sortPlans(list, locale);
}

export function plansInCategory(id: string, locale: Locale): ReadingPlan[] {
  const category = planCategoryById(id);
  if (!category) return [];
  return sortPlans(
    category.planIds.map((planId) => planById(planId)).filter((plan): plan is ReadingPlan => Boolean(plan)),
    locale,
  );
}

export function searchPlanCategories(query: string, locale: Locale): PlanCategory[] {
  const q = fold(query);
  const collator = new Intl.Collator(locale === "pt" ? "pt" : locale === "es" ? "es" : "en", {
    sensitivity: "base",
  });
  const list = !q
    ? PLAN_CATEGORIES
    : PLAN_CATEGORIES.filter((item) => fold(`${item.names.pt} ${item.names.en} ${item.names.es}`).includes(q));
  return [...list].sort((a, b) => collator.compare(a.names[locale], b.names[locale]));
}

export function readingToPassage(reading: Reading): Passage {
  return { bookId: reading.bookId, chapter: reading.chapter, verseStart: null, verseEnd: null };
}

export const PLAN_TOTAL = READING_PLANS.length;
