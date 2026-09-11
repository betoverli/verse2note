import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { planById } from "@/lib/bible/reading-plans";
import { BADGE_IDS, type BadgeId } from "@/lib/badges";
import { getSql } from "@/lib/db";

export type PublicProfile = {
  handle: string;
  firstName: string;
  lastName: string;
  avatarId: string;
  avatarUrl: string;
  badges: BadgeId[];
};

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function completedPlans(progress: Record<string, number[]>): number {
  let count = 0;
  for (const [id, days] of Object.entries(progress)) {
    const plan = planById(id);
    if (!plan) continue;
    const set = new Set(days);
    if (plan.days.length > 0 && plan.days.every((day) => set.has(day.day))) count += 1;
  }
  return count;
}

function daysRead(progress: Record<string, number[]>): number {
  let count = 0;
  for (const days of Object.values(progress)) count += days.length;
  return count;
}

function earnedFrom(stats: { plans: number; days: number; invites: number; lists: number; shared: number }): BadgeId[] {
  const out: BadgeId[] = [];
  const add = (id: BadgeId, ok: boolean) => {
    if (ok) out.push(id);
  };
  add("plan_1", stats.plans >= 1);
  add("plan_3", stats.plans >= 3);
  add("plan_5", stats.plans >= 5);
  add("plan_10", stats.plans >= 10);
  add("days_7", stats.days >= 7);
  add("days_30", stats.days >= 30);
  add("days_100", stats.days >= 100);
  add("invite_1", stats.invites >= 1);
  add("invite_3", stats.invites >= 3);
  add("invite_5", stats.invites >= 5);
  add("invite_10", stats.invites >= 10);
  add("list_1", stats.lists >= 1);
  add("list_5", stats.lists >= 5);
  add("share_1", stats.shared >= 1);
  return out;
}

async function statsFor(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const prefs = await sql<{ plan_progress: string }>`
    select plan_progress from user_prefs where user_id = ${userId}
  `;
  const progress = parseJson<Record<string, number[]>>(prefs[0]?.plan_progress ?? "{}", {});
  const invites = await sql<{ n: number }>`
    select count(*)::int as n
    from plan_group_members m
    join plan_groups g on g.id = m.group_id
    where g.host_id = ${userId} and m.user_id <> ${userId}
  `;
  const lists = await sql<{ n: number }>`
    select count(*)::int as n from user_collections where user_id = ${userId}
  `;
  const shared = await sql<{ n: number }>`
    select count(*)::int as n from user_collections
    where user_id = ${userId} and visibility <> ${"private"}
  `;
  return {
    plans: completedPlans(progress),
    days: daysRead(progress),
    invites: Number(invites[0]?.n ?? 0),
    lists: Number(lists[0]?.n ?? 0),
    shared: Number(shared[0]?.n ?? 0),
  };
}

function cleanHandle(value: string) {
  return value.trim().replace(/^@+/, "").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
}

export const getMyBadges = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return earnedFrom(await statsFor(sql, context.userId));
  });

export const getPublicProfile = createServerFn({ method: "GET" })
  .validator((data: { handle: string }) => data)
  .handler(async ({ data }): Promise<PublicProfile | null> => {
    const handle = cleanHandle(data.handle);
    if (!handle) return null;
    const sql = await getSql();
    const rows = await sql<{
      user_id: string;
      handle: string;
      first_name: string;
      last_name: string;
      avatar_id: string;
      avatar_url: string;
    }>`
      select user_id, handle, first_name, last_name, avatar_id, avatar_url
      from user_prefs
      where handle = ${handle}
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      handle: row.handle,
      firstName: row.first_name ?? "",
      lastName: row.last_name ?? "",
      avatarId: row.avatar_id ?? "book",
      avatarUrl: row.avatar_url ?? "",
      badges: earnedFrom(await statsFor(sql, row.user_id)),
    };
  });

export { BADGE_IDS };
