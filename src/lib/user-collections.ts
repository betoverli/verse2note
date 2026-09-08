import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { bookById } from "@/lib/bible/books";
import { samePassage, type Passage } from "@/lib/bible/passage";
import { getSql } from "@/lib/db";
import type { CollectionVisibility, UserCollection } from "@/lib/user-collection";

export type { CollectionVisibility, UserCollection };

const MAX_COLLECTIONS = 40;
const MAX_PASSAGES = 80;
const MAX_TITLE = 60;

type Row = {
  id: string;
  title: string;
  slug: string;
  visibility: string;
  passages: string;
  updated_at: string;
};

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function asVisibility(value: string): CollectionVisibility {
  return value === "unlisted" || value === "public" ? value : "private";
}

function cleanTitle(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, MAX_TITLE);
}

function cleanPassages(input: unknown): Passage[] {
  if (!Array.isArray(input)) return [];
  const out: Passage[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const bookId = typeof row.bookId === "string" ? row.bookId : "";
    const book = bookById(bookId);
    const chapter = Number(row.chapter);
    if (!book || !Number.isInteger(chapter) || chapter < 1 || chapter > book.verses.length) continue;
    const verseStart =
      row.verseStart == null || row.verseStart === "" ? null : Number(row.verseStart);
    const verseEnd = row.verseEnd == null || row.verseEnd === "" ? null : Number(row.verseEnd);
    const start = verseStart && Number.isInteger(verseStart) && verseStart > 0 ? verseStart : null;
    const end = verseEnd && Number.isInteger(verseEnd) && verseEnd > 0 ? verseEnd : null;
    const passage: Passage = { bookId, chapter, verseStart: start, verseEnd: end };
    if (out.some((existing) => samePassage(existing, passage))) continue;
    out.push(passage);
    if (out.length >= MAX_PASSAGES) break;
  }
  return out;
}

function fromRow(row: Row): UserCollection {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug ?? "",
    visibility: asVisibility(row.visibility),
    passages: cleanPassages(parseJson(typeof row.passages === "string" ? row.passages : JSON.stringify(row.passages ?? []), [])),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function newId() {
  return crypto.randomUUID().replaceAll("-", "");
}

export const listMyCollections = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<Row>`
      select id, title, slug, visibility, passages, updated_at
      from user_collections
      where user_id = ${context.userId}
      order by updated_at desc
    `;
    return rows.map(fromRow);
  });

export const getMyCollection = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<Row>`
      select id, title, slug, visibility, passages, updated_at
      from user_collections
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return rows[0] ? fromRow(rows[0]) : null;
  });

export const createMyCollection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { title: string; passages?: Passage[] }) => data)
  .handler(async ({ context, data }) => {
    const title = cleanTitle(data.title) || "Coleção";
    const passages = cleanPassages(data.passages ?? []);
    const sql = await getSql();
    const count = await sql<{ n: number }>`
      select count(*)::int as n from user_collections where user_id = ${context.userId}
    `;
    if (Number(count[0]?.n ?? 0) >= MAX_COLLECTIONS) {
      return { ok: false as const, error: "limit" as const };
    }
    const id = newId();
    await sql`
      insert into user_collections (id, user_id, title, visibility, passages, updated_at)
      values (${id}, ${context.userId}, ${title}, ${"private"}, ${JSON.stringify(passages)}, now())
    `;
    return { ok: true as const, id };
  });

export const updateMyCollection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string; title?: string; passages?: Passage[] }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<Row>`
      select id, title, slug, visibility, passages, updated_at
      from user_collections
      where id = ${data.id} and user_id = ${context.userId}
    `;
    const current = rows[0] ? fromRow(rows[0]) : null;
    if (!current) return { ok: false as const, error: "missing" as const };
    const title = data.title != null ? cleanTitle(data.title) || current.title : current.title;
    const passages = data.passages ? cleanPassages(data.passages) : current.passages;
    await sql`
      update user_collections
      set title = ${title}, passages = ${JSON.stringify(passages)}, updated_at = now()
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const deleteMyCollection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from user_collections where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });
