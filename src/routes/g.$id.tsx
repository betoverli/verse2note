import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { planById } from "@/lib/bible/reading-plans";
import { rememberInvite } from "@/lib/invite";
import { joinPlanGroup, getPlanGroupPreview } from "@/lib/plan-groups";
import { t } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/g/$id")({
  component: JoinPlanRoute,
  head: () => {
    const seo = pageHead({
      title: "Verse2Note — Plano juntos",
      description: "Convite para ler um plano de leitura junto.",
      path: "/g",
    });
    return { ...seo, meta: [...seo.meta, { name: "robots", content: "noindex" }] };
  },
});

function JoinPlanRoute() {
  const { id } = Route.useParams();
  const locale = useAppStore((s) => s.locale);
  const startPlan = useAppStore((s) => s.startPlan);
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [preview, setPreview] = useState<{ planId: string; host: string; members: number } | null | undefined>(
    undefined,
  );
  const [busy, setBusy] = useState(false);
  const joining = useRef(false);

  useEffect(() => {
    rememberInvite(id);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    void getPlanGroupPreview({ data: { id } }).then((row) => {
      if (!cancelled) setPreview(row);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const plan = preview ? planById(preview.planId) : undefined;

  async function onJoin() {
    if (busy || joining.current) return;
    joining.current = true;
    setBusy(true);
    const result = await joinPlanGroup({ data: { id } });
    if (result && result.ok) {
      rememberInvite("");
      try {
        sessionStorage.removeItem("v2n-invite");
      } catch {
        /* ignore */
      }
      startPlan(result.planId);
      await navigate({ to: "/reading/$id", params: { id: result.planId } });
      return;
    }
    joining.current = false;
    setBusy(false);
  }

  useEffect(() => {
    if (!user || !preview || !plan) return;
    void onJoin();
  }, [user, preview, plan, id]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pt-0 pb-[calc(var(--tab-bar-height)+1.5rem)] sm:px-6">
      <AppHeader title={plan?.names[locale] ?? t(locale, "planTogether")} backTo="/reading" />
      {preview === undefined || isPending || (user && busy) ? (
        <div className="h-32 rounded-lg bg-surface" aria-hidden="true" />
      ) : !preview || !plan ? (
        <p className="text-sm text-muted">{t(locale, "plansEmpty")}</p>
      ) : user ? (
        <p className="text-sm text-muted">{t(locale, "planJoin")}</p>
      ) : (
        <div className="flex flex-col gap-6">
          <p className="text-sm leading-relaxed text-muted">{t(locale, "planJoinHint")}</p>
          {preview.host ? (
            <p className="text-sm text-fg">
              @{preview.host} · {preview.members} {t(locale, "planMembers")}
            </p>
          ) : (
            <p className="text-sm text-muted">
              {preview.members} {t(locale, "planMembers")}
            </p>
          )}
          <Button asChild>
            <Link to="/login" search={{ create: true, next: `/g/${id}` }}>
              {t(locale, "planJoinLogin")}
            </Link>
          </Button>
        </div>
      )}
    </main>
  );
}
