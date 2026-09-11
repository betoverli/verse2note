const KEY = "v2n-invite";

export function rememberInvite(id: string) {
  try {
    if (id) sessionStorage.setItem(KEY, id);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function takeInvite() {
  try {
    const id = sessionStorage.getItem(KEY);
    if (id) sessionStorage.removeItem(KEY);
    return id;
  } catch {
    return null;
  }
}

export function safeNext(path: unknown): string | undefined {
  if (typeof path !== "string") return undefined;
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return undefined;
  if (path.startsWith("/g/") || path.startsWith("/c/") || path.startsWith("/reading/")) return path;
  if (path === "/profile" || path === "/app" || path.startsWith("/collections")) return path;
  return undefined;
}
