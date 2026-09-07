import { useEffect, useRef } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getPrefs, mergePrefs, savePrefs, type CloudPrefs } from "@/lib/cloud";
import { useAppStore } from "@/lib/store";

function snapshot(): CloudPrefs {
  const s = useAppStore.getState();
  return {
    locale: s.locale,
    appId: s.appId,
    translationId: s.translationId,
    preferNative: s.preferNative,
    copyFormat: s.copyFormat,
    booksCompact: s.booksCompact,
    theme: s.theme,
    activePlans: s.activePlans,
    planProgress: s.planProgress,
    avatarId: s.avatarId,
    avatarUrl: s.avatarUrl,
    handle: s.handle,
    firstName: s.firstName,
    lastName: s.lastName,
    profileEmail: s.profileEmail,
  };
}

export function AccountSync() {
  const { user, isPending } = useCurrentUserState();
  const ready = useRef(false);
  const last = useRef<string>("");

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      useAppStore.getState().clearAccount();
      ready.current = false;
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const cloud = await getPrefs();
        if (cancelled) return;
        const merged = mergePrefs(snapshot(), cloud);
        useAppStore.getState().applyCloud(merged);
        last.current = JSON.stringify(merged);
        const saved = await savePrefs({ data: merged });
        if (saved && "error" in saved && saved.error === "handle") {
          /* keep local handle; profile page shows the conflict */
        }
        ready.current = true;
      } catch {
        ready.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isPending]);

  useEffect(() => {
    if (!user) return;
    let timer = 0;
    const unsub = useAppStore.subscribe((state) => {
      if (!ready.current) return;
      const next = JSON.stringify({
        locale: state.locale,
        appId: state.appId,
        translationId: state.translationId,
        preferNative: state.preferNative,
        copyFormat: state.copyFormat,
        booksCompact: state.booksCompact,
        theme: state.theme,
        activePlans: state.activePlans,
        planProgress: state.planProgress,
        avatarId: state.avatarId,
        avatarUrl: state.avatarUrl,
        handle: state.handle,
        firstName: state.firstName,
        lastName: state.lastName,
        profileEmail: state.profileEmail,
      });
      if (next === last.current) return;
      last.current = next;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const prefs = snapshot();
        void savePrefs({ data: prefs }).catch(() => undefined);
      }, 800);
    });
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, [user]);

  return null;
}
