import { getRequest } from "@tanstack/react-start/server";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { readSessionToken } from "@/lib/auth/server";
import { getSql } from "@/lib/db";
import { allowRequest, clientKey } from "@/lib/rate-limit";
import { hashHandoffCode, isHandoffCode, newHandoffCode } from "@/lib/native/handoff-code";

const TTL_MS = 90_000;

/** Called from the system login browser, which holds the session cookie. */
export async function mintHandoff(userId: string) {
  assertSameSiteRequest();
  const token = readSessionToken();
  if (!token || token.length > 4000) return { ok: false as const };
  if (!allowRequest(`native-mint:${userId}`, 12, 60 * 60_000)) return { ok: false as const };
  const code = newHandoffCode();
  const sql = await getSql();
  const expires = new Date(Date.now() + TTL_MS).toISOString();
  await sql`delete from native_auth_handoff where expires_at < now()`;
  await sql`
    insert into native_auth_handoff (code_hash, user_id, session_token, expires_at)
    values (${hashHandoffCode(code)}, ${userId}, ${token}, ${expires})
  `;
  return { ok: true as const, code };
}

/** Called from the WebView. The code is single-use and expires in 90 seconds. */
export async function claimHandoff(code: string) {
  assertSameSiteRequest();
  const request = getRequest();
  const ip = request ? clientKey(request) : "local";
  if (!allowRequest(`native-claim:${ip}`, 20, 60_000)) return { ok: false as const };
  if (!isHandoffCode(code)) return { ok: false as const };
  const sql = await getSql();
  const rows = await sql<{ session_token: string }>`
    delete from native_auth_handoff
    where code_hash = ${hashHandoffCode(code)} and expires_at > now()
    returning session_token
  `;
  const token = rows[0]?.session_token;
  if (!token) return { ok: false as const };
  return { ok: true as const, token };
}
