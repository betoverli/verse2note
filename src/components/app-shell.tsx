import { useEffect, useState } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AccountSync } from "@/components/account-sync";
import { Coachmarks } from "@/components/coachmarks";
import { Onboarding } from "@/components/onboarding";
import { SplashScreen } from "@/components/splash-screen";
import { showTabBar, TabBar } from "@/components/tab-bar";
import { useAppStore } from "@/lib/store";

const PUBLIC = new Set(["/", "/about", "/for-ai", "/login"]);

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const onboarded = useAppStore((s) => s.onboarded);
  const publicPage = PUBLIC.has(pathname);
  const [hydrated, setHydrated] = useState(publicPage);
  const [minTime, setMinTime] = useState(publicPage);
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
    if (publicPage) return;
    const timer = window.setTimeout(() => setMinTime(true), 450);
    return () => window.clearTimeout(timer);
  }, [publicPage]);

  useEffect(() => {
    document.documentElement.classList.toggle("has-tab-bar", Boolean(tabs));
    return () => document.documentElement.classList.remove("has-tab-bar");
  }, [tabs]);

  if (publicPage) return <Outlet />;
  if (!hydrated || !minTime) return <SplashScreen />;
  if (!onboarded) return <Onboarding onBack={() => void navigate({ to: "/" })} />;
  return (
    <>
      <Outlet />
      {tabs ? <TabBar /> : null}
      <Coachmarks />
      <AccountSync />
    </>
  );
}
