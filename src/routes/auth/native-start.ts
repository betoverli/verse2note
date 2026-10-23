import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS } from "@/lib/auth/providers";
import { auth } from "@/lib/auth/server";

function backToApp() {
  return new Response(null, {
    status: 302,
    headers: { location: "verse2note://auth?error=1", "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/auth/native-start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const providerId = url.searchParams.get("providerId")?.trim() ?? "";
        if (!GROK_PROVIDERS.some((provider) => provider.providerId === providerId)) {
          return backToApp();
        }
        const done = `${url.origin}/auth/native-done`;
        try {
          const apiRes = await auth.api.signInWithOAuth2({
            body: {
              providerId,
              callbackURL: done,
              errorCallbackURL: `${done}?error=1`,
            },
            headers: request.headers,
            asResponse: true,
          });
          if (!apiRes.ok) return backToApp();
          const body = (await apiRes.json().catch(() => null)) as { url?: string } | null;
          if (!body?.url) return backToApp();
          const headers = new Headers({ location: body.url, "cache-control": "no-store" });
          for (const cookie of apiRes.headers.getSetCookie()) {
            headers.append("set-cookie", cookie);
          }
          return new Response(null, { status: 302, headers });
        } catch {
          return backToApp();
        }
      },
    },
  },
});
