import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { planById } from "@/lib/bible/reading-plans";
import { getSql } from "@/lib/db";

const MAX_PER_DAY = 2;

export async function progressFromMarks(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const rows = await sql<{ plan_id: string; day: number }>`
    select plan_id, day from plan_marks where user_id = ${userId}
  `;
  const progress: Record<string, number[]> = {};
  for (const row of rows) {
    const list = progress[row.plan_id] ?? [];
    list.push(Number(row.day));
    progress[row.plan_id] = list;
  }
  for (const id of Object.keys(progress)) {
    progress[id] = [...new Set(progress[id])].sort((a, b) => a - b);
  }
  return progress;
}

async function persistProgress(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const progress = JSON.stringify(await progressFromMarks(sql, userId));
  await sql`
    update user_prefs set plan_progress = ${progress}, updated_at = now() where user_id = ${userId}
  `;
}

export const markPlanDay = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { planId: string; day: number; on: boolean }) => data)
  .handler(async ({ context, data }) => {
    const plan = planById(data.planId);
    if (!plan || !Number.isInteger(data.day) || data.day < 1 || data.day > plan.days.length) {
      return { ok: false as const, error: "missing" as const };
    }
    const sql = await getSql();
    if (!data.on) {
      await sql`
        delete from plan_marks
        where user_id = ${context.userId} and plan_id = ${data.planId} and day = ${data.day}
      `;
      await persistProgress(sql, context.userId);
      return { ok: true as const, error: null };
    }
    const existing = await sql<{ day: number }>`
      select day from plan_marks
      where user_id = ${context.userId} and plan_id = ${data.planId} and day = ${data.day}
    `;
    if (existing[0]) return { ok: true as const, error: null };
    const today = await sql<{ n: number }>`
      select count(*)::int as n from plan_marks
      where user_id = ${context.userId} and marked_on = current_date
    `;
    if (Number(today[0]?.n ?? 0) >= MAX_PER_DAY) {
      return { ok: false as const, error: "pace" as const };
    }
    await sql`
      insert into plan_marks (user_id, plan_id, day, marked_on)
      values (${context.userId}, ${data.planId}, ${data.day}, current_date)
    `;
    await persistProgress(sql, context.userId);
    return { ok: true as const, error: null };
  });

export const resetPlanMarks = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { planId: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from plan_marks where user_id = ${context.userId} and plan_id = ${data.planId}`;
    await persistProgress(sql, context.userId);
    return { ok: true as const };
  });
