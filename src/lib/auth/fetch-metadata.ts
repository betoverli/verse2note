/**
 * Fetch Metadata allow-list shared by the session guard and the native login
 * return. A top-level GET (the OAuth browser hopping back from Google) is
 * allowed. A scripted cross-site or sibling request is not.
 */
export function isScriptedCrossSite(
  method: string,
  headers: { get(name: string): string | null },
): boolean {
  const site = headers.get("sec-fetch-site");
  if (!site || site === "same-origin" || site === "none") return false;
  const dest = headers.get("sec-fetch-dest");
  const isTopLevelGet =
    headers.get("sec-fetch-mode") === "navigate" &&
    method === "GET" &&
    dest !== "object" &&
    dest !== "embed";
  return !isTopLevelGet;
}
