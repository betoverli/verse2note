import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { Locale } from "@/lib/bible/books";
import type { CopyFormat } from "@/lib/copy-rich";
import type { Theme } from "@/lib/theme";
import { getSql } from "@/lib/db";

export type CloudPrefs = {
  locale: Locale;
  appId: string;
  translationId: string;
  preferNative: boolean;
  copyFormat: CopyFormat;
  booksCompact: boolean;
  theme: Theme;
  activePlans: string[];
  planProgress: Record<string, number[]>;
};

type PrefsRow = {
  locale: string;
  app_id: string;
  translation_id: string;
  prefer_native: boolean;
  copy_format: string;
  books_compact: boolean;
  theme: string;
  active_plans: string;
  plan_progress: string;
};

function asLocale(value: string): Locale {
  return value === "en" || value === "es" || value === "pt" ? value : "pt";
}

function asFormat(value: string): CopyFormat {
  return value === "markdown" || value === "plain" || value === "rich" ? value : "rich";
}

function asTheme(value: string): Theme {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function fromRow(row: PrefsRow): CloudPrefs {
  return {
    locale: asLocale(row.locale),
    appId: row.app_id,
    translationId: row.translation_id,
    preferNative: Boolean(row.prefer_native),
    copyFormat: asFormat(row.copy_format),
    booksCompact: Boolean(row.books_compact),
    theme: asTheme(row.theme),
    activePlans: parseJson<string[]>(row.active_plans, []),
    planProgress: parseJson<Record<string, number[]>>(row.plan_progress, {}),
  };
}

export function mergePrefs(local: CloudPrefs, cloud: CloudPrefs | null): CloudPrefs {
  if (!cloud) return local;
  const ids = [...new Set([...cloud.activePlans, ...local.activePlans])];
  const planProgress: Record<string, number[]> = {};
  for (const id of ids) {
    planProgress[id] = [
      ...new Set([...(cloud.planProgress[id] ?? []), ...(local.planProgress[id] ?? [])]),
    ].sort((a, b) => a - b);
  }
  return {
    locale: cloud.locale,
    appId: cloud.appId,
    translationId: cloud.translationId,
    preferNative: cloud.preferNative,
    copyFormat: cloud.copyFormat,
    booksCompact: cloud.booksCompact,
    theme: cloud.theme,
    activePlans: ids,
    planProgress,
  };
}

export const getPrefs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<PrefsRow>`
      select locale, app_id, translation_id, prefer_native, copy_format, books_compact, theme, active_plans, plan_progress
      from user_prefs
      where user_id = ${context.userId}
    `;
    return rows[0] ? fromRow(rows[0]) : null;
  });

export const savePrefs = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: CloudPrefs) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const active = JSON.stringify(data.activePlans);
    const progress = JSON.stringify(data.planProgress);
    await sql`
      insert into user_prefs (
        user_id, locale, app_id, translation_id, prefer_native, copy_format, books_compact, theme, active_plans, plan_progress, updated_at
      ) values (
        ${context.userId}, ${data.locale}, ${data.appId}, ${data.translationId}, ${data.preferNative},
        ${data.copyFormat}, ${data.booksCompact}, ${data.theme}, ${active}, ${progress}, now()
      )
      on conflict (user_id) do update set
        locale = excluded.locale,
        app_id = excluded.app_id,
        translation_id = excluded.translation_id,
        prefer_native = excluded.prefer_native,
        copy_format = excluded.copy_format,
        books_compact = excluded.books_compact,
        theme = excluded.theme,
        active_plans = excluded.active_plans,
        plan_progress = excluded.plan_progress,
        updated_at = now()
    `;
    return { ok: true as const };
  });
