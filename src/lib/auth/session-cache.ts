import type { AppUser } from "./use-current-user";

const KEY = "verse2note-user";

export function readSessionUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppUser>;
    if (!parsed || typeof parsed.id !== "string" || !parsed.id) return null;
    if (parsed.isDevFallback) return null;
    return {
      id: parsed.id,
      displayName: parsed.displayName ?? null,
      primaryEmail: parsed.primaryEmail ?? null,
      profileImageUrl: parsed.profileImageUrl ?? null,
      isDevFallback: false,
    };
  } catch {
    return null;
  }
}

export function writeSessionUser(user: AppUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (!user || user.isDevFallback) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function clearSessionUser() {
  writeSessionUser(null);
}
