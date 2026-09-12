import { useEffect, useRef } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getPrefs, mergePrefs, savePrefs, type CloudPrefs } from "@/lib/cloud";
import { profileIsComplete } from "@/lib/profile";
import { listMyCollections } from "@/lib/user-collections";
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
  const userId = user?.id ?? null;
  const ready = useRef(false);
  const last = useRef<string>("");
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    if (!userId) {
      syncedFor.current = null;
      useAppStore.getState().clearAccount();
      useAppStore.getState().setCloudHydrated(true);
      ready.current = false;
      return;
    }
    if (syncedFor.current === userId) {
      useAppStore.getState().setCloudHydrated(true);
      return;
    }
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) useAppStore.getState().setCloudHydrated(true);
    }, 4000);
    void (async () => {
      try {
        const [cloud, collections] = await Promise.all([getPrefs(), listMyCollections()]);
        if (cancelled) return;
        useAppStore.getState().setMyCollections(collections);
        if (cloud) {
          const merged = mergePrefs(snapshot(), cloud);
          useAppStore.getState().applyCloud(merged);
          last.current = JSON.stringify(merged);
          await savePrefs({ data: merged });
          useAppStore.getState().setCloudProfileOk(profileIsComplete(cloud));
        } else {
          const first = mergePrefs(snapshot(), null);
          useAppStore.getState().applyCloud(first);
          last.current = JSON.stringify(first);
          const saved = await savePrefs({ data: first });
          useAppStore.getState().setCloudProfileOk(
            !(saved && "error" in saved) && profileIsComplete(first),
          );
        }
        syncedFor.current = userId;
        ready.current = true;
      } catch {
        ready.current = false;
      } finally {
        window.clearTimeout(timeout);
        if (!cancelled) useAppStore.getState().setCloudHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [userId, isPending]);

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
  }, [userId]);

  return null;
}
