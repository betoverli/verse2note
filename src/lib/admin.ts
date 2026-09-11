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
  return splitEnv("ADMIN_HANDLES");
}
