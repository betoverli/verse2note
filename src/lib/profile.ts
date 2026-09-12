export function cleanHandle(value: string) {
  return value.trim().replace(/^@+/, "").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
}

export function cleanName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 40);
}

export function cleanEmail(value: string) {
  const email = value.trim().slice(0, 120);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function profileIsComplete(data: { handle: string; firstName: string; profileEmail: string }) {
  return cleanHandle(data.handle).length >= 3 && Boolean(cleanName(data.firstName) && cleanEmail(data.profileEmail));
}
