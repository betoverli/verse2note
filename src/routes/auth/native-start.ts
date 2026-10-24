import { createFileRoute } from "@tanstack/react-router";
import { configuredTeamId } from "@/lib/native/aasa.server";
import { pkceCookieHeader } from "@/lib/native/pkce-cookie";
import { isPkceMaterial } from "@/lib/native/pkce";
import { canonicalNativeStart, nativeReturnTo, parseReturnMode } from "@/lib/native/return-to";
import { GOOGLE_PROVIDER_ID, googleOAuthFromEnv } from "@/lib/auth/google";
import { beginOAuthSignIn } from "@/lib/auth/oauth-start.server";
import { GROK_PROVIDERS } from "@/lib/auth/providers";

function fail(mode: "https" | "scheme") {
  return new Response(null, {
    status: 302,
    headers: {
      location: nativeReturnTo(mode, { error: true }),
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
    },
  });
}

export const Route = createFileRoute("/auth/native-start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const canonical = canonicalNativeStart(request.url);
        if (canonical) {
          return new Response(null, {
            status: 302,
            headers: {
              location: canonical,
              "cache-control": "no-store",
              "referrer-policy": "no-referrer",
            },
          });
        }
        const url = new URL(request.url);
        const providerId = url.searchParams.get("providerId")?.trim() ?? "";
        const challenge = url.searchParams.get("code_challenge")?.trim() ?? "";
        const mode = parseReturnMode(url.searchParams.get("return"));
        const googleOk =
          providerId === GOOGLE_PROVIDER_ID && googleOAuthFromEnv(process.env).configured;
        const brokerOk = GROK_PROVIDERS.some((provider) => provider.providerId === providerId);
        if (!googleOk && !brokerOk) return fail(mode);
        if (!isPkceMaterial(challenge)) return fail(mode);
        if (mode === "https" && !configuredTeamId()) return fail("https");
        const done = `${url.origin}/auth/native-done`;
        try {
          const apiRes = await beginOAuthSignIn(request, {
            providerId,
            callbackURL: done,
            errorCallbackURL: `${done}?error=1`,
          });
          if (!apiRes.ok) return fail(mode);
          const body = (await apiRes.json().catch(() => null)) as { url?: string } | null;
          if (!body?.url) return fail(mode);
          const headers = new Headers({
            location: body.url,
            "cache-control": "no-store",
            "referrer-policy": "no-referrer",
          });
          for (const cookie of apiRes.headers.getSetCookie()) headers.append("set-cookie", cookie);
          headers.append("set-cookie", pkceCookieHeader(challenge, mode));
          return new Response(null, { status: 302, headers });
        } catch {
          return fail(mode);
        }
      },
    },
  },
});
