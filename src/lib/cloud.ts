import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { isAvatarId } from "@/lib/avatars";
import type { Locale } from "@/lib/bible/books";
import type { CopyFormat } from "@/lib/copy-rich";
import type { Theme } from "@/lib/theme";
import { getSql } from "@/lib/db";
import { pictureFromJwt } from "@/lib/oauth-photo";

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
  avatarId: string;
  avatarUrl: string;
  handle: string;
  firstName: string;
  lastName: string;
  profileEmail: string;
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
  avatar_id: string;
  avatar_url: string;
  handle: string;
  first_name: string;
  last_name: string;
  email: string;
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

function cleanHandle(value: string) {
  return value.trim().replace(/^@+/, "").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
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
    avatarId: isAvatarId(row.avatar_id) ? row.avatar_id : "book",
    avatarUrl: row.avatar_url ?? "",
    handle: row.handle ?? "",
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    profileEmail: row.email ?? "",
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
  const cloudHasProfile = Boolean(cloud.handle || cloud.firstName || cloud.profileEmail || cloud.avatarUrl);
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
    avatarId: cloudHasProfile ? cloud.avatarId : local.avatarId,
    avatarUrl: cloudHasProfile ? cloud.avatarUrl : local.avatarUrl,
    handle: cloudHasProfile ? cloud.handle : local.handle,
    firstName: cloudHasProfile ? cloud.firstName : local.firstName,
    lastName: cloudHasProfile ? cloud.lastName : local.lastName,
    profileEmail: cloudHasProfile ? cloud.profileEmail : local.profileEmail,
  };
}

export const getPrefs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<PrefsRow>`
      select locale, app_id, translation_id, prefer_native, copy_format, books_compact, theme,
             active_plans, plan_progress, avatar_id, avatar_url, handle, first_name, last_name, email
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
    const handle = cleanHandle(data.handle);
    if (handle) {
      const taken = await sql<{ user_id: string }>`
        select user_id from user_prefs where handle = ${handle} and user_id <> ${context.userId} limit 1
      `;
      if (taken[0]) return { ok: false as const, error: "handle" as const };
    }
    const active = JSON.stringify(data.activePlans);
    const progress = JSON.stringify(data.planProgress);
    const avatarId = isAvatarId(data.avatarId) ? data.avatarId : "book";
    await sql`
      insert into user_prefs (
        user_id, locale, app_id, translation_id, prefer_native, copy_format, books_compact, theme,
        active_plans, plan_progress, avatar_id, avatar_url, handle, first_name, last_name, email, updated_at
      ) values (
        ${context.userId}, ${data.locale}, ${data.appId}, ${data.translationId}, ${data.preferNative},
        ${data.copyFormat}, ${data.booksCompact}, ${data.theme}, ${active}, ${progress},
        ${avatarId}, ${data.avatarUrl.trim()}, ${handle}, ${data.firstName.trim()}, ${data.lastName.trim()}, ${data.profileEmail.trim()}, now()
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
        avatar_id = excluded.avatar_id,
        avatar_url = excluded.avatar_url,
        handle = excluded.handle,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        updated_at = now()
    `;
    return { ok: true as const };
  });

export const syncAccountPhoto = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const users = await sql<{ image: string | null }>`
      select image from "user" where id = ${context.userId}
    `;
    const existing = users[0]?.image?.trim();
    if (existing) return existing;
    const accounts = await sql<{ idToken: string | null }>`
      select "idToken" from account where "userId" = ${context.userId}
    `;
    for (const account of accounts) {
      const picture = pictureFromJwt(account.idToken);
      if (!picture) continue;
      await sql`update "user" set image = ${picture} where id = ${context.userId}`;
      return picture;
    }
    return null;
  });

