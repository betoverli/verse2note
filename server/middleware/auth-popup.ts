/**
 * Production /auth/popup — the Vite plugin only runs in `vite dev`.
 * Without this, a popup on verse2note.com paints the full SPA as a guest.
 */
import { handleAuthPopupRequest } from "../../src/lib/auth/popup.server";

export default async function authPopupMiddleware(
  event: { url: URL; req: { method: string; headers: Headers } },
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  if ((event.req.method ?? "GET").toUpperCase() !== "GET") return next();
  if (event.url.pathname !== "/auth/popup") return next();

  const proto = event.req.headers.get("x-forwarded-proto") ?? event.url.protocol.replace(":", "") ?? "https";
  const host =
    event.req.headers.get("x-forwarded-host") ?? event.req.headers.get("host") ?? event.url.host;
  const request = new Request(`${proto}://${host}${event.url.pathname}${event.url.search}`, {
    method: "GET",
    headers: event.req.headers,
  });
  return handleAuthPopupRequest(request);
}
