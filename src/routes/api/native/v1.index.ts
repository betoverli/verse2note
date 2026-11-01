import { createFileRoute } from "@tanstack/react-router";
import { handleNativeV1Request } from "@/lib/native/api/v1-http";

/** `GET /api/native/v1` — catalog (no auth). */
export const Route = createFileRoute("/api/native/v1/")({
  server: {
    handlers: {
      GET: ({ request }) => handleNativeV1Request(request, ""),
      OPTIONS: ({ request }) => handleNativeV1Request(request, ""),
    },
  },
});
