import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { planById } from "@/lib/bible/reading-plans";
import { getSql } from "@/lib/db";

export type GroupMember = {
  userId: string;
  handle: string;
  firstName: string;
  avatarId: string;
  avatarUrl: string;
  days: number[];
  me: boolean;
};

export type PlanGroup = {
  id: string;
  planId: string;
  hostId: string;
  members: GroupMember[];
};

function newId() {
  return crypto.randomUUID().replaceAll("-", "");
}

async function loadGroup(sql: Awaited<ReturnType<typeof getSql>>, groupId: string, me: string): Promise<PlanGroup | null> {
  const groups = await sql<{ id: string; plan_id: string; host_id: string }>`
    select id, plan_id, host_id from plan_groups where id = ${groupId}
  `;
  const group = groups[0];
  if (!group) return null;
  const memberRows = await sql<{ user_id: string }>`
    select user_id from plan_group_members where group_id = ${groupId} order by joined_at
  `;
  const members: GroupMember[] = [];
  for (const row of memberRows) {
    const prefs = await sql<{
      handle: string;
      first_name: string;
      avatar_id: string;
      avatar_url: string;
    }>`
      select handle, first_name, avatar_id, avatar_url from user_prefs where user_id = ${row.user_id}
    `;
    const pref = prefs[0];
    const marks = await sql<{ day: number }>`
      select day from plan_marks where user_id = ${row.user_id} and plan_id = ${group.plan_id}
    `;
    members.push({
      userId: row.user_id,
      handle: pref?.handle ?? "",
      firstName: pref?.first_name ?? "",
      avatarId: pref?.avatar_id || "book",
      avatarUrl: pref?.avatar_url ?? "",
      days: marks.map((item) => Number(item.day)).filter((n) => Number.isInteger(n) && n > 0),
      me: row.user_id === me,
    });
  }
  return { id: group.id, planId: group.plan_id, hostId: group.host_id, members };
}

export const createPlanInvite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { planId: string }) => data)
  .handler(async ({ context, data }) => {
    if (!planById(data.planId)) return { ok: false as const, error: "missing" as const };
    const sql = await getSql();
    const existing = await sql<{ id: string }>`
      select id from plan_groups where host_id = ${context.userId} and plan_id = ${data.planId} limit 1
    `;
    if (existing[0]) {
      await sql`
        insert into plan_group_members (group_id, user_id)
        values (${existing[0].id}, ${context.userId})
        on conflict do nothing
      `;
      return { ok: true as const, id: existing[0].id };
    }
    const id = newId();
    await sql`
      insert into plan_groups (id, plan_id, host_id) values (${id}, ${data.planId}, ${context.userId})
    `;
    await sql`
      insert into plan_group_members (group_id, user_id) values (${id}, ${context.userId})
    `;
    return { ok: true as const, id };
  });

export const joinPlanGroup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const groups = await sql<{ id: string; plan_id: string }>`
      select id, plan_id from plan_groups where id = ${data.id}
    `;
    const group = groups[0];
    if (!group) return { ok: false as const, error: "missing" as const, planId: "" };
    await sql`
      insert into plan_group_members (group_id, user_id)
      values (${group.id}, ${context.userId})
      on conflict do nothing
    `;
    void import("@/lib/notify.server")
      .then((mod) => mod.notifyPlanJoined(context.userId, group.id, group.plan_id))
      .catch(() => undefined);
    return { ok: true as const, planId: group.plan_id, error: null };
  });

export const getPlanGroup = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const group = await loadGroup(sql, data.id, context.userId);
    if (!group) return null;
    if (!group.members.some((item) => item.me)) return null;
    return group;
  });

export const getPlanGroupPreview = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const groups = await sql<{ id: string; plan_id: string; host_id: string }>`
      select id, plan_id, host_id from plan_groups where id = ${data.id}
    `;
    const group = groups[0];
    if (!group || !planById(group.plan_id)) return null;
    const host = await sql<{ handle: string; first_name: string }>`
      select handle, first_name from user_prefs where user_id = ${group.host_id}
    `;
    const count = await sql<{ n: number }>`
      select count(*)::int as n from plan_group_members where group_id = ${group.id}
    `;
    return {
      id: group.id,
      planId: group.plan_id,
      host: host[0]?.handle || host[0]?.first_name || "",
      members: Number(count[0]?.n ?? 0),
    };
  });

export const listPlanGroups = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { planId: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ group_id: string }>`
      select m.group_id
      from plan_group_members m
      join plan_groups g on g.id = m.group_id
      where m.user_id = ${context.userId} and g.plan_id = ${data.planId}
    `;
    const out: PlanGroup[] = [];
    for (const row of rows) {
      const group = await loadGroup(sql, row.group_id, context.userId);
      if (group) out.push(group);
    }
    return out;
  });
