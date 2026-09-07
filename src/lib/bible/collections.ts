import type { Locale } from "./books";
import type { Passage } from "./passage";

export type Collection = {
  id: string;
  names: Record<Locale, string>;
  passages: Passage[];
};

function p(bookId: string, chapter: number, verseStart: number, verseEnd?: number): Passage {
  return { bookId, chapter, verseStart, verseEnd: verseEnd ?? null };
}

export const COLLECTIONS: Collection[] = [
  {
    id: "salvation",
    names: { pt: "Salvação", en: "Salvation", es: "Salvación" },
    passages: [
      p("JHN", 3, 16),
      p("ROM", 3, 23),
      p("ROM", 5, 8),
      p("ROM", 6, 23),
      p("ROM", 10, 9, 10),
      p("EPH", 2, 8, 9),
      p("ACT", 16, 31),
      p("TIT", 3, 5),
    ],
  },
  {
    id: "grace",
    names: { pt: "Graça", en: "Grace", es: "Gracia" },
    passages: [
      p("EPH", 2, 8, 9),
      p("ROM", 3, 24),
      p("2CO", 12, 9),
      p("HEB", 4, 16),
      p("JHN", 1, 16, 17),
      p("TIT", 2, 11),
    ],
  },
  {
    id: "faith",
    names: { pt: "Fé", en: "Faith", es: "Fe" },
    passages: [
      p("HEB", 11, 1),
      p("HEB", 11, 6),
      p("ROM", 10, 17),
      p("2CO", 5, 7),
      p("HAB", 2, 4),
      p("JAS", 2, 17),
      p("MRK", 11, 22, 24),
    ],
  },
  {
    id: "prayer",
    names: { pt: "Oração", en: "Prayer", es: "Oración" },
    passages: [
      p("MAT", 6, 6, 13),
      p("PHP", 4, 6, 7),
      p("1TH", 5, 17),
      p("JAS", 5, 16),
      p("JHN", 14, 13, 14),
      p("JER", 33, 3),
      p("1JN", 5, 14),
    ],
  },
  {
    id: "anxiety",
    names: { pt: "Ansiedade", en: "Anxiety", es: "Ansiedad" },
    passages: [
      p("PHP", 4, 6, 7),
      p("1PE", 5, 7),
      p("MAT", 6, 25, 34),
      p("ISA", 41, 10),
      p("JHN", 14, 27),
      p("PSA", 55, 22),
    ],
  },
  {
    id: "family",
    names: { pt: "Família", en: "Family", es: "Familia" },
    passages: [
      p("JOS", 24, 15),
      p("PRO", 22, 6),
      p("EPH", 5, 25),
      p("EPH", 6, 1, 4),
      p("COL", 3, 18, 21),
      p("PSA", 127, 3),
    ],
  },
  {
    id: "church",
    names: { pt: "Igreja", en: "Church", es: "Iglesia" },
    passages: [
      p("MAT", 16, 18),
      p("ACT", 2, 42),
      p("HEB", 10, 24, 25),
      p("EPH", 4, 11, 16),
      p("1CO", 12, 12, 13),
      p("COL", 1, 18),
    ],
  },
  {
    id: "christmas",
    names: { pt: "Natal", en: "Christmas", es: "Navidad" },
    passages: [
      p("ISA", 9, 6),
      p("MIC", 5, 2),
      p("MAT", 1, 21, 23),
      p("LUK", 2, 8, 14),
      p("JHN", 1, 14),
      p("GAL", 4, 4),
    ],
  },
  {
    id: "easter",
    names: { pt: "Páscoa", en: "Easter", es: "Pascua" },
    passages: [
      p("ISA", 53, 5),
      p("MAT", 28, 5, 6),
      p("JHN", 11, 25, 26),
      p("1CO", 15, 3, 4),
      p("ROM", 6, 4),
      p("1PE", 1, 3),
    ],
  },
  {
    id: "youth",
    names: { pt: "Jovens", en: "Youth", es: "Jóvenes" },
    passages: [
      p("ECC", 12, 1),
      p("PSA", 119, 9),
      p("PRO", 3, 5, 6),
      p("JER", 29, 11),
      p("1TI", 4, 12),
      p("1JN", 2, 14),
    ],
  },
];

export function collectionById(id: string): Collection | undefined {
  return COLLECTIONS.find((item) => item.id === id);
}
