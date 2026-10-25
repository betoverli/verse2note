import type { I18nKey } from "@/lib/i18n";

export type AppTabId = "verses" | "groups" | "notebook" | "reading" | "profile";

export type AppTabTarget = "/app" | "/groups" | "/notebook" | "/reading" | "/profile";

export type AppTab = {
  id: AppTabId;
  to: AppTabTarget;
  key: I18nKey;
  symbol: string;
  tour?: string;
  match: (path: string) => boolean;
};

export const APP_TABS: AppTab[] = [
  {
    id: "verses",
    to: "/app",
    key: "navBooks",
    symbol: "book",
    match: (path) => path === "/app" || path.startsWith("/collections") || path.startsWith("/c/"),
  },
  {
    id: "groups",
    to: "/groups",
    key: "notebookGroups",
    symbol: "person.2",
    tour: "groups",
    match: (path) => path === "/groups" || path.startsWith("/groups/") || path.startsWith("/notebook/g"),
  },
  {
    id: "notebook",
    to: "/notebook",
    key: "notebook",
    symbol: "note.text",
    match: (path) =>
      path === "/notebook" ||
      (path.startsWith("/notebook/") && !path.startsWith("/notebook/g")) ||
      path.startsWith("/n/"),
  },
  {
    id: "reading",
    to: "/reading",
    key: "reading",
    symbol: "calendar",
    tour: "reading",
    match: (path) => path === "/reading" || path.startsWith("/reading/") || path.startsWith("/g/"),
  },
  {
    id: "profile",
    to: "/profile",
    key: "profile",
    symbol: "person",
    tour: "settings",
    match: (path) => path === "/profile" || path.startsWith("/profile/"),
  },
];

export function showTabBar(pathname: string) {
  if (pathname.startsWith("/n/")) return false;
  if (pathname.startsWith("/notebook/") && !pathname.startsWith("/notebook/g")) return false;
  return (
    pathname === "/app" ||
    pathname === "/inbox" ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname.startsWith("/collections") ||
    pathname.startsWith("/c/") ||
    pathname.startsWith("/g/") ||
    pathname.startsWith("/reading") ||
    pathname === "/notebook" ||
    pathname === "/groups" ||
    pathname.startsWith("/groups/") ||
    pathname.startsWith("/notebook/g")
  );
}

/** Tab to highlight when the bar is on screen. Null when the bar is hidden. */
export function selectedTabId(pathname: string): AppTabId | null {
  if (!showTabBar(pathname)) return null;
  return APP_TABS.find((tab) => tab.match(pathname))?.id ?? null;
}
