import { useLayoutEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { t, type I18nKey } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

const STEPS: { id: string; body: I18nKey; maxH?: number }[] = [
  { id: "books", body: "tourBooks", maxH: 0.36 },
  { id: "recents", body: "tourRecents" },
  { id: "collections", body: "tourCollections" },
  { id: "reading", body: "tourReading" },
  { id: "settings", body: "tourSettings" },
];

type Hole = { top: number; left: number; width: number; height: number };

function measure(id: string, maxH?: number): Hole | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${id}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const pad = 6;
  const maxHeight = maxH ? window.innerHeight * maxH : r.height + pad * 2;
  return {
    top: Math.max(8, r.top - pad),
    left: Math.max(8, r.left - pad),
    width: Math.min(window.innerWidth - 16, r.width + pad * 2),
    height: Math.min(maxHeight, r.height + pad * 2, window.innerHeight - 16),
  };
}

export function Coachmarks() {
  const locale = useAppStore((s) => s.locale);
  const tourDone = useAppStore((s) => s.tourDone);
  const completeTour = useAppStore((s) => s.completeTour);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [index, setIndex] = useState(0);
  const [hole, setHole] = useState<Hole | null>(null);

  const active = !tourDone && pathname === "/app";
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  useLayoutEffect(() => {
    if (!active || !step) return;
    const update = () => setHole(measure(step.id, step.maxH));
    update();
    const id = window.requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, step]);

  if (!active || !step) return null;

  const tooltipTop = hole
    ? hole.top + hole.height + 12 > window.innerHeight - 180
      ? Math.max(12, hole.top - 12 - 148)
      : hole.top + hole.height + 12
    : window.innerHeight / 2 - 80;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label={t(locale, step.body)}>
      <div className="absolute inset-0 bg-black/50" />
      {hole ? (
        <div
          className="pointer-events-none absolute rounded-lg shadow-[0_0_0_9999px_rgb(0_0_0_/_0.55)] ring-2 ring-accent/90"
          style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
        />
      ) : null}
      <div
        className="absolute inset-x-4 mx-auto w-[min(100%,20.5rem)] rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]"
        style={{ top: tooltipTop }}
      >
        <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
          {index + 1} / {STEPS.length}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-fg">{t(locale, step.body)}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={completeTour}>
            {t(locale, "tourSkip")}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (last) completeTour();
              else setIndex((n) => n + 1);
            }}
          >
            {last ? t(locale, "tourFinish") : t(locale, "tourNext")}
          </Button>
        </div>
      </div>
    </div>
  );
}
