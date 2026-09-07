function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export function extractImage(value: unknown): string | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  const keys = [
    "picture",
    "image",
    "avatar",
    "avatar_url",
    "avatarUrl",
    "profile_image_url",
    "profile_image_url_https",
    "profileImageUrl",
    "photo",
    "photoURL",
  ];
  for (const key of keys) {
    const item = record[key];
    if (typeof item === "string" && /^https?:\/\//.test(item)) return item;
    if (item && typeof item === "object" && "url" in item && typeof (item as { url: unknown }).url === "string") {
      const url = (item as { url: string }).url;
      if (/^https?:\/\//.test(url)) return url;
    }
  }
  for (const nested of [record.user, record.profile, record.data, record.attributes]) {
    const found = extractImage(nested);
    if (found) return found;
  }
  return undefined;
}

export function pictureFromJwt(token: string | null | undefined): string | undefined {
  if (!token) return undefined;
  const payload = token.split(".")[1];
  if (!payload) return undefined;
  try {
    const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    return extractImage(JSON.parse(json));
  } catch {
    return undefined;
  }
}

export function decodeJwtPayload(token: string | null | undefined): Record<string, unknown> | null {
  if (!token) return null;
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    return asRecord(JSON.parse(json));
  } catch {
    return null;
  }
}
