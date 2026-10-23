import { useEffect } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isNativeApp } from "@/lib/native/runtime";

/** Mounts nothing. Inside the iOS app it wires share targets, safe area, and push. */
export function NativeShell() {
  const { user } = useCurrentUserState();

  useEffect(() => {
    if (!isNativeApp()) return;
    void import("@/lib/native/shell").then((mod) => mod.installNativeShell());
  }, []);

  useEffect(() => {
    if (!user || !isNativeApp()) return;
    void import("@/lib/native/shell").then((mod) => mod.resumeNativePushIfNeeded());
  }, [user]);

  return null;
}
