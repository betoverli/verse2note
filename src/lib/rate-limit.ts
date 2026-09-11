const hits = new Map<string, number[]>();

export function allowRequest(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  return true;
}

export function clientKey(request: Request) {
  const forwarded = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0] ?? "").trim() || request.headers.get("x-real-ip") || "local";
}
