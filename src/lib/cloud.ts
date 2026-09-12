import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { isAvatarId } from "@/lib/avatars";
import { appById } from "@/lib/bible/apps";
import type { Locale } from "@/lib/bible/books";
import { planById } from "@/lib/bible/reading-plans";
import type { CopyFormat } from "@/lib/copy-rich";
import type { Theme } from "@/lib/theme";
import { getSql } from "@/lib/db";
import { progressFromMarks } from "@/lib/plan-marks";
import { pictureFromJwt } from "@/lib/oauth-photo";
import { cleanEmail, cleanHandle, cleanName } from "@/lib/profile";

export type CloudPrefs = {
  locale: Locale;
  copyLocale: Locale;
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
  copy_locale: string;
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

function fromRow(row: PrefsRow): CloudPrefs {
  return {
    locale: asLocale(row.locale),
    copyLocale: asLocale(row.copy_locale || row.locale),
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
  if (!cloud) {
    return local;
  }
  const ids = [...new Set([...cloud.activePlans, ...local.activePlans])].filter((id) => planById(id));
  const cloudHasProfile = Boolean(cloud.handle || cloud.firstName || cloud.profileEmail || cloud.avatarUrl);
  const localHasProfile = Boolean(local.handle || local.firstName || local.profileEmail || local.avatarUrl);
  const progress: Record<string, number[]> = { ...cloud.planProgress };
  for (const [planId, days] of Object.entries(local.planProgress)) {
    progress[planId] = [...new Set([...(progress[planId] ?? []), ...days])].sort((a, b) => a - b);
  }
  const useLocalProfile = localHasProfile && !cloudHasProfile;
  return {
    locale: cloud.locale,
    copyLocale: cloud.copyLocale || local.copyLocale || cloud.locale,
    appId: cloud.appId,
    translationId: cloud.translationId,
    preferNative: cloud.preferNative,
    copyFormat: cloud.copyFormat,
    booksCompact: cloud.booksCompact,
    theme: cloud.theme,
    activePlans: ids,
    planProgress: progress,
    avatarId: useLocalProfile ? local.avatarId : cloudHasProfile ? cloud.avatarId : local.avatarId,
    avatarUrl: useLocalProfile ? local.avatarUrl : cloudHasProfile ? cloud.avatarUrl : local.avatarUrl,
    handle: useLocalProfile ? local.handle : cloudHasProfile ? cloud.handle : local.handle,
    firstName: useLocalProfile ? local.firstName : cloudHasProfile ? cloud.firstName : local.firstName,
    lastName: useLocalProfile ? local.lastName : cloudHasProfile ? cloud.lastName : local.lastName,
    profileEmail: useLocalProfile ? local.profileEmail : cloudHasProfile ? cloud.profileEmail : local.profileEmail,
  };
}

export const getPrefs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<PrefsRow>`
      select locale, copy_locale, app_id, translation_id, prefer_native, copy_format, books_compact, theme,
             active_plans, plan_progress, avatar_id, avatar_url, handle, first_name, last_name, email
      from user_prefs
      where user_id = ${context.userId}
    `;
    return rows[0] ? { ...fromRow(rows[0]), planProgress: await progressFromMarks(sql, context.userId) } : null;
  });

function cleanAvatarUrl(value: string) {
  const raw = value.trim().slice(0, 500);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol === "https:") return url.href;
  } catch {
    /* ignore */
  }
  return "";
}

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
    const existing = await sql<{ plan_progress: string }>`
      select plan_progress from user_prefs where user_id = ${context.userId}
    `;
    const progress = existing[0]?.plan_progress ?? "{}";
    const active = JSON.stringify(
      [...new Set(data.activePlans)].filter((id) => planById(id)).slice(0, 20),
    );
    const avatarId = isAvatarId(data.avatarId) ? data.avatarId : "book";
    const locale = asLocale(data.locale);
    const copyLocale = asLocale(data.copyLocale || data.locale);
    const appId = appById(data.appId) ? data.appId : "youversion";
    const copyFormat = asFormat(data.copyFormat);
    const theme = asTheme(data.theme);
    try {
      await sql`
      insert into user_prefs (
        user_id, locale, copy_locale, app_id, translation_id, prefer_native, copy_format, books_compact, theme,
        active_plans, plan_progress, avatar_id, avatar_url, handle, first_name, last_name, email, updated_at
      ) values (
        ${context.userId}, ${locale}, ${copyLocale}, ${appId}, ${data.translationId.slice(0, 40)}, ${Boolean(data.preferNative)},
        ${copyFormat}, ${Boolean(data.booksCompact)}, ${theme}, ${active}, ${progress},
        ${avatarId}, ${cleanAvatarUrl(data.avatarUrl)}, ${handle}, ${cleanName(data.firstName)}, ${cleanName(data.lastName)}, ${cleanEmail(data.profileEmail) || data.profileEmail.trim().slice(0, 120)}, now()
      )
      on conflict (user_id) do update set
        locale = excluded.locale,
        copy_locale = excluded.copy_locale,
        app_id = excluded.app_id,
        translation_id = excluded.translation_id,
        prefer_native = excluded.prefer_native,
        copy_format = excluded.copy_format,
        books_compact = excluded.books_compact,
        theme = excluded.theme,
        active_plans = excluded.active_plans,
        avatar_id = excluded.avatar_id,
        avatar_url = excluded.avatar_url,
        handle = excluded.handle,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        updated_at = now()
    `;
    } catch {
      return { ok: false as const, error: "handle" as const };
    }
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

