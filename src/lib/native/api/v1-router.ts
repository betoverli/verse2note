/**
 * Pure path matching for `/api/native/v1/*` (unit-tested without a database).
 */

export type NativeV1Route =
  | { kind: "catalog" }
  | { kind: "session" }
  | { kind: "notes"; noteId?: string }
  | { kind: "speakers"; speakerId?: string }
  | { kind: "devices-apns" }
  | { kind: "not-found"; path: string };

/**
 * @param splat - path after `/api/native/v1/` (no leading slash), e.g. `notes/abc`
 */
export function matchNativeV1Route(splat: string): NativeV1Route {
  const raw = splat.replace(/^\/+|\/+$/g, "");
  if (!raw) return { kind: "catalog" };

  const parts = raw.split("/").filter(Boolean);
  const [a, b] = parts;

  if (a === "session" && parts.length === 1) return { kind: "session" };
  if (a === "notes" && parts.length === 1) return { kind: "notes" };
  if (a === "notes" && parts.length === 2 && b) return { kind: "notes", noteId: b };
  if (a === "speakers" && parts.length === 1) return { kind: "speakers" };
  if (a === "speakers" && parts.length === 2 && b) return { kind: "speakers", speakerId: b };
  if (a === "devices" && b === "apns" && parts.length === 2) return { kind: "devices-apns" };

  return { kind: "not-found", path: raw };
}

export function methodAllowed(route: NativeV1Route, method: string): boolean {
  const m = method.toUpperCase();
  if (m === "OPTIONS") return true;
  switch (route.kind) {
    case "catalog":
      return m === "GET";
    case "session":
      return m === "GET";
    case "notes":
      if (!route.noteId) return m === "GET" || m === "POST";
      return m === "GET" || m === "PATCH" || m === "PUT" || m === "DELETE";
    case "speakers":
      if (!route.speakerId) return m === "GET" || m === "POST";
      return m === "DELETE";
    case "devices-apns":
      return m === "POST" || m === "DELETE";
    case "not-found":
      return false;
  }
}
