export type Locale = "pt" | "en" | "es";
export type Testament = "ot" | "nt";

export type Book = {
  id: string;
  num: number;
  testament: Testament;
  osis: string;
  logos: string;
  bibliaOnline: string;
  blb: string;
  bibleHub: string;
  names: Record<Locale, string>;
  abbr: Record<Locale, string>;
  verses: number[];
};

export const BOOKS: Book[] = [
  {
    "id": "GEN",
    "osis": "Gen",
    "logos": "Ge",
    "bibliaOnline": "gn",
    "blb": "gen",
    "bibleHub": "genesis",
    "testament": "ot",
    "names": {
      "pt": "Gênesis",
      "en": "Genesis",
      "es": "Génesis"
    },
    "abbr": {
      "pt": "Gn",
      "en": "Gen",
      "es": "Gn"
    },
    "num": 1,
    "verses": [
      31,
      25,
      24,
      26,
      32,
      22,
      24,
      22,
      29,
      32,
      32,
      20,
      18,
      24,
      21,
      16,
      27,
      33,
      38,
      18,
      34,
      24,
      20,
      67,
      34,
      35,
      46,
      22,
      35,
      43,
      55,
      32,
      20,
      31,
      29,
      43,
      36,
      30,
      23,
      23,
      57,
      38,
      34,
      34,
      28,
      34,
      31,
      22,
      33,
      26
    ]
  },
  {
    "id": "EXO",
    "osis": "Exod",
    "logos": "Ex",
    "bibliaOnline": "ex",
    "blb": "exo",
    "bibleHub": "exodus",
    "testament": "ot",
    "names": {
      "pt": "Êxodo",
      "en": "Exodus",
      "es": "Éxodo"
    },
    "abbr": {
      "pt": "Ex",
      "en": "Exod",
      "es": "Ex"
    },
    "num": 2,
    "verses": [
      22,
      25,
      22,
      31,
      23,
      30,
      25,
      32,
      35,
      29,
      10,
      51,
      22,
      31,
      27,
      36,
      16,
      27,
      25,
      26,
      36,
      31,
      33,
      18,
      40,
      37,
      21,
      43,
      46,
      38,
      18,
      35,
      23,
      35,
      35,
      38,
      29,
      31,
      43,
      38
    ]
  },
  {
    "id": "LEV",
    "osis": "Lev",
    "logos": "Le",
    "bibliaOnline": "lv",
    "blb": "lev",
    "bibleHub": "leviticus",
    "testament": "ot",
    "names": {
      "pt": "Levítico",
      "en": "Leviticus",
      "es": "Levítico"
    },
    "abbr": {
      "pt": "Lv",
      "en": "Lev",
      "es": "Lv"
    },
    "num": 3,
    "verses": [
      17,
      16,
      17,
      35,
      19,
      30,
      38,
      36,
      24,
      20,
      47,
      8,
      59,
      57,
      33,
      34,
      16,
      30,
      37,
      27,
      24,
      33,
      44,
      23,
      55,
      46,
      34
    ]
  },
  {
    "id": "NUM",
    "osis": "Num",
    "logos": "Nu",
    "bibliaOnline": "nm",
    "blb": "num",
    "bibleHub": "numbers",
    "testament": "ot",
    "names": {
      "pt": "Números",
      "en": "Numbers",
      "es": "Números"
    },
    "abbr": {
      "pt": "Nm",
      "en": "Num",
      "es": "Nm"
    },
    "num": 4,
    "verses": [
      54,
      34,
      51,
      49,
      31,
      27,
      89,
      26,
      23,
      36,
      35,
      16,
      33,
      45,
      41,
      50,
      13,
      32,
      22,
      29,
      35,
      41,
      30,
      25,
      18,
      65,
      23,
      31,
      40,
      16,
      54,
      42,
      56,
      29,
      34,
      13
    ]
  },
  {
    "id": "DEU",
    "osis": "Deut",
    "logos": "Dt",
    "bibliaOnline": "dt",
    "blb": "deu",
    "bibleHub": "deuteronomy",
    "testament": "ot",
    "names": {
      "pt": "Deuteronômio",
      "en": "Deuteronomy",
      "es": "Deuteronomio"
    },
    "abbr": {
      "pt": "Dt",
      "en": "Deut",
      "es": "Dt"
    },
    "num": 5,
    "verses": [
      46,
      37,
      29,
      49,
      33,
      25,
      26,
      20,
      29,
      22,
      32,
      32,
      18,
      29,
      23,
      22,
      20,
      22,
      21,
      20,
      23,
      30,
      25,
      22,
      19,
      19,
      26,
      68,
      29,
      20,
      30,
      52,
      29,
      12
    ]
  },
  {
    "id": "JOS",
    "osis": "Josh",
    "logos": "Jos",
    "bibliaOnline": "js",
    "blb": "jos",
    "bibleHub": "joshua",
    "testament": "ot",
    "names": {
      "pt": "Josué",
      "en": "Joshua",
      "es": "Josué"
    },
    "abbr": {
      "pt": "Js",
      "en": "Josh",
      "es": "Jos"
    },
    "num": 6,
    "verses": [
      18,
      24,
      17,
      24,
      15,
      27,
      26,
      35,
      27,
      43,
      23,
      24,
      33,
      15,
      63,
      10,
      18,
      28,
      51,
      9,
      45,
      34,
      16,
      33
    ]
  },
  {
    "id": "JDG",
    "osis": "Judg",
    "logos": "Jdg",
    "bibliaOnline": "jz",
    "blb": "jdg",
    "bibleHub": "judges",
    "testament": "ot",
    "names": {
      "pt": "Juízes",
      "en": "Judges",
      "es": "Jueces"
    },
    "abbr": {
      "pt": "Jz",
      "en": "Judg",
      "es": "Jue"
    },
    "num": 7,
    "verses": [
      36,
      23,
      31,
      24,
      31,
      40,
      25,
      35,
      57,
      18,
      40,
      15,
      25,
      20,
      20,
      31,
      13,
      31,
      30,
      48,
      25
    ]
  },
  {
    "id": "RUT",
    "osis": "Ruth",
    "logos": "Ru",
    "bibliaOnline": "rt",
    "blb": "rut",
    "bibleHub": "ruth",
    "testament": "ot",
    "names": {
      "pt": "Rute",
      "en": "Ruth",
      "es": "Rut"
    },
    "abbr": {
      "pt": "Rt",
      "en": "Ruth",
      "es": "Rt"
    },
    "num": 8,
    "verses": [
      22,
      23,
      18,
      22
    ]
  },
  {
    "id": "1SA",
    "osis": "1Sam",
    "logos": "1Sa",
    "bibliaOnline": "1sm",
    "blb": "1sa",
    "bibleHub": "1_samuel",
    "testament": "ot",
    "names": {
      "pt": "1 Samuel",
      "en": "1 Samuel",
      "es": "1 Samuel"
    },
    "abbr": {
      "pt": "1Sm",
      "en": "1 Sam",
      "es": "1S"
    },
    "num": 9,
    "verses": [
      28,
      36,
      21,
      22,
      12,
      21,
      17,
      22,
      27,
      27,
      15,
      25,
      23,
      52,
      35,
      23,
      58,
      30,
      24,
      42,
      15,
      23,
      29,
      22,
      44,
      25,
      12,
      25,
      11,
      31,
      13
    ]
  },
  {
    "id": "2SA",
    "osis": "2Sam",
    "logos": "2Sa",
    "bibliaOnline": "2sm",
    "blb": "2sa",
    "bibleHub": "2_samuel",
    "testament": "ot",
    "names": {
      "pt": "2 Samuel",
      "en": "2 Samuel",
      "es": "2 Samuel"
    },
    "abbr": {
      "pt": "2Sm",
      "en": "2 Sam",
      "es": "2S"
    },
    "num": 10,
    "verses": [
      27,
      32,
      39,
      12,
      25,
      23,
      29,
      18,
      13,
      19,
      27,
      31,
      39,
      33,
      37,
      23,
      29,
      33,
      43,
      26,
      22,
      51,
      39,
      25
    ]
  },
  {
    "id": "1KI",
    "osis": "1Kgs",
    "logos": "1Ki",
    "bibliaOnline": "1rs",
    "blb": "1ki",
    "bibleHub": "1_kings",
    "testament": "ot",
    "names": {
      "pt": "1 Reis",
      "en": "1 Kings",
      "es": "1 Reyes"
    },
    "abbr": {
      "pt": "1Rs",
      "en": "1 Kgs",
      "es": "1R"
    },
    "num": 11,
    "verses": [
      53,
      46,
      28,
      34,
      18,
      38,
      51,
      66,
      28,
      29,
      43,
      33,
      34,
      31,
      34,
      34,
      24,
      46,
      21,
      43,
      29,
      53
    ]
  },
  {
    "id": "2KI",
    "osis": "2Kgs",
    "logos": "2Ki",
    "bibliaOnline": "2rs",
    "blb": "2ki",
    "bibleHub": "2_kings",
    "testament": "ot",
    "names": {
      "pt": "2 Reis",
      "en": "2 Kings",
      "es": "2 Reyes"
    },
    "abbr": {
      "pt": "2Rs",
      "en": "2 Kgs",
      "es": "2R"
    },
    "num": 12,
    "verses": [
      18,
      25,
      27,
      44,
      27,
      33,
      20,
      29,
      37,
      36,
      21,
      21,
      25,
      29,
      38,
      20,
      41,
      37,
      37,
      21,
      26,
      20,
      37,
      20,
      30
    ]
  },
  {
    "id": "1CH",
    "osis": "1Chr",
    "logos": "1Ch",
    "bibliaOnline": "1cr",
    "blb": "1ch",
    "bibleHub": "1_chronicles",
    "testament": "ot",
    "names": {
      "pt": "1 Crônicas",
      "en": "1 Chronicles",
      "es": "1 Crónicas"
    },
    "abbr": {
      "pt": "1Cr",
      "en": "1 Chr",
      "es": "1Cr"
    },
    "num": 13,
    "verses": [
      54,
      55,
      24,
      43,
      26,
      81,
      40,
      40,
      44,
      14,
      47,
      40,
      14,
      17,
      29,
      43,
      27,
      17,
      19,
      8,
      30,
      19,
      32,
      31,
      31,
      32,
      34,
      21,
      30
    ]
  },
  {
    "id": "2CH",
    "osis": "2Chr",
    "logos": "2Ch",
    "bibliaOnline": "2cr",
    "blb": "2ch",
    "bibleHub": "2_chronicles",
    "testament": "ot",
    "names": {
      "pt": "2 Crônicas",
      "en": "2 Chronicles",
      "es": "2 Crónicas"
    },
    "abbr": {
      "pt": "2Cr",
      "en": "2 Chr",
      "es": "2Cr"
    },
    "num": 14,
    "verses": [
      17,
      18,
      17,
      22,
      14,
      42,
      22,
      18,
      31,
      19,
      23,
      16,
      22,
      15,
      19,
      14,
      19,
      34,
      11,
      37,
      20,
      12,
      21,
      27,
      28,
      23,
      9,
      27,
      36,
      27,
      21,
      33,
      25,
      33,
      27,
      23
    ]
  },
  {
    "id": "EZR",
    "osis": "Ezra",
    "logos": "Ezr",
    "bibliaOnline": "ed",
    "blb": "ezr",
    "bibleHub": "ezra",
    "testament": "ot",
    "names": {
      "pt": "Esdras",
      "en": "Ezra",
      "es": "Esdras"
    },
    "abbr": {
      "pt": "Ed",
      "en": "Ezra",
      "es": "Esd"
    },
    "num": 15,
    "verses": [
      11,
      70,
      13,
      24,
      17,
      22,
      28,
      36,
      15,
      44
    ]
  },
  {
    "id": "NEH",
    "osis": "Neh",
    "logos": "Ne",
    "bibliaOnline": "ne",
    "blb": "neh",
    "bibleHub": "nehemiah",
    "testament": "ot",
    "names": {
      "pt": "Neemias",
      "en": "Nehemiah",
      "es": "Nehemías"
    },
    "abbr": {
      "pt": "Ne",
      "en": "Neh",
      "es": "Neh"
    },
    "num": 16,
    "verses": [
      11,
      20,
      32,
      23,
      19,
      19,
      73,
      18,
      38,
      39,
      36,
      47,
      31
    ]
  },
  {
    "id": "EST",
    "osis": "Esth",
    "logos": "Es",
    "bibliaOnline": "et",
    "blb": "est",
    "bibleHub": "esther",
    "testament": "ot",
    "names": {
      "pt": "Ester",
      "en": "Esther",
      "es": "Ester"
    },
    "abbr": {
      "pt": "Et",
      "en": "Esth",
      "es": "Est"
    },
    "num": 17,
    "verses": [
      22,
      23,
      15,
      17,
      14,
      14,
      10,
      17,
      32,
      3
    ]
  },
  {
    "id": "JOB",
    "osis": "Job",
    "logos": "Job",
    "bibliaOnline": "job",
    "blb": "job",
    "bibleHub": "job",
    "testament": "ot",
    "names": {
      "pt": "Jó",
      "en": "Job",
      "es": "Job"
    },
    "abbr": {
      "pt": "Jó",
      "en": "Job",
      "es": "Job"
    },
    "num": 18,
    "verses": [
      22,
      13,
      26,
      21,
      27,
      30,
      21,
      22,
      35,
      22,
      20,
      25,
      28,
      22,
      35,
      22,
      16,
      21,
      29,
      29,
      34,
      30,
      17,
      25,
      6,
      14,
      23,
      28,
      25,
      31,
      40,
      22,
      33,
      37,
      16,
      33,
      24,
      41,
      30,
      24,
      34,
      17
    ]
  },
  {
    "id": "PSA",
    "osis": "Ps",
    "logos": "Ps",
    "bibliaOnline": "sl",
    "blb": "psa",
    "bibleHub": "psalms",
    "testament": "ot",
    "names": {
      "pt": "Salmos",
      "en": "Psalms",
      "es": "Salmos"
    },
    "abbr": {
      "pt": "Sl",
      "en": "Ps",
      "es": "Sal"
    },
    "num": 19,
    "verses": [
      6,
      12,
      8,
      8,
      12,
      10,
      17,
      9,
      20,
      18,
      7,
      8,
      6,
      7,
      5,
      11,
      15,
      50,
      14,
      9,
      13,
      31,
      6,
      10,
      22,
      12,
      14,
      9,
      11,
      12,
      24,
      11,
      22,
      22,
      28,
      12,
      40,
      22,
      13,
      17,
      13,
      11,
      5,
      26,
      17,
      11,
      9,
      14,
      20,
      23,
      19,
      9,
      6,
      7,
      23,
      13,
      11,
      11,
      17,
      12,
      8,
      12,
      11,
      10,
      13,
      20,
      7,
      35,
      36,
      5,
      24,
      20,
      28,
      23,
      10,
      12,
      20,
      72,
      13,
      19,
      16,
      8,
      18,
      12,
      13,
      17,
      7,
      18,
      52,
      17,
      16,
      15,
      5,
      23,
      11,
      13,
      12,
      9,
      9,
      5,
      8,
      28,
      22,
      35,
      45,
      48,
      43,
      13,
      31,
      7,
      10,
      10,
      9,
      8,
      18,
      19,
      2,
      29,
      176,
      7,
      8,
      9,
      4,
      8,
      5,
      6,
      5,
      6,
      8,
      8,
      3,
      18,
      3,
      3,
      21,
      26,
      9,
      8,
      24,
      13,
      10,
      7,
      12,
      15,
      21,
      10,
      20,
      14,
      9,
      6
    ]
  },
  {
    "id": "PRO",
    "osis": "Prov",
    "logos": "Pr",
    "bibliaOnline": "pv",
    "blb": "pro",
    "bibleHub": "proverbs",
    "testament": "ot",
    "names": {
      "pt": "Provérbios",
      "en": "Proverbs",
      "es": "Proverbios"
    },
    "abbr": {
      "pt": "Pv",
      "en": "Prov",
      "es": "Pr"
    },
    "num": 20,
    "verses": [
      33,
      22,
      35,
      27,
      23,
      35,
      27,
      36,
      18,
      32,
      31,
      28,
      25,
      35,
      33,
      33,
      28,
      24,
      29,
      30,
      31,
      29,
      35,
      34,
      28,
      28,
      27,
      28,
      27,
      33,
      31
    ]
  },
  {
    "id": "ECC",
    "osis": "Eccl",
    "logos": "Ec",
    "bibliaOnline": "ec",
    "blb": "ecc",
    "bibleHub": "ecclesiastes",
    "testament": "ot",
    "names": {
      "pt": "Eclesiastes",
      "en": "Ecclesiastes",
      "es": "Eclesiastés"
    },
    "abbr": {
      "pt": "Ec",
      "en": "Eccl",
      "es": "Ec"
    },
    "num": 21,
    "verses": [
      18,
      26,
      22,
      16,
      20,
      12,
      29,
      17,
      18,
      20,
      10,
      14
    ]
  },
  {
    "id": "SNG",
    "osis": "Song",
    "logos": "So",
    "bibliaOnline": "ct",
    "blb": "sng",
    "bibleHub": "song_of_solomon",
    "testament": "ot",
    "names": {
      "pt": "Cânticos",
      "en": "Song of Songs",
      "es": "Cantares"
    },
    "abbr": {
      "pt": "Ct",
      "en": "Song",
      "es": "Cnt"
    },
    "num": 22,
    "verses": [
      17,
      17,
      11,
      16,
      16,
      13,
      13,
      14
    ]
  },
  {
    "id": "ISA",
    "osis": "Isa",
    "logos": "Is",
    "bibliaOnline": "is",
    "blb": "isa",
    "bibleHub": "isaiah",
    "testament": "ot",
    "names": {
      "pt": "Isaías",
      "en": "Isaiah",
      "es": "Isaías"
    },
    "abbr": {
      "pt": "Is",
      "en": "Isa",
      "es": "Is"
    },
    "num": 23,
    "verses": [
      31,
      22,
      26,
      6,
      30,
      13,
      25,
      22,
      21,
      34,
      16,
      6,
      22,
      32,
      9,
      14,
      14,
      7,
      25,
      6,
      17,
      25,
      18,
      23,
      12,
      21,
      13,
      29,
      24,
      33,
      9,
      20,
      24,
      17,
      10,
      22,
      38,
      22,
      8,
      31,
      29,
      25,
      28,
      28,
      25,
      13,
      15,
      22,
      26,
      11,
      23,
      15,
      12,
      17,
      13,
      12,
      21,
      14,
      21,
      22,
      11,
      12,
      19,
      12,
      25,
      24
    ]
  },
  {
    "id": "JER",
    "osis": "Jer",
    "logos": "Je",
    "bibliaOnline": "jr",
    "blb": "jer",
    "bibleHub": "jeremiah",
    "testament": "ot",
    "names": {
      "pt": "Jeremias",
      "en": "Jeremiah",
      "es": "Jeremías"
    },
    "abbr": {
      "pt": "Jr",
      "en": "Jer",
      "es": "Jer"
    },
    "num": 24,
    "verses": [
      19,
      37,
      25,
      31,
      31,
      30,
      34,
      22,
      26,
      25,
      23,
      17,
      27,
      22,
      21,
      21,
      27,
      23,
      15,
      18,
      14,
      30,
      40,
      10,
      38,
      24,
      22,
      17,
      32,
      24,
      40,
      44,
      26,
      22,
      19,
      32,
      21,
      28,
      18,
      16,
      18,
      22,
      13,
      30,
      5,
      28,
      7,
      47,
      39,
      46,
      64,
      34
    ]
  },
  {
    "id": "LAM",
    "osis": "Lam",
    "logos": "La",
    "bibliaOnline": "lm",
    "blb": "lam",
    "bibleHub": "lamentations",
    "testament": "ot",
    "names": {
      "pt": "Lamentações",
      "en": "Lamentations",
      "es": "Lamentaciones"
    },
    "abbr": {
      "pt": "Lm",
      "en": "Lam",
      "es": "Lm"
    },
    "num": 25,
    "verses": [
      22,
      22,
      66,
      22,
      22
    ]
  },
  {
    "id": "EZK",
    "osis": "Ezek",
    "logos": "Eze",
    "bibliaOnline": "ez",
    "blb": "eze",
    "bibleHub": "ezekiel",
    "testament": "ot",
    "names": {
      "pt": "Ezequiel",
      "en": "Ezekiel",
      "es": "Ezequiel"
    },
    "abbr": {
      "pt": "Ez",
      "en": "Ezek",
      "es": "Ez"
    },
    "num": 26,
    "verses": [
      28,
      10,
      27,
      17,
      17,
      14,
      27,
      18,
      11,
      22,
      25,
      28,
      23,
      23,
      8,
      63,
      24,
      32,
      14,
      49,
      32,
      31,
      49,
      27,
      17,
      21,
      36,
      26,
      21,
      26,
      18,
      32,
      33,
      31,
      15,
      38,
      28,
      23,
      29,
      49,
      26,
      20,
      27,
      31,
      25,
      24,
      23,
      35
    ]
  },
  {
    "id": "DAN",
    "osis": "Dan",
    "logos": "Da",
    "bibliaOnline": "dn",
    "blb": "dan",
    "bibleHub": "daniel",
    "testament": "ot",
    "names": {
      "pt": "Daniel",
      "en": "Daniel",
      "es": "Daniel"
    },
    "abbr": {
      "pt": "Dn",
      "en": "Dan",
      "es": "Dn"
    },
    "num": 27,
    "verses": [
      21,
      49,
      30,
      37,
      31,
      28,
      28,
      27,
      27,
      21,
      45,
      13
    ]
  },
  {
    "id": "HOS",
    "osis": "Hos",
    "logos": "Ho",
    "bibliaOnline": "os",
    "blb": "hos",
    "bibleHub": "hosea",
    "testament": "ot",
    "names": {
      "pt": "Oséias",
      "en": "Hosea",
      "es": "Oseas"
    },
    "abbr": {
      "pt": "Os",
      "en": "Hos",
      "es": "Os"
    },
    "num": 28,
    "verses": [
      11,
      23,
      5,
      19,
      15,
      11,
      16,
      14,
      17,
      15,
      12,
      14,
      16,
      9
    ]
  },
  {
    "id": "JOL",
    "osis": "Joel",
    "logos": "Joe",
    "bibliaOnline": "jl",
    "blb": "joe",
    "bibleHub": "joel",
    "testament": "ot",
    "names": {
      "pt": "Joel",
      "en": "Joel",
      "es": "Joel"
    },
    "abbr": {
      "pt": "Jl",
      "en": "Joel",
      "es": "Jl"
    },
    "num": 29,
    "verses": [
      20,
      32,
      21
    ]
  },
  {
    "id": "AMO",
    "osis": "Amos",
    "logos": "Am",
    "bibliaOnline": "am",
    "blb": "amo",
    "bibleHub": "amos",
    "testament": "ot",
    "names": {
      "pt": "Amós",
      "en": "Amos",
      "es": "Amós"
    },
    "abbr": {
      "pt": "Am",
      "en": "Amos",
      "es": "Am"
    },
    "num": 30,
    "verses": [
      15,
      16,
      15,
      13,
      27,
      14,
      17,
      14,
      15
    ]
  },
  {
    "id": "OBA",
    "osis": "Obad",
    "logos": "Ob",
    "bibliaOnline": "ob",
    "blb": "oba",
    "bibleHub": "obadiah",
    "testament": "ot",
    "names": {
      "pt": "Obadias",
      "en": "Obadiah",
      "es": "Abdías"
    },
    "abbr": {
      "pt": "Ob",
      "en": "Obad",
      "es": "Abd"
    },
    "num": 31,
    "verses": [
      21
    ]
  },
  {
    "id": "JON",
    "osis": "Jonah",
    "logos": "Jon",
    "bibliaOnline": "jn",
    "blb": "jon",
    "bibleHub": "jonah",
    "testament": "ot",
    "names": {
      "pt": "Jonas",
      "en": "Jonah",
      "es": "Jonás"
    },
    "abbr": {
      "pt": "Jn",
      "en": "Jonah",
      "es": "Jon"
    },
    "num": 32,
    "verses": [
      17,
      10,
      10,
      11
    ]
  },
  {
    "id": "MIC",
    "osis": "Mic",
    "logos": "Mic",
    "bibliaOnline": "mq",
    "blb": "mic",
    "bibleHub": "micah",
    "testament": "ot",
    "names": {
      "pt": "Miqueias",
      "en": "Micah",
      "es": "Miqueas"
    },
    "abbr": {
      "pt": "Mq",
      "en": "Mic",
      "es": "Mi"
    },
    "num": 33,
    "verses": [
      16,
      13,
      12,
      13,
      15,
      16,
      20
    ]
  },
  {
    "id": "NAM",
    "osis": "Nah",
    "logos": "Na",
    "bibliaOnline": "na",
    "blb": "nah",
    "bibleHub": "nahum",
    "testament": "ot",
    "names": {
      "pt": "Naum",
      "en": "Nahum",
      "es": "Nahúm"
    },
    "abbr": {
      "pt": "Na",
      "en": "Nah",
      "es": "Nah"
    },
    "num": 34,
    "verses": [
      15,
      13,
      19
    ]
  },
  {
    "id": "HAB",
    "osis": "Hab",
    "logos": "Hab",
    "bibliaOnline": "hc",
    "blb": "hab",
    "bibleHub": "habakkuk",
    "testament": "ot",
    "names": {
      "pt": "Habacuque",
      "en": "Habakkuk",
      "es": "Habacuc"
    },
    "abbr": {
      "pt": "Hc",
      "en": "Hab",
      "es": "Hab"
    },
    "num": 35,
    "verses": [
      17,
      20,
      19
    ]
  },
  {
    "id": "ZEP",
    "osis": "Zeph",
    "logos": "Zep",
    "bibliaOnline": "sf",
    "blb": "zep",
    "bibleHub": "zephaniah",
    "testament": "ot",
    "names": {
      "pt": "Sofonias",
      "en": "Zephaniah",
      "es": "Sofonías"
    },
    "abbr": {
      "pt": "Sf",
      "en": "Zeph",
      "es": "Sof"
    },
    "num": 36,
    "verses": [
      18,
      15,
      20
    ]
  },
  {
    "id": "HAG",
    "osis": "Hag",
    "logos": "Hag",
    "bibliaOnline": "ag",
    "blb": "hag",
    "bibleHub": "haggai",
    "testament": "ot",
    "names": {
      "pt": "Ageu",
      "en": "Haggai",
      "es": "Hageo"
    },
    "abbr": {
      "pt": "Ag",
      "en": "Hag",
      "es": "Hag"
    },
    "num": 37,
    "verses": [
      15,
      23
    ]
  },
  {
    "id": "ZEC",
    "osis": "Zech",
    "logos": "Zec",
    "bibliaOnline": "zc",
    "blb": "zec",
    "bibleHub": "zechariah",
    "testament": "ot",
    "names": {
      "pt": "Zacarias",
      "en": "Zechariah",
      "es": "Zacarías"
    },
    "abbr": {
      "pt": "Zc",
      "en": "Zech",
      "es": "Zac"
    },
    "num": 38,
    "verses": [
      21,
      13,
      10,
      14,
      11,
      15,
      14,
      23,
      17,
      12,
      17,
      14,
      9,
      21
    ]
  },
  {
    "id": "MAL",
    "osis": "Mal",
    "logos": "Mal",
    "bibliaOnline": "ml",
    "blb": "mal",
    "bibleHub": "malachi",
    "testament": "ot",
    "names": {
      "pt": "Malaquias",
      "en": "Malachi",
      "es": "Malaquías"
    },
    "abbr": {
      "pt": "Ml",
      "en": "Mal",
      "es": "Mal"
    },
    "num": 39,
    "verses": [
      14,
      17,
      18,
      6
    ]
  },
  {
    "id": "MAT",
    "osis": "Matt",
    "logos": "Mt",
    "bibliaOnline": "mt",
    "blb": "mat",
    "bibleHub": "matthew",
    "testament": "nt",
    "names": {
      "pt": "Mateus",
      "en": "Matthew",
      "es": "Mateo"
    },
    "abbr": {
      "pt": "Mt",
      "en": "Matt",
      "es": "Mt"
    },
    "num": 40,
    "verses": [
      25,
      23,
      17,
      25,
      48,
      34,
      29,
      34,
      38,
      42,
      30,
      50,
      58,
      36,
      39,
      28,
      27,
      35,
      30,
      34,
      46,
      46,
      39,
      51,
      46,
      75,
      66,
      20
    ]
  },
  {
    "id": "MRK",
    "osis": "Mark",
    "logos": "Mk",
    "bibliaOnline": "mc",
    "blb": "mrk",
    "bibleHub": "mark",
    "testament": "nt",
    "names": {
      "pt": "Marcos",
      "en": "Mark",
      "es": "Marcos"
    },
    "abbr": {
      "pt": "Mc",
      "en": "Mark",
      "es": "Mc"
    },
    "num": 41,
    "verses": [
      45,
      28,
      35,
      41,
      43,
      56,
      37,
      38,
      50,
      52,
      33,
      44,
      37,
      72,
      47,
      20
    ]
  },
  {
    "id": "LUK",
    "osis": "Luke",
    "logos": "Lk",
    "bibliaOnline": "lc",
    "blb": "luk",
    "bibleHub": "luke",
    "testament": "nt",
    "names": {
      "pt": "Lucas",
      "en": "Luke",
      "es": "Lucas"
    },
    "abbr": {
      "pt": "Lc",
      "en": "Luke",
      "es": "Lc"
    },
    "num": 42,
    "verses": [
      80,
      52,
      38,
      44,
      39,
      49,
      50,
      56,
      62,
      42,
      54,
      59,
      35,
      35,
      32,
      31,
      37,
      43,
      48,
      47,
      38,
      71,
      56,
      53
    ]
  },
  {
    "id": "JHN",
    "osis": "John",
    "logos": "Jn",
    "bibliaOnline": "jo",
    "blb": "jhn",
    "bibleHub": "john",
    "testament": "nt",
    "names": {
      "pt": "João",
      "en": "John",
      "es": "Juan"
    },
    "abbr": {
      "pt": "Jo",
      "en": "John",
      "es": "Jn"
    },
    "num": 43,
    "verses": [
      51,
      25,
      36,
      54,
      47,
      71,
      53,
      59,
      41,
      42,
      57,
      50,
      38,
      31,
      27,
      33,
      26,
      40,
      42,
      31,
      25
    ]
  },
  {
    "id": "ACT",
    "osis": "Acts",
    "logos": "Ac",
    "bibliaOnline": "at",
    "blb": "act",
    "bibleHub": "acts",
    "testament": "nt",
    "names": {
      "pt": "Atos",
      "en": "Acts",
      "es": "Hechos"
    },
    "abbr": {
      "pt": "At",
      "en": "Acts",
      "es": "Hch"
    },
    "num": 44,
    "verses": [
      26,
      47,
      26,
      37,
      42,
      15,
      60,
      40,
      43,
      48,
      30,
      25,
      52,
      28,
      41,
      40,
      34,
      28,
      41,
      38,
      40,
      30,
      35,
      27,
      27,
      32,
      44,
      31
    ]
  },
  {
    "id": "ROM",
    "osis": "Rom",
    "logos": "Ro",
    "bibliaOnline": "rm",
    "blb": "rom",
    "bibleHub": "romans",
    "testament": "nt",
    "names": {
      "pt": "Romanos",
      "en": "Romans",
      "es": "Romanos"
    },
    "abbr": {
      "pt": "Rm",
      "en": "Rom",
      "es": "Ro"
    },
    "num": 45,
    "verses": [
      32,
      29,
      31,
      25,
      21,
      23,
      25,
      39,
      33,
      21,
      36,
      21,
      14,
      23,
      33,
      27
    ]
  },
  {
    "id": "1CO",
    "osis": "1Cor",
    "logos": "1Co",
    "bibliaOnline": "1co",
    "blb": "1co",
    "bibleHub": "1_corinthians",
    "testament": "nt",
    "names": {
      "pt": "1 Coríntios",
      "en": "1 Corinthians",
      "es": "1 Corintios"
    },
    "abbr": {
      "pt": "1Co",
      "en": "1 Cor",
      "es": "1Co"
    },
    "num": 46,
    "verses": [
      31,
      16,
      23,
      21,
      13,
      20,
      40,
      13,
      27,
      33,
      34,
      31,
      13,
      40,
      58,
      24
    ]
  },
  {
    "id": "2CO",
    "osis": "2Cor",
    "logos": "2Co",
    "bibliaOnline": "2co",
    "blb": "2co",
    "bibleHub": "2_corinthians",
    "testament": "nt",
    "names": {
      "pt": "2 Coríntios",
      "en": "2 Corinthians",
      "es": "2 Corintios"
    },
    "abbr": {
      "pt": "2Co",
      "en": "2 Cor",
      "es": "2Co"
    },
    "num": 47,
    "verses": [
      24,
      17,
      18,
      18,
      21,
      18,
      16,
      24,
      15,
      18,
      33,
      21,
      14
    ]
  },
  {
    "id": "GAL",
    "osis": "Gal",
    "logos": "Ga",
    "bibliaOnline": "gl",
    "blb": "gal",
    "bibleHub": "galatians",
    "testament": "nt",
    "names": {
      "pt": "Gálatas",
      "en": "Galatians",
      "es": "Gálatas"
    },
    "abbr": {
      "pt": "Gl",
      "en": "Gal",
      "es": "Gá"
    },
    "num": 48,
    "verses": [
      24,
      21,
      29,
      31,
      26,
      18
    ]
  },
  {
    "id": "EPH",
    "osis": "Eph",
    "logos": "Eph",
    "bibliaOnline": "ef",
    "blb": "eph",
    "bibleHub": "ephesians",
    "testament": "nt",
    "names": {
      "pt": "Efésios",
      "en": "Ephesians",
      "es": "Efesios"
    },
    "abbr": {
      "pt": "Ef",
      "en": "Eph",
      "es": "Ef"
    },
    "num": 49,
    "verses": [
      23,
      22,
      21,
      32,
      33,
      24
    ]
  },
  {
    "id": "PHP",
    "osis": "Phil",
    "logos": "Php",
    "bibliaOnline": "fp",
    "blb": "phl",
    "bibleHub": "philippians",
    "testament": "nt",
    "names": {
      "pt": "Filipenses",
      "en": "Philippians",
      "es": "Filipenses"
    },
    "abbr": {
      "pt": "Fp",
      "en": "Phil",
      "es": "Fil"
    },
    "num": 50,
    "verses": [
      30,
      30,
      21,
      23
    ]
  },
  {
    "id": "COL",
    "osis": "Col",
    "logos": "Col",
    "bibliaOnline": "cl",
    "blb": "col",
    "bibleHub": "colossians",
    "testament": "nt",
    "names": {
      "pt": "Colossenses",
      "en": "Colossians",
      "es": "Colosenses"
    },
    "abbr": {
      "pt": "Cl",
      "en": "Col",
      "es": "Col"
    },
    "num": 51,
    "verses": [
      29,
      23,
      25,
      18
    ]
  },
  {
    "id": "1TH",
    "osis": "1Thess",
    "logos": "1Th",
    "bibliaOnline": "1ts",
    "blb": "1th",
    "bibleHub": "1_thessalonians",
    "testament": "nt",
    "names": {
      "pt": "1 Tessalonicenses",
      "en": "1 Thessalonians",
      "es": "1 Tesalonicenses"
    },
    "abbr": {
      "pt": "1Ts",
      "en": "1 Thess",
      "es": "1Ts"
    },
    "num": 52,
    "verses": [
      10,
      20,
      13,
      18,
      28
    ]
  },
  {
    "id": "2TH",
    "osis": "2Thess",
    "logos": "2Th",
    "bibliaOnline": "2ts",
    "blb": "2th",
    "bibleHub": "2_thessalonians",
    "testament": "nt",
    "names": {
      "pt": "2 Tessalonicenses",
      "en": "2 Thessalonians",
      "es": "2 Tesalonicenses"
    },
    "abbr": {
      "pt": "2Ts",
      "en": "2 Thess",
      "es": "2Ts"
    },
    "num": 53,
    "verses": [
      12,
      17,
      18
    ]
  },
  {
    "id": "1TI",
    "osis": "1Tim",
    "logos": "1Ti",
    "bibliaOnline": "1tm",
    "blb": "1ti",
    "bibleHub": "1_timothy",
    "testament": "nt",
    "names": {
      "pt": "1 Timóteo",
      "en": "1 Timothy",
      "es": "1 Timoteo"
    },
    "abbr": {
      "pt": "1Tm",
      "en": "1 Tim",
      "es": "1Ti"
    },
    "num": 54,
    "verses": [
      20,
      15,
      16,
      16,
      25,
      21
    ]
  },
  {
    "id": "2TI",
    "osis": "2Tim",
    "logos": "2Ti",
    "bibliaOnline": "2tm",
    "blb": "2ti",
    "bibleHub": "2_timothy",
    "testament": "nt",
    "names": {
      "pt": "2 Timóteo",
      "en": "2 Timothy",
      "es": "2 Timoteo"
    },
    "abbr": {
      "pt": "2Tm",
      "en": "2 Tim",
      "es": "2Ti"
    },
    "num": 55,
    "verses": [
      18,
      26,
      17,
      22
    ]
  },
  {
    "id": "TIT",
    "osis": "Titus",
    "logos": "Tit",
    "bibliaOnline": "tt",
    "blb": "tit",
    "bibleHub": "titus",
    "testament": "nt",
    "names": {
      "pt": "Tito",
      "en": "Titus",
      "es": "Tito"
    },
    "abbr": {
      "pt": "Tt",
      "en": "Titus",
      "es": "Tit"
    },
    "num": 56,
    "verses": [
      16,
      15,
      15
    ]
  },
  {
    "id": "PHM",
    "osis": "Phlm",
    "logos": "Phm",
    "bibliaOnline": "fm",
    "blb": "phm",
    "bibleHub": "philemon",
    "testament": "nt",
    "names": {
      "pt": "Filemom",
      "en": "Philemon",
      "es": "Filemón"
    },
    "abbr": {
      "pt": "Fm",
      "en": "Phlm",
      "es": "Flm"
    },
    "num": 57,
    "verses": [
      25
    ]
  },
  {
    "id": "HEB",
    "osis": "Heb",
    "logos": "Heb",
    "bibliaOnline": "hb",
    "blb": "heb",
    "bibleHub": "hebrews",
    "testament": "nt",
    "names": {
      "pt": "Hebreus",
      "en": "Hebrews",
      "es": "Hebreos"
    },
    "abbr": {
      "pt": "Hb",
      "en": "Heb",
      "es": "He"
    },
    "num": 58,
    "verses": [
      14,
      18,
      19,
      16,
      14,
      20,
      28,
      13,
      28,
      39,
      40,
      29,
      25
    ]
  },
  {
    "id": "JAS",
    "osis": "Jas",
    "logos": "Jas",
    "bibliaOnline": "tg",
    "blb": "jas",
    "bibleHub": "james",
    "testament": "nt",
    "names": {
      "pt": "Tiago",
      "en": "James",
      "es": "Santiago"
    },
    "abbr": {
      "pt": "Tg",
      "en": "Jas",
      "es": "Stg"
    },
    "num": 59,
    "verses": [
      27,
      26,
      18,
      17,
      20
    ]
  },
  {
    "id": "1PE",
    "osis": "1Pet",
    "logos": "1Pe",
    "bibliaOnline": "1pe",
    "blb": "1pe",
    "bibleHub": "1_peter",
    "testament": "nt",
    "names": {
      "pt": "1 Pedro",
      "en": "1 Peter",
      "es": "1 Pedro"
    },
    "abbr": {
      "pt": "1Pe",
      "en": "1 Pet",
      "es": "1P"
    },
    "num": 60,
    "verses": [
      25,
      25,
      22,
      19,
      14
    ]
  },
  {
    "id": "2PE",
    "osis": "2Pet",
    "logos": "2Pe",
    "bibliaOnline": "2pe",
    "blb": "2pe",
    "bibleHub": "2_peter",
    "testament": "nt",
    "names": {
      "pt": "2 Pedro",
      "en": "2 Peter",
      "es": "2 Pedro"
    },
    "abbr": {
      "pt": "2Pe",
      "en": "2 Pet",
      "es": "2P"
    },
    "num": 61,
    "verses": [
      21,
      22,
      18
    ]
  },
  {
    "id": "1JN",
    "osis": "1John",
    "logos": "1Jn",
    "bibliaOnline": "1jo",
    "blb": "1jo",
    "bibleHub": "1_john",
    "testament": "nt",
    "names": {
      "pt": "1 João",
      "en": "1 John",
      "es": "1 Juan"
    },
    "abbr": {
      "pt": "1Jo",
      "en": "1 John",
      "es": "1Jn"
    },
    "num": 62,
    "verses": [
      10,
      29,
      24,
      21,
      21
    ]
  },
  {
    "id": "2JN",
    "osis": "2John",
    "logos": "2Jn",
    "bibliaOnline": "2jo",
    "blb": "2jo",
    "bibleHub": "2_john",
    "testament": "nt",
    "names": {
      "pt": "2 João",
      "en": "2 John",
      "es": "2 Juan"
    },
    "abbr": {
      "pt": "2Jo",
      "en": "2 John",
      "es": "2Jn"
    },
    "num": 63,
    "verses": [
      13
    ]
  },
  {
    "id": "3JN",
    "osis": "3John",
    "logos": "3Jn",
    "bibliaOnline": "3jo",
    "blb": "3jo",
    "bibleHub": "3_john",
    "testament": "nt",
    "names": {
      "pt": "3 João",
      "en": "3 John",
      "es": "3 Juan"
    },
    "abbr": {
      "pt": "3Jo",
      "en": "3 John",
      "es": "3Jn"
    },
    "num": 64,
    "verses": [
      14
    ]
  },
  {
    "id": "JUD",
    "osis": "Jude",
    "logos": "Jud",
    "bibliaOnline": "jd",
    "blb": "jde",
    "bibleHub": "jude",
    "testament": "nt",
    "names": {
      "pt": "Judas",
      "en": "Jude",
      "es": "Judas"
    },
    "abbr": {
      "pt": "Jd",
      "en": "Jude",
      "es": "Jds"
    },
    "num": 65,
    "verses": [
      25
    ]
  },
  {
    "id": "REV",
    "osis": "Rev",
    "logos": "Re",
    "bibliaOnline": "ap",
    "blb": "rev",
    "bibleHub": "revelation",
    "testament": "nt",
    "names": {
      "pt": "Apocalipse",
      "en": "Revelation",
      "es": "Apocalipsis"
    },
    "abbr": {
      "pt": "Ap",
      "en": "Rev",
      "es": "Ap"
    },
    "num": 66,
    "verses": [
      20,
      29,
      22,
      11,
      14,
      17,
      17,
      13,
      21,
      11,
      19,
      17,
      18,
      20,
      8,
      21,
      18,
      24,
      21,
      15,
      27,
      21
    ]
  }
];

export const OT_BOOKS = BOOKS.filter((b) => b.testament === "ot");
export const NT_BOOKS = BOOKS.filter((b) => b.testament === "nt");

export function bookById(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id);
}
