import { getSql } from "@/lib/db";

function cleanToken(token: string): string | null {
  const value = token.trim();
  if (!/^[0-9a-fA-F]{64,200}$/.test(value)) return null;
  return value.toLowerCase();
}

export async function saveApnsDevice(userId: string, token: string, sandbox: boolean) {
  const clean = cleanToken(token);
  if (!clean) return { ok: false as const };
  const sql = await getSql();
  await sql`
    insert into apns_devices (token, user_id, sandbox)
    values (${clean}, ${userId}, ${sandbox})
    on conflict (token) do update
      set user_id = excluded.user_id, sandbox = excluded.sandbox, updated_at = now()
  `;
  return { ok: true as const };
}

export async function dropApnsDevice(userId: string, token: string) {
  const sql = await getSql();
  const clean = cleanToken(token);
  if (!clean) {
    await sql`delete from apns_devices where user_id = ${userId}`;
    return { ok: true as const };
  }
  await sql`delete from apns_devices where user_id = ${userId} and token = ${clean}`;
  return { ok: true as const };
}

export async function countApnsDevices(userId: string): Promise<number> {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`
    select count(*)::int as n from apns_devices where user_id = ${userId}
  `;
  return Number(rows[0]?.n ?? 0);
}
