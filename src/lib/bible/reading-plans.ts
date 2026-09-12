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

const PLAN_LEADS: Record<string, Record<Locale, string>> = {
  "bible-year": {
    pt: "A Bíblia inteira na ordem dos livros, um pouco cada dia, no ritmo de um ano.",
    en: "The whole Bible in book order, a little each day, at a year’s pace.",
    es: "Toda la Biblia en el orden de los libros, un poco cada día, al ritmo de un año.",
  },
  "bible-90": {
    pt: "A Bíblia inteira em três meses. São vários capítulos por dia — para quem quer um sprint.",
    en: "The whole Bible in three months. Several chapters a day — a sprint.",
    es: "Toda la Biblia en tres meses. Varios capítulos al día — un sprint.",
  },
  "nt-90": {
    pt: "Os 27 livros do Novo Testamento em três meses, na ordem usual.",
    en: "The 27 books of the New Testament in three months, in the usual order.",
    es: "Los 27 libros del Nuevo Testamento en tres meses, en el orden habitual.",
  },
  "nt-30": {
    pt: "O Novo Testamento em um mês. Ritmo forte, cerca de nove capítulos por dia.",
    en: "The New Testament in a month. A hard pace, about nine chapters a day.",
    es: "El Nuevo Testamento en un mes. Ritmo fuerte, unos nueve capítulos al día.",
  },
  "gospels-30": {
    pt: "Mateus, Marcos, Lucas e João em 30 dias. Quatro retratos de Jesus, um atrás do outro.",
    en: "Matthew, Mark, Luke and John in 30 days. Four portraits of Jesus, one after another.",
    es: "Mateo, Marcos, Lucas y Juan en 30 días. Cuatro retratos de Jesús, uno tras otro.",
  },
  "john-21": {
    pt: "Um capítulo de João por dia. O evangelho do Verbo, da luz e da vida.",
    en: "One chapter of John a day. The gospel of the Word, light and life.",
    es: "Un capítulo de Juan al día. El evangelio del Verbo, la luz y la vida.",
  },
  "matthew-28": {
    pt: "Mateus em 28 dias: o Messias, o Sermão da Montanha e o Reino.",
    en: "Matthew in 28 days: the Messiah, the Sermon on the Mount, and the Kingdom.",
    es: "Mateo en 28 días: el Mesías, el Sermón del Monte y el Reino.",
  },
  "luke-24": {
    pt: "Lucas em 24 dias. A história de Jesus para o mundo, com cuidado e humanidade.",
    en: "Luke in 24 days. The story of Jesus for the world, careful and human.",
    es: "Lucas en 24 días. La historia de Jesús para el mundo, cuidadosa y humana.",
  },
  "acts-28": {
    pt: "Um capítulo de Atos por dia. Da subida de Jesus à igreja que atravessa o Império.",
    en: "One chapter of Acts a day. From Jesus’ ascent to a church that crosses the Empire.",
    es: "Un capítulo de Hechos al día. De la subida de Jesús a la iglesia que cruza el Imperio.",
  },
  "romans-16": {
    pt: "Romanos em 16 dias. O evangelho de Paulo, da culpa à nova criação.",
    en: "Romans in 16 days. Paul’s gospel, from guilt to new creation.",
    es: "Romanos en 16 días. El evangelio de Pablo, de la culpa a la nueva creación.",
  },
  "proverbs-31": {
    pt: "Um capítulo de Provérbios por dia do mês. Sabedoria para a vida comum.",
    en: "One chapter of Proverbs a day for a month. Wisdom for ordinary life.",
    es: "Un capítulo de Proverbios al día durante un mes. Sabiduría para la vida cotidiana.",
  },
  "psalms-30": {
    pt: "O saltério em um mês. Vários salmos por dia: lamento, louvor e confiança.",
    en: "The Psalter in a month. Several psalms a day: lament, praise, and trust.",
    es: "El salterio en un mes. Varios salmos al día: lamento, alabanza y confianza.",
  },
  "pentateuch-90": {
    pt: "Gênesis a Deuteronômio em 90 dias. Das origens à beira da Terra Prometida.",
    en: "Genesis through Deuteronomy in 90 days. From the beginnings to the edge of the Promised Land.",
    es: "Génesis a Deuteronomio en 90 días. De los orígenes al borde de la Tierra Prometida.",
  },
  "paul-letters": {
    pt: "As 13 cartas de Paulo em 30 dias. Igrejas, amigos e a teologia em movimento.",
    en: "Paul’s 13 letters in 30 days. Churches, friends, and theology on the move.",
    es: "Las 13 cartas de Pablo en 30 días. Iglesias, amigos y teología en movimiento.",
  },
  "chrono-bible": {
    pt: "A Bíblia na ordem dos acontecimentos, não do índice. Jó no tempo dos patriarcas; os profetas depois dos Reis; no NT, Marcos primeiro. Datas de Joel e Obadias são debatidas.",
    en: "The Bible in the order of events, not the table of contents. Job in the patriarchal age; the prophets after Kings; in the NT, Mark first. The dates of Joel and Obadiah are debated.",
    es: "La Biblia en el orden de los hechos, no del índice. Job en la era patriarcal; los profetas después de Reyes; en el NT, Marcos primero. Las fechas de Joel y Abdías se debaten.",
  },
  "chrono-ot": {
    pt: "O Antigo Testamento na ordem da história: Jó depois de Gn 1–11, Salomão no meio de 1 Reis, profetas após a queda dos reinos.",
    en: "The Old Testament in story order: Job after Gen 1–11, Solomon in the middle of 1 Kings, prophets after the fall of the kingdoms.",
    es: "El Antiguo Testamento en el orden de la historia: Job después de Gn 1–11, Salomón en medio de 1 Reyes, profetas tras la caída de los reinos.",
  },
  "chrono-nt": {
    pt: "O Novo Testamento pela cronologia mais aceita: Marcos, os outros evangelhos, Atos, depois as cartas na ordem paulina usual.",
    en: "The New Testament in the most common chronology: Mark, the other gospels, Acts, then the letters in the usual Pauline order.",
    es: "El Nuevo Testamento según la cronología más aceptada: Marcos, los otros evangelios, Hechos, luego las cartas en el orden paulino habitual.",
  },
  "four-paths": {
    pt: "Quatro faixas ao mesmo tempo, um ano: história, poetas e profetas, evangelhos e Atos, cartas. Cada dia um pedaço de cada caminho.",
    en: "Four strands at once, for a year: history, poets and prophets, gospels and Acts, letters. Each day a piece of every path.",
    es: "Cuatro sendas a la vez, un año: historia, poetas y profetas, evangelios y Hechos, cartas. Cada día un trozo de cada camino.",
  },
  "ot-year": {
    pt: "Só o Antigo Testamento, na ordem dos livros, ao longo de um ano.",
    en: "The Old Testament only, in book order, over a year.",
    es: "Solo el Antiguo Testamento, en el orden de los libros, a lo largo de un año.",
  },
  "isaiah-66": {
    pt: "Um capítulo de Isaías por dia. Juízo, servo sofredor e a nova criação.",
    en: "One chapter of Isaiah a day. Judgment, the suffering servant, and new creation.",
    es: "Un capítulo de Isaías al día. Juicio, el siervo sufriente y la nueva creación.",
  },
  "story-40": {
    pt: "Quarenta capítulos que contam o arco: criação, aliança, êxodo, reino, exílio, Jesus, igreja e a cidade nova.",
    en: "Forty chapters that tell the arc: creation, covenant, exodus, kingdom, exile, Jesus, the church, and the new city.",
    es: "Cuarenta capítulos que cuentan el arco: creación, pacto, éxodo, reino, exilio, Jesús, la iglesia y la ciudad nueva.",
  },
  "hope-21": {
    pt: "Três semanas de textos que sustentam: salmos, Isaías, Jesus e a promessa de um céu novo.",
    en: "Three weeks of texts that hold you up: psalms, Isaiah, Jesus, and the promise of a new heaven.",
    es: "Tres semanas de textos que sostienen: salmos, Isaías, Jesús y la promesa de un cielo nuevo.",
  },
  "prayer-21": {
    pt: "Orações da Escritura, de Abraão a Jesus. Um capítulo por dia para rezar com a Bíblia.",
    en: "Prayers from Scripture, from Abraham to Jesus. One chapter a day to pray with the Bible.",
    es: "Oraciones de la Escritura, de Abraham a Jesús. Un capítulo al día para orar con la Biblia.",
  },
  "women-21": {
    pt: "Hagar, Débora, Rute, Ana, Ester, Maria, a samaritana e outras. Vinte e um capítulos, vozes que a história às vezes baixa.",
    en: "Hagar, Deborah, Ruth, Hannah, Esther, Mary, the Samaritan woman and others. Twenty-one chapters, voices the story sometimes lowers.",
    es: "Agar, Débora, Rut, Ana, Ester, María, la samaritana y otras. Veintiún capítulos, voces que la historia a veces baja.",
  },
  "justice-14": {
    pt: "Duas semanas sobre o direito do pobre, o jejum que Deus escolhe e o próximo que a lei não enxerga.",
    en: "Two weeks on the right of the poor, the fast God chooses, and the neighbor the law can miss.",
    es: "Dos semanas sobre el derecho del pobre, el ayuno que Dios elige y el prójimo que la ley no ve.",
  },
  "wilderness-14": {
    pt: "Do maná à tentação de Jesus. O deserto como escola: fome, queixa, pão e confiança.",
    en: "From manna to Jesus’ temptation. The wilderness as a school: hunger, complaint, bread, and trust.",
    es: "Del maná a la tentación de Jesús. El desierto como escuela: hambre, queja, pan y confianza.",
  },
  "covenant-14": {
    pt: "As alianças em cadeia: Noé, Abraão, Sinai, Davi, a nova aliança em Jeremias e na ceia.",
    en: "The covenants in a chain: Noah, Abraham, Sinai, David, the new covenant in Jeremiah and at the table.",
    es: "Los pactos en cadena: Noé, Abraham, Sinaí, David, el nuevo pacto en Jeremías y en la cena.",
  },
  "holy-week": {
    pt: "Oito dias, da entrada em Jerusalém à ressurreição. Para ler na Semana Santa, ou em qualquer semana.",
    en: "Eight days, from the entry into Jerusalem to the resurrection. For Holy Week, or any week.",
    es: "Ocho días, de la entrada en Jerusalén a la resurrección. Para la Semana Santa, o cualquier semana.",
  },
  "advent-24": {
    pt: "Vinte e quatro capítulos até o Natal: profecias, salmos reais, a natividade e o nome que é acima de todo nome.",
    en: "Twenty-four chapters toward Christmas: prophecies, royal psalms, the nativity, and the name above every name.",
    es: "Veinticuatro capítulos hacia la Navidad: profecías, salmos reales, la natividad y el nombre sobre todo nombre.",
  },
  "who-is-jesus": {
    pt: "Catorze capítulos que perguntam quem ele é: o Verbo, o pão, o pastor, o crucificado e o ressuscitado.",
    en: "Fourteen chapters that ask who he is: the Word, the bread, the shepherd, the crucified and the risen.",
    es: "Catorce capítulos que preguntan quién es: el Verbo, el pan, el pastor, el crucificado y el resucitado.",
  },
  "lament-14": {
    pt: "Salmos de luto e um capítulo de Lamentações. Para quando a fé precisa de palavras escuras.",
    en: "Psalms of grief and a chapter of Lamentations. For when faith needs dark words.",
    es: "Salmos de duelo y un capítulo de Lamentaciones. Para cuando la fe necesita palabras oscuras.",
  },
  "wisdom-21": {
    pt: "Jó, Provérbios, Eclesiastes e um pouco de Tiago. O medo do Senhor, o limite da razão e o caminho prático.",
    en: "Job, Proverbs, Ecclesiastes and a little James. The fear of the Lord, the limit of reason, and the practical path.",
    es: "Job, Proverbios, Eclesiastés y un poco de Santiago. El temor del Señor, el límite de la razón y el camino práctico.",
  },
  "apocalyptic": {
    pt: "Daniel e Apocalipse, um capítulo por dia. Impérios, cordeiros e a esperança que não se rende à história.",
    en: "Daniel and Revelation, one chapter a day. Empires, lambs, and a hope that will not bow to history.",
    es: "Daniel y Apocalipsis, un capítulo al día. Imperios, corderos y la esperanza que no se rinde a la historia.",
  },
  "early-church": {
    pt: "Atos, Tiago, 1 Pedro e 1 João. A igreja que nasce, sofre e aprende a amar de verdade.",
    en: "Acts, James, 1 Peter and 1 John. The church that is born, suffers, and learns to love in earnest.",
    es: "Hechos, Santiago, 1 Pedro y 1 Juan. La iglesia que nace, sufre y aprende a amar de verdad.",
  },
};

export function planLead(id: string, locale: Locale): string {
  return PLAN_LEADS[id]?.[locale] ?? "";
}

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
