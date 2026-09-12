import { useEffect, useState } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AccountSync } from "@/components/account-sync";
import { Coachmarks } from "@/components/coachmarks";
import { CompleteProfile } from "@/components/complete-profile";
import { Onboarding } from "@/components/onboarding";
import { SplashScreen } from "@/components/splash-screen";
import { showTabBar, TabBar } from "@/components/tab-bar";
import { UsagePing } from "@/components/usage-ping";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { takeInvite } from "@/lib/invite";
import { joinPlanGroup } from "@/lib/plan-groups";
import { useAppStore } from "@/lib/store";

const PUBLIC = new Set(["/", "/about", "/for-ai", "/login"]);

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const onboarded = useAppStore((s) => s.onboarded);
  const cloudHydrated = useAppStore((s) => s.cloudHydrated);
  const cloudProfileOk = useAppStore((s) => s.cloudProfileOk);
  const startPlan = useAppStore((s) => s.startPlan);
  const { user, isPending } = useCurrentUserState();
  const invitePage = pathname.startsWith("/g/");
  const publicPage =
    PUBLIC.has(pathname) || invitePage || pathname.startsWith("/u/") || pathname.startsWith("/c/");
  const [hydrated, setHydrated] = useState(publicPage);
  const [minTime, setMinTime] = useState(publicPage);
  const waitingCloud = Boolean(!onboarded && user && !cloudHydrated && !isPending);
  const showSplash = !publicPage && (!hydrated || !minTime || waitingCloud);
  const showOnboarding = !publicPage && !showSplash && !onboarded;
  const needsProfile = Boolean(user && !user.isDevFallback && cloudHydrated && !isPending && !cloudProfileOk);
  const showProfile = !publicPage && !showSplash && !showOnboarding && needsProfile;
  const tabs = onboarded && !showSplash && !showOnboarding && !showProfile && showTabBar(pathname);

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

  useEffect(() => {
    if (!onboarded || !user) return;
    const id = takeInvite();
    if (!id) return;
    void joinPlanGroup({ data: { id } }).then((result) => {
      if (result && result.ok) {
        startPlan(result.planId);
        void navigate({ to: "/reading/$id", params: { id: result.planId } });
      }
    });
  }, [onboarded, user, navigate, startPlan]);

  if (publicPage) {
    return (
      <>
        <Outlet />
        <AccountSync />
        <UsagePing />
      </>
    );
  }
  if (showSplash) {
    return (
      <>
        <SplashScreen />
        <AccountSync />
      </>
    );
  }
  if (showOnboarding) {
    return (
      <>
        <Onboarding onBack={() => void navigate({ to: "/" })} />
        <AccountSync />
      </>
    );
  }
  if (showProfile) {
    return (
      <>
        <CompleteProfile />
        <AccountSync />
      </>
    );
  }
  return (
    <>
      <Outlet />
      {tabs ? <TabBar /> : null}
      <Coachmarks />
      <AccountSync />
      <UsagePing />
    </>
  );
}
