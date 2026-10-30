import { createServerFn } from "@tanstack/react-start";
import { isNativeAppUa } from "@/lib/native/runtime";

/**
 * Whether this request is the Capacitor iOS shell (UA token). Safe to call from
 * route loaders — the server read stays inside the handler.
 */
export const getNativeShellRequest = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest } = await import("@tanstack/react-start/server");
  const ua = getRequest()?.headers.get("user-agent") ?? "";
  return { nativeShell: isNativeAppUa(ua) };
});
