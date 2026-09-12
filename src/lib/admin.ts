const OWNER_HANDLES = ["betoverli"];

function splitEnv(name: string) {
  const raw = typeof process !== "undefined" ? process.env[name] : undefined;
  return (raw ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function adminEmails() {
  return splitEnv("ADMIN_EMAILS");
}

export function adminHandles() {
  return [...new Set([...splitEnv("ADMIN_HANDLES"), ...OWNER_HANDLES])];
}

export function isOwnerHandle(handle: string | null | undefined) {
  if (!handle) return false;
  return adminHandles().includes(handle.trim().replace(/^@+/, "").toLowerCase());
}
