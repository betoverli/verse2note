import { createFileRoute } from "@tanstack/react-router";
import { configuredTeamId } from "@/lib/native/aasa.server";

export const Route = createFileRoute("/auth/native-config")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify({ universalLinks: configuredTeamId() !== null }), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
          },
        }),
    },
  },
});
