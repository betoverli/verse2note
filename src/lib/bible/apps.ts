import type { Book, Locale } from "./books";
import { bookById } from "./books";
import type { Passage } from "./passage";
import { verseBounds } from "./passage";
import type { Translation } from "./translations";

export type BibleAppId =
  | "youversion"
  | "tecarta"
  | "logos"
  | "olive-tree"
  | "bible-gateway"
  | "blue-letter"
  | "esv"
  | "biblia-online"
  | "bible-hub"
  | "accordance"
  | "e-sword"
  | "mysword"
  | "jw-library";

export type BibleApp = {
  id: BibleAppId;
  mark: string;
  names: Record<Locale, string>;
  blurb: Record<Locale, string>;
  hasWeb: boolean;
  hasNative: boolean;
  usesTranslation: boolean;
};

export const BIBLE_APPS: BibleApp[] = [
  {
    id: "youversion",
    mark: "YV",
    names: {
      pt: "YouVersion (Bible App)",
      en: "YouVersion (Bible App)",
      es: "YouVersion (Bible App)",
    },
    blurb: {
      pt: "O app mais usado no mundo. O link abre o app ou bible.com.",
      en: "The most widely used Bible app. Opens the app or bible.com.",
      es: "La app más usada. Abre la app o bible.com.",
    },
    hasWeb: true,
    hasNative: true,
    usesTranslation: true,
  },
  {
    id: "tecarta",
    mark: "TB",
    names: { pt: "Life Bible (Tecarta)", en: "Life Bible (Tecarta)", es: "Life Bible (Tecarta)" },
    blurb: {
      pt: "Popular no Brasil e nos EUA. Link web e esquema bible://.",
      en: "Popular study app. Web link and bible:// scheme.",
      es: "App de estudio popular. Enlace web y esquema bible://.",
    },
    hasWeb: true,
    hasNative: true,
    usesTranslation: false,
  },
  {
    id: "logos",
    mark: "LO",
    names: { pt: "Logos", en: "Logos", es: "Logos" },
    blurb: {
      pt: "Estudo avançado. O link ref.ly abre o Logos se estiver instalado.",
      en: "Deep study library. ref.ly opens Logos when installed.",
      es: "Estudio avanzado. ref.ly abre Logos si está instalado.",
    },
    hasWeb: true,
    hasNative: false,
    usesTranslation: false,
  },
  {
    id: "olive-tree",
    mark: "OT",
    names: { pt: "Olive Tree", en: "Olive Tree", es: "Olive Tree" },
    blurb: {
      pt: "Leitor clássico com esquema olivetree://.",
      en: "Classic reader with olivetree:// links.",
      es: "Lector clásico con enlaces olivetree://.",
    },
    hasWeb: false,
    hasNative: true,
    usesTranslation: false,
  },
  {
    id: "bible-gateway",
    mark: "BG",
    names: { pt: "Bible Gateway", en: "Bible Gateway", es: "Bible Gateway" },
    blurb: {
      pt: "Leitura no navegador, com várias traduções.",
      en: "Read in the browser across many translations.",
      es: "Lectura en el navegador, con muchas traducciones.",
    },
    hasWeb: true,
    hasNative: false,
    usesTranslation: true,
  },
  {
    id: "blue-letter",
    mark: "BL",
    names: { pt: "Blue Letter Bible", en: "Blue Letter Bible", es: "Blue Letter Bible" },
    blurb: {
      pt: "Ferramentas de estudo e originais.",
      en: "Study tools and original languages.",
      es: "Herramientas de estudio y lenguas originales.",
    },
    hasWeb: true,
    hasNative: false,
    usesTranslation: true,
  },
  {
    id: "esv",
    mark: "ES",
    names: { pt: "ESV.org (Crossway)", en: "ESV.org (Crossway)", es: "ESV.org (Crossway)" },
    blurb: {
      pt: "Texto ESV oficial da Crossway.",
      en: "Official Crossway ESV text.",
      es: "Texto ESV oficial de Crossway.",
    },
    hasWeb: true,
    hasNative: false,
    usesTranslation: false,
  },
  {
    id: "biblia-online",
    mark: "BO",
    names: { pt: "Bíblia Online", en: "Bíblia Online", es: "Bíblia Online" },
    blurb: {
      pt: "Leitura em português no navegador.",
      en: "Portuguese reading in the browser.",
      es: "Lectura en portugués en el navegador.",
    },
    hasWeb: true,
    hasNative: false,
    usesTranslation: true,
  },
  {
    id: "bible-hub",
    mark: "BH",
    names: { pt: "Bible Hub", en: "Bible Hub", es: "Bible Hub" },
    blurb: {
      pt: "Paralelos, léxico e comentários.",
      en: "Parallels, lexicons, and commentaries.",
      es: "Paralelos, léxico y comentarios.",
    },
    hasWeb: true,
    hasNative: false,
    usesTranslation: false,
  },
  {
    id: "accordance",
    mark: "AC",
    names: { pt: "Accordance", en: "Accordance", es: "Accordance" },
    blurb: {
      pt: "Software de estudo. Esquema accord://.",
      en: "Study software. accord:// scheme.",
      es: "Software de estudio. Esquema accord://.",
    },
    hasWeb: false,
    hasNative: true,
    usesTranslation: false,
  },
  {
    id: "e-sword",
    mark: "eS",
    names: { pt: "e-Sword", en: "e-Sword", es: "e-Sword" },
    blurb: {
      pt: "Estudo gratuito para desktop e mobile.",
      en: "Free study app for desktop and mobile.",
      es: "Estudio gratuito para escritorio y móvil.",
    },
    hasWeb: false,
    hasNative: true,
    usesTranslation: false,
  },
  {
    id: "mysword",
    mark: "MS",
    names: { pt: "MySword", en: "MySword", es: "MySword" },
    blurb: {
      pt: "Muito usado no Android.",
      en: "Popular on Android.",
      es: "Muy usado en Android.",
    },
    hasWeb: false,
    hasNative: true,
    usesTranslation: false,
  },
  {
    id: "jw-library",
    mark: "JW",
    names: { pt: "JW Library", en: "JW Library", es: "JW Library" },
    blurb: {
      pt: "Tradução do Novo Mundo no app JW.",
      en: "New World Translation in the JW app.",
      es: "Traducción del Nuevo Mundo en la app JW.",
    },
    hasWeb: false,
    hasNative: true,
    usesTranslation: false,
  },
];

export function appById(id: string): BibleApp {
  return BIBLE_APPS.find((a) => a.id === id) ?? BIBLE_APPS[0];
}

export function appHasOptions(app: BibleApp): boolean {
  return app.usesTranslation || (app.hasNative && app.hasWeb);
}

export function appIcon(id: string): string {
  if (id === "biblia-online") return "/apps/biblia-online.svg";
  return `/apps/${id}.png`;
}

type BuildArgs = {
  book: Book;
  passage: Passage;
  translation: Translation;
  preferNative: boolean;
};

function usfmRef(book: Book, passage: Passage): string {
  const { start, end } = verseBounds(passage);
  if (!start) return `${book.id}.${passage.chapter}`;
  if (!end || end === start) return `${book.id}.${passage.chapter}.${start}`;
  return `${book.id}.${passage.chapter}.${start}-${end}`;
}

function englishName(book: Book): string {
  return book.names.en;
}

function colonRef(book: Book, passage: Passage, locale: Locale): string {
  const name = book.names[locale];
  const { start, end } = verseBounds(passage);
  if (!start) return `${name} ${passage.chapter}`;
  if (!end || end === start) return `${name} ${passage.chapter}:${start}`;
  return `${name} ${passage.chapter}:${start}-${end}`;
}

function youVersion(args: BuildArgs): string {
  const ref = usfmRef(args.book, args.passage);
  if (args.preferNative) return `youversion://bible?reference=${ref}`;
  return `https://www.bible.com/bible/${args.translation.youVersion}/${ref}`;
}

function tecarta(args: BuildArgs): string {
  const { start, end } = verseBounds(args.passage);
  const name = englishName(args.book).replaceAll(" ", "+");
  let tail = `${name}+${args.passage.chapter}`;
  if (start) {
    tail += `:${start}`;
    if (end && end !== start) tail += `-${end}`;
  }
  if (args.preferNative) {
    const ref = `${englishName(args.book)} ${args.passage.chapter}${start ? `:${start}${end && end !== start ? `-${end}` : ""}` : ""}`;
    return `bible://${encodeURI(ref)}`;
  }
  return `https://tecartabible.com/bible/${tail}`;
}

function logos(args: BuildArgs): string {
  const { start, end } = verseBounds(args.passage);
  let ref = `${args.book.logos}${args.passage.chapter}`;
  if (start) {
    ref += `.${start}`;
    if (end && end !== start) ref += `-${end}`;
  }
  return `https://ref.ly/${ref}`;
}

function oliveTree(args: BuildArgs): string {
  const { start } = verseBounds(args.passage);
  const verse = start ?? 1;
  return `olivetree://bible/${args.book.num}.${args.passage.chapter}.${verse}`;
}

function bibleGateway(args: BuildArgs): string {
  const q = encodeURIComponent(colonRef(args.book, args.passage, "en"));
  return `https://www.biblegateway.com/passage/?search=${q}&version=${encodeURIComponent(args.translation.bibleGateway)}`;
}

function blueLetter(args: BuildArgs): string {
  const { start } = verseBounds(args.passage);
  const verse = start ?? 1;
  return `https://www.blueletterbible.org/${args.translation.blb}/${args.book.blb}/${args.passage.chapter}/${verse}`;
}

function esvOrg(args: BuildArgs): string {
  const ref = colonRef(args.book, args.passage, "en").replaceAll(" ", "+");
  return `https://www.esv.org/${ref}/`;
}

function bibliaOnline(args: BuildArgs): string {
  const slug = args.translation.bibliaOnline ?? "nvi";
  const { start, end } = verseBounds(args.passage);
  let path = `https://www.bibliaonline.com.br/${slug}/${args.book.bibliaOnline}/${args.passage.chapter}`;
  if (start) {
    path += `/${start}`;
    if (end && end !== start) path += `-${end}`;
  }
  return path;
}

function bibleHub(args: BuildArgs): string {
  const { start } = verseBounds(args.passage);
  if (!start) return `https://biblehub.com/${args.book.bibleHub}/${args.passage.chapter}.htm`;
  return `https://biblehub.com/${args.book.bibleHub}/${args.passage.chapter}-${start}.htm`;
}

function accordance(args: BuildArgs): string {
  const ref = colonRef(args.book, args.passage, "en").replaceAll(" ", "_");
  return `accord://read/?${ref}`;
}

function eSword(args: BuildArgs): string {
  const { start } = verseBounds(args.passage);
  const name = englishName(args.book).toLowerCase().replaceAll(" ", "");
  return `e-sword://${name}.${args.passage.chapter}.${start ?? 1}`;
}

function mySword(args: BuildArgs): string {
  return `mysword://bible/${encodeURI(colonRef(args.book, args.passage, "en"))}`;
}

function jwLibrary(args: BuildArgs): string {
  const { start, end } = verseBounds(args.passage);
  const verse = start ?? 1;
  const code = (book: number, ch: number, v: number) => book * 1_000_000 + ch * 1000 + v;
  const a = code(args.book.num, args.passage.chapter, verse);
  if (end && end !== verse) {
    const b = code(args.book.num, args.passage.chapter, end);
    return `jwlibrary:///finder?bible=${a}-${b}`;
  }
  return `jwlibrary:///finder?bible=${a}`;
}

const builders: Record<BibleAppId, (args: BuildArgs) => string> = {
  youversion: youVersion,
  tecarta,
  logos,
  "olive-tree": oliveTree,
  "bible-gateway": bibleGateway,
  "blue-letter": blueLetter,
  esv: esvOrg,
  "biblia-online": bibliaOnline,
  "bible-hub": bibleHub,
  accordance,
  "e-sword": eSword,
  mysword: mySword,
  "jw-library": jwLibrary,
};

export function buildDeepLink(
  appId: string,
  passage: Passage,
  translation: Translation,
  preferNative: boolean,
): string | null {
  const book = bookById(passage.bookId);
  if (!book) return null;
  const app = appById(appId);
  const native = preferNative && app.hasNative ? true : !app.hasWeb;
  return builders[app.id]({ book, passage, translation, preferNative: native });
}
