import { createFileRoute } from "@tanstack/react-router";
import { appleAppSiteAssociation, configuredTeamId } from "@/lib/native/aasa.server";

export const Route = createFileRoute("/.well-known/apple-app-site-association")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(appleAppSiteAssociation(configuredTeamId())), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
