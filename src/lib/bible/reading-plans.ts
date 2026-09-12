import { BOOKS, bookById, NT_BOOKS, OT_BOOKS, type Book, type Locale } from "./books";
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

function bookChapters(id: string): Reading[] {
  const book = bookById(id);
  if (!book) throw new Error(`Unknown book ${id}`);
  return book.verses.map((_, index) => ({ bookId: id, chapter: index + 1 }));
}

function many(ids: string[]): Reading[] {
  return ids.flatMap(bookChapters);
}

function range(id: string, from: number, to: number): Reading[] {
  const book = bookById(id);
  if (!book) throw new Error(`Unknown book ${id}`);
  if (from < 1 || to > book.verses.length || from > to) throw new Error(`Bad range ${id} ${from}-${to}`);
  const out: Reading[] = [];
  for (let chapter = from; chapter <= to; chapter += 1) out.push({ bookId: id, chapter });
  return out;
}

function list(pairs: [string, number][]): Reading[] {
  return pairs.map(([bookId, chapter]) => {
    const book = bookById(bookId);
    if (!book || chapter < 1 || chapter > book.verses.length) {
      throw new Error(`Bad reading ${bookId} ${chapter}`);
    }
    return { bookId, chapter };
  });
}

function join(...parts: Reading[][]): Reading[] {
  return parts.flat();
}

function oneADay(readings: Reading[]): PlanDay[] {
  return readings.map((reading, index) => ({ day: index + 1, readings: [reading] }));
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

function zipPacked(streams: Reading[][], dayCount: number): PlanDay[] {
  const packed = streams.map((stream) => pack(stream, dayCount));
  return packed[0].map((_, index) => ({
    day: index + 1,
    readings: packed.flatMap((stream) => stream[index]?.readings ?? []),
  }));
}

const GOSPELS = booksByIds(["MAT", "MRK", "LUK", "JHN"]);
const PAUL = booksByIds(["ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM"]);
const PENTATEUCH = booksByIds(["GEN", "EXO", "LEV", "NUM", "DEU"]);

/** Event order of the OT (Job in the patriarchal era). Prophets sit after Kings, not in the Protestant table of contents. Dating of Joel/Obadiah is debated. */
function chronoOT(): Reading[] {
  return join(
    range("GEN", 1, 11),
    bookChapters("JOB"),
    range("GEN", 12, 50),
    many(["EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA", "1CH", "PSA"]),
    range("1KI", 1, 11),
    many(["PRO", "ECC", "SNG"]),
    range("1KI", 12, 22),
    many([
      "2KI",
      "OBA",
      "JOL",
      "AMO",
      "JON",
      "HOS",
      "ISA",
      "MIC",
      "NAM",
      "HAB",
      "ZEP",
      "JER",
      "LAM",
      "EZK",
      "DAN",
      "2CH",
      "EZR",
      "EST",
      "NEH",
      "HAG",
      "ZEC",
      "MAL",
    ]),
  );
}

/** Gospels by likely writing order (Mark first), then Acts, then letters by the usual Pauline chronology. */
function chronoNT(): Reading[] {
  return many([
    "MRK",
    "MAT",
    "LUK",
    "JHN",
    "ACT",
    "JAS",
    "1TH",
    "2TH",
    "GAL",
    "1CO",
    "2CO",
    "ROM",
    "COL",
    "PHM",
    "EPH",
    "PHP",
    "1TI",
    "TIT",
    "1PE",
    "HEB",
    "2TI",
    "2PE",
    "JUD",
    "1JN",
    "2JN",
    "3JN",
    "REV",
  ]);
}

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
    categoryIds: ["books", "old-testament"],
    days: pack(chaptersOf(booksByIds(["PRO"])), 31),
  },
  {
    id: "psalms-30",
    names: { pt: "Salmos em 30 dias", en: "Psalms in 30 days", es: "Salmos en 30 días" },
    categoryIds: ["books", "old-testament"],
    days: pack(chaptersOf(booksByIds(["PSA"])), 30),
  },
  {
    id: "pentateuch-90",
    names: { pt: "Pentateuco em 90 dias", en: "Pentateuch in 90 days", es: "Pentateuco en 90 días" },
    categoryIds: ["books", "duration", "old-testament"],
    days: pack(chaptersOf(PENTATEUCH), 90),
  },
  {
    id: "paul-letters",
    names: { pt: "Cartas de Paulo", en: "Letters of Paul", es: "Cartas de Pablo" },
    categoryIds: ["new-testament", "duration"],
    days: pack(chaptersOf(PAUL), 30),
  },
  {
    id: "chrono-bible",
    names: { pt: "Bíblia em ordem cronológica", en: "Chronological Bible", es: "Biblia cronológica" },
    categoryIds: ["chronological", "duration"],
    days: pack(join(chronoOT(), chronoNT()), 365),
  },
  {
    id: "chrono-ot",
    names: { pt: "AT em ordem cronológica", en: "Chronological OT", es: "AT cronológico" },
    categoryIds: ["chronological", "old-testament", "duration"],
    days: pack(chronoOT(), 180),
  },
  {
    id: "chrono-nt",
    names: { pt: "NT em ordem cronológica", en: "Chronological NT", es: "NT cronológico" },
    categoryIds: ["chronological", "new-testament", "duration"],
    days: pack(chronoNT(), 90),
  },
  {
    id: "four-paths",
    names: { pt: "Quatro caminhos", en: "Four paths", es: "Cuatro caminos" },
    categoryIds: ["duration", "themes"],
    days: zipPacked(
      [
        many(["GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST"]),
        many(["JOB", "PSA", "PRO", "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL"]),
        many(["MAT", "MRK", "LUK", "JHN", "ACT"]),
        many(["ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"]),
      ],
      365,
    ),
  },
  {
    id: "ot-year",
    names: { pt: "Antigo Testamento em 1 ano", en: "Old Testament in a year", es: "Antiguo Testamento en 1 año" },
    categoryIds: ["old-testament", "duration"],
    days: pack(chaptersOf(OT_BOOKS), 365),
  },
  {
    id: "isaiah-66",
    names: { pt: "Isaías em 66 dias", en: "Isaiah in 66 days", es: "Isaías en 66 días" },
    categoryIds: ["books", "old-testament"],
    days: pack(bookChapters("ISA"), 66),
  },
  {
    id: "story-40",
    names: { pt: "Da criação a Cristo", en: "Creation to Christ", es: "De la creación a Cristo" },
    categoryIds: ["themes"],
    days: oneADay(
      list([
        ["GEN", 1],
        ["GEN", 3],
        ["GEN", 6],
        ["GEN", 12],
        ["GEN", 22],
        ["GEN", 50],
        ["EXO", 3],
        ["EXO", 12],
        ["EXO", 14],
        ["EXO", 20],
        ["JOS", 1],
        ["JDG", 2],
        ["RUT", 1],
        ["1SA", 16],
        ["2SA", 7],
        ["1KI", 8],
        ["1KI", 18],
        ["2KI", 17],
        ["2KI", 25],
        ["PSA", 23],
        ["ISA", 6],
        ["ISA", 53],
        ["JER", 31],
        ["EZK", 37],
        ["DAN", 6],
        ["EZR", 1],
        ["NEH", 8],
        ["MAL", 3],
        ["LUK", 1],
        ["LUK", 2],
        ["MRK", 1],
        ["MAT", 5],
        ["JHN", 1],
        ["LUK", 15],
        ["JHN", 11],
        ["MRK", 15],
        ["LUK", 24],
        ["ACT", 2],
        ["ROM", 8],
        ["REV", 21],
      ]),
    ),
  },
  {
    id: "hope-21",
    names: { pt: "Esperança", en: "Hope", es: "Esperanza" },
    categoryIds: ["themes"],
    days: oneADay(
      list([
        ["PSA", 23],
        ["PSA", 27],
        ["PSA", 42],
        ["PSA", 46],
        ["PSA", 91],
        ["PSA", 121],
        ["ISA", 40],
        ["ISA", 41],
        ["ISA", 43],
        ["JER", 29],
        ["LAM", 3],
        ["HAB", 3],
        ["LUK", 1],
        ["JHN", 11],
        ["JHN", 14],
        ["ROM", 5],
        ["ROM", 8],
        ["2CO", 4],
        ["PHP", 4],
        ["1PE", 1],
        ["REV", 21],
      ]),
    ),
  },
  {
    id: "prayer-21",
    names: { pt: "Oração", en: "Prayer", es: "Oración" },
    categoryIds: ["themes"],
    days: oneADay(
      list([
        ["GEN", 18],
        ["EXO", 33],
        ["1SA", 1],
        ["1KI", 8],
        ["2CH", 20],
        ["NEH", 1],
        ["PSA", 5],
        ["PSA", 51],
        ["PSA", 63],
        ["PSA", 86],
        ["PSA", 103],
        ["DAN", 9],
        ["JON", 2],
        ["MAT", 6],
        ["LUK", 11],
        ["LUK", 18],
        ["JHN", 17],
        ["ACT", 4],
        ["EPH", 3],
        ["PHP", 4],
        ["JAS", 5],
      ]),
    ),
  },
  {
    id: "women-21",
    names: { pt: "Mulheres da Bíblia", en: "Women of the Bible", es: "Mujeres de la Biblia" },
    categoryIds: ["themes"],
    days: oneADay(
      list([
        ["GEN", 16],
        ["GEN", 21],
        ["GEN", 24],
        ["EXO", 1],
        ["EXO", 15],
        ["JOS", 2],
        ["JDG", 4],
        ["RUT", 1],
        ["RUT", 2],
        ["RUT", 3],
        ["RUT", 4],
        ["1SA", 1],
        ["1SA", 25],
        ["EST", 4],
        ["PRO", 31],
        ["LUK", 1],
        ["LUK", 8],
        ["LUK", 10],
        ["JHN", 4],
        ["JHN", 20],
        ["ACT", 16],
      ]),
    ),
  },
  {
    id: "justice-14",
    names: { pt: "Justiça", en: "Justice", es: "Justicia" },
    categoryIds: ["themes"],
    days: oneADay(
      list([
        ["EXO", 22],
        ["LEV", 19],
        ["DEU", 15],
        ["DEU", 24],
        ["PSA", 72],
        ["ISA", 1],
        ["ISA", 58],
        ["AMO", 5],
        ["MIC", 6],
        ["LUK", 4],
        ["LUK", 16],
        ["MAT", 25],
        ["JAS", 2],
        ["1JN", 3],
      ]),
    ),
  },
  {
    id: "wilderness-14",
    names: { pt: "No deserto", en: "Wilderness", es: "En el desierto" },
    categoryIds: ["themes", "old-testament"],
    days: oneADay(
      list([
        ["EXO", 16],
        ["EXO", 17],
        ["NUM", 13],
        ["NUM", 14],
        ["NUM", 20],
        ["DEU", 8],
        ["PSA", 63],
        ["PSA", 78],
        ["ISA", 40],
        ["MAT", 4],
        ["MRK", 1],
        ["JHN", 6],
        ["1CO", 10],
        ["HEB", 3],
      ]),
    ),
  },
  {
    id: "covenant-14",
    names: { pt: "Aliança", en: "Covenant", es: "Pacto" },
    categoryIds: ["themes"],
    days: oneADay(
      list([
        ["GEN", 9],
        ["GEN", 12],
        ["GEN", 15],
        ["GEN", 17],
        ["EXO", 19],
        ["EXO", 24],
        ["2SA", 7],
        ["JER", 31],
        ["EZK", 36],
        ["LUK", 22],
        ["1CO", 11],
        ["2CO", 3],
        ["HEB", 8],
        ["HEB", 9],
      ]),
    ),
  },
  {
    id: "holy-week",
    names: { pt: "Semana Santa", en: "Holy Week", es: "Semana Santa" },
    categoryIds: ["themes", "gospels"],
    days: oneADay(
      list([
        ["MAT", 21],
        ["MRK", 11],
        ["MAT", 24],
        ["LUK", 22],
        ["JHN", 13],
        ["JHN", 18],
        ["MRK", 15],
        ["LUK", 24],
      ]),
    ),
  },
  {
    id: "advent-24",
    names: { pt: "Advento", en: "Advent", es: "Adviento" },
    categoryIds: ["themes", "gospels"],
    days: oneADay(
      list([
        ["ISA", 7],
        ["ISA", 9],
        ["ISA", 11],
        ["ISA", 40],
        ["ISA", 42],
        ["MIC", 5],
        ["MAL", 3],
        ["PSA", 24],
        ["PSA", 72],
        ["PSA", 98],
        ["ISA", 52],
        ["ISA", 53],
        ["ISA", 61],
        ["LUK", 1],
        ["MAT", 1],
        ["LUK", 2],
        ["MAT", 2],
        ["JHN", 1],
        ["GAL", 4],
        ["PHP", 2],
        ["COL", 1],
        ["TIT", 2],
        ["HEB", 1],
        ["REV", 22],
      ]),
    ),
  },
  {
    id: "who-is-jesus",
    names: { pt: "Quem é Jesus", en: "Who is Jesus", es: "Quién es Jesús" },
    categoryIds: ["themes", "gospels"],
    days: oneADay(
      list([
        ["JHN", 1],
        ["MRK", 1],
        ["MAT", 5],
        ["LUK", 4],
        ["JHN", 6],
        ["JHN", 10],
        ["JHN", 11],
        ["MRK", 8],
        ["LUK", 15],
        ["JHN", 14],
        ["MAT", 27],
        ["LUK", 24],
        ["ACT", 2],
        ["COL", 1],
      ]),
    ),
  },
  {
    id: "lament-14",
    names: { pt: "Lamento", en: "Lament", es: "Lamento" },
    categoryIds: ["themes"],
    days: oneADay(
      list([
        ["PSA", 13],
        ["PSA", 22],
        ["PSA", 42],
        ["PSA", 44],
        ["PSA", 51],
        ["PSA", 69],
        ["PSA", 77],
        ["PSA", 88],
        ["PSA", 90],
        ["PSA", 102],
        ["PSA", 130],
        ["PSA", 137],
        ["PSA", 142],
        ["LAM", 3],
      ]),
    ),
  },
  {
    id: "wisdom-21",
    names: { pt: "Caminho da sabedoria", en: "Path of wisdom", es: "Camino de sabiduría" },
    categoryIds: ["themes", "old-testament"],
    days: oneADay(
      list([
        ["JOB", 1],
        ["JOB", 3],
        ["JOB", 19],
        ["JOB", 28],
        ["JOB", 38],
        ["JOB", 42],
        ["PRO", 1],
        ["PRO", 3],
        ["PRO", 8],
        ["PRO", 9],
        ["PRO", 31],
        ["ECC", 1],
        ["ECC", 3],
        ["ECC", 12],
        ["SNG", 2],
        ["PSA", 1],
        ["PSA", 19],
        ["JAS", 1],
        ["JAS", 3],
        ["1CO", 1],
        ["COL", 2],
      ]),
    ),
  },
  {
    id: "apocalyptic",
    names: { pt: "Daniel e Apocalipse", en: "Daniel and Revelation", es: "Daniel y Apocalipsis" },
    categoryIds: ["themes", "books"],
    days: oneADay(join(bookChapters("DAN"), bookChapters("REV"))),
  },
  {
    id: "early-church",
    names: { pt: "Igreja nascente", en: "The early church", es: "La iglesia naciente" },
    categoryIds: ["themes", "new-testament"],
    days: pack(many(["ACT", "JAS", "1PE", "1JN"]), 40),
  },
];

const CATEGORY_DEFS: { id: string; names: Record<Locale, string> }[] = [
  { id: "duration", names: { pt: "Por duração", en: "By length", es: "Por duración" } },
  { id: "chronological", names: { pt: "Cronológicos", en: "Chronological", es: "Cronológicos" } },
  { id: "themes", names: { pt: "Por tema", en: "By theme", es: "Por tema" } },
  { id: "gospels", names: { pt: "Evangelhos", en: "Gospels", es: "Evangelios" } },
  { id: "new-testament", names: { pt: "Novo Testamento", en: "New Testament", es: "Nuevo Testamento" } },
  { id: "old-testament", names: { pt: "Antigo Testamento", en: "Old Testament", es: "Antiguo Testamento" } },
  { id: "books", names: { pt: "Livros", en: "Books", es: "Libros" } },
];

export const PLAN_CATEGORIES: PlanCategory[] = CATEGORY_DEFS.map((item) => ({
  ...item,
  planIds: READING_PLANS.filter((plan) => plan.categoryIds.includes(item.id)).map((plan) => plan.id),
}));

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
