import { createFileRoute } from "@tanstack/react-router";
import { isScriptedCrossSite } from "@/lib/auth/fetch-metadata";
import { auth } from "@/lib/auth/server";
import { CrossSiteRequestError } from "@/lib/auth/isolation.server";
import { nativeDoneLocation } from "@/lib/native/done-redirect";
import { mintHandoff } from "@/lib/native/handoff.server";
import { clearPkceCookieHeader } from "@/lib/native/pkce-cookie";
import { sessionTokenFromCookie } from "@/lib/native/session-cookie";

function bounce(location: string) {
  const headers = new Headers({
    location,
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
  });
  headers.append("set-cookie", clearPkceCookieHeader());
  return new Response(null, { status: 302, headers });
}

export const Route = createFileRoute("/auth/native-done")({
  server: {
    handlers: {
      // Google lands here inside ASWebAuthenticationSession. A document
      // redirect is what that session captures. A client page never runs
      // there reliably, and the Fetch redirect helper throws on a custom scheme.
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const cookie = request.headers.get("cookie");
        const fail = () => bounce(nativeDoneLocation(cookie, { error: true }));
        if (isScriptedCrossSite(request.method, request.headers)) {
          return new Response("Forbidden", {
            status: 403,
            headers: { "cache-control": "no-store" },
          });
        }
        if (url.searchParams.has("error")) return fail();
        try {
          const session = await auth.api.getSession({ headers: request.headers });
          const userId = session?.user?.id;
          const token = sessionTokenFromCookie(cookie);
          if (!userId || !token) return fail();
          const minted = await mintHandoff(userId, {
            cookieHeader: cookie,
            token,
            method: request.method,
            headers: request.headers,
          });
          return bounce(minted.redirect);
        } catch (error) {
          if (error instanceof CrossSiteRequestError) {
            return new Response("Forbidden", {
              status: 403,
              headers: { "cache-control": "no-store" },
            });
          }
          return fail();
        }
      },
    },
  },
});
