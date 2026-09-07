import type { Locale } from "./books";
import { COLLECTIONS, collectionById, sortCollections, type Collection } from "./collections";

export type Category = {
  id: string;
  names: Record<Locale, string>;
  themeIds: string[];
};

export const CATEGORIES: Category[] = [
  {
    id: "doctrine",
    names: { pt: "Doutrina", en: "Doctrine", es: "Doctrina" },
    themeIds: [
      "salvation", "grace", "faith", "holiness", "holy-spirit", "baptism", "lords-supper",
      "second-coming", "creation", "covenant", "law-and-grace", "death", "heaven", "hell",
      "resurrection", "scripture", "the-cross", "blood", "lordship", "faith-and-works",
      "new-life", "light", "truth", "new-covenant", "sabbath", "angels", "beatitudes",
      "end-times", "identity", "name-of-jesus",
    ],
  },
  {
    id: "jesus",
    names: { pt: "Jesus", en: "Jesus", es: "Jesús" },
    themeIds: [
      "salvation", "the-cross", "blood", "name-of-jesus", "lordship", "resurrection",
      "good-shepherd", "bread-of-life", "the-vine", "prodigal", "easter", "christmas",
      "new-life", "love-god", "second-coming",
    ],
  },
  {
    id: "personal",
    names: { pt: "Vida pessoal", en: "Personal life", es: "Vida personal" },
    themeIds: [
      "prayer", "anxiety", "fear", "temptation", "humility", "pride", "anger", "patience",
      "wisdom", "money", "work", "suffering", "healing", "rest", "courage", "waiting",
      "guidance", "contentment", "integrity", "speech", "purity", "freedom", "grief",
      "doubt", "calling", "peace", "joy", "hope", "love", "forgiveness", "repentance",
      "thanksgiving", "fasting", "comfort", "praise", "kindness", "fast-and-pray",
    ],
  },
  {
    id: "church-life",
    names: { pt: "Igreja", en: "Church", es: "Iglesia" },
    themeIds: [
      "church", "worship", "service", "missions", "evangelism", "discipleship", "leadership",
      "unity", "gifts", "fruit", "armor", "false-teaching", "persecution", "revival",
      "confession", "obedience", "baptism", "lords-supper", "scripture",
    ],
  },
  {
    id: "home",
    names: { pt: "Família", en: "Home & family", es: "Familia" },
    themeIds: [
      "family", "marriage", "children", "friendship", "fathers", "mothers", "widows",
      "love-neighbor", "love-god", "prodigal", "kindness", "forgiveness", "unity",
      "speech", "youth", "women", "men",
    ],
  },
  {
    id: "seasons",
    names: { pt: "Tempos e festas", en: "Seasons", es: "Tiempos y fiestas" },
    themeIds: [
      "christmas", "easter", "youth", "women", "men", "sabbath", "fasting",
      "fast-and-pray", "end-times", "second-coming",
    ],
  },
  {
    id: "society",
    names: { pt: "Justiça e sociedade", en: "Justice & society", es: "Justicia y sociedad" },
    themeIds: [
      "justice", "the-poor", "government", "israel", "creation-care", "widows",
      "generosity", "mercy", "compassion", "money", "work", "missions",
    ],
  },
  {
    id: "character",
    names: { pt: "Caráter e promessas", en: "Character & promises", es: "Carácter y promesas" },
    themeIds: [
      "promises", "hope", "peace", "joy", "courage", "waiting", "fruit", "beatitudes",
      "love", "mercy", "humility", "patience", "kindness", "integrity", "purity",
      "contentment", "thanksgiving", "obedience", "identity", "armor",
    ],
  },
];

export function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((item) => item.id === id);
}

export function themesInCategory(id: string, locale: Locale): Collection[] {
  const category = categoryById(id);
  if (!category) return [];
  const items = category.themeIds
    .map((themeId) => collectionById(themeId))
    .filter((item): item is Collection => Boolean(item));
  return sortCollections(items, locale);
}

export function searchCategories(query: string, locale: Locale): Category[] {
  const q = query
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
  const collator = new Intl.Collator(locale === "pt" ? "pt" : locale === "es" ? "es" : "en", {
    sensitivity: "base",
  });
  const list = !q
    ? CATEGORIES
    : CATEGORIES.filter((item) =>
        [item.names.pt, item.names.en, item.names.es, item.id.replaceAll("-", " ")]
          .join(" ")
          .normalize("NFD")
          .replace(/\p{M}/gu, "")
          .toLowerCase()
          .includes(q),
      );
  return [...list].sort((a, b) => collator.compare(a.names[locale], b.names[locale]));
}

export const THEME_TOTAL = COLLECTIONS.length;
