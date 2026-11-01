import { createFileRoute } from "@tanstack/react-router";
import { handleNativeV1Request } from "@/lib/native/api/v1-http";

/**
 * Catch-all for `/api/native/v1/*` — Phase 0 native JSON API.
 * Auth: Bearer session token or Better Auth cookie.
 */
export const Route = createFileRoute("/api/native/v1/$")({
  server: {
    handlers: {
      GET: ({ request, params }) => handleNativeV1Request(request, params._splat ?? ""),
      POST: ({ request, params }) => handleNativeV1Request(request, params._splat ?? ""),
      PATCH: ({ request, params }) => handleNativeV1Request(request, params._splat ?? ""),
      PUT: ({ request, params }) => handleNativeV1Request(request, params._splat ?? ""),
      DELETE: ({ request, params }) => handleNativeV1Request(request, params._splat ?? ""),
      OPTIONS: ({ request, params }) => handleNativeV1Request(request, params._splat ?? ""),
    },
  },
});
