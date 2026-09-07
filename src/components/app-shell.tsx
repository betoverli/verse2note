import { useEffect, useState } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Onboarding } from "@/components/onboarding";
import { showTabBar, TabBar } from "@/components/tab-bar";
import { useAppStore } from "@/lib/store";

const PUBLIC = new Set(["/", "/about", "/for-ai"]);

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const onboarded = useAppStore((s) => s.onboarded);
  const [hydrated, setHydrated] = useState(() => PUBLIC.has(pathname));
  const tabs = onboarded && showTabBar(pathname);

  useEffect(() => {
    const api = useAppStore.persist;
    if (!api) {
      setHydrated(true);
      return;
    }
    if (api.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return api.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("has-tab-bar", Boolean(tabs));
    return () => document.documentElement.classList.remove("has-tab-bar");
  }, [tabs]);

  if (PUBLIC.has(pathname)) return <Outlet />;
  if (!hydrated) return <div className="min-h-dvh bg-bg" aria-hidden="true" />;
  if (!onboarded) return <Onboarding onBack={() => void navigate({ to: "/" })} />;
  return (
    <>
      <Outlet />
      {tabs ? <TabBar /> : null}
    </>
  );
}
