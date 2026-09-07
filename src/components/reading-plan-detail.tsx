import { Check, Copy, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { buildDeepLink } from "@/lib/bible/apps";
import { bookById, type Locale } from "@/lib/bible/books";
import { formatPassage, type Passage } from "@/lib/bible/passage";
import { readingToPassage, type PlanDay, type ReadingPlan } from "@/lib/bible/reading-plans";
import { translationById } from "@/lib/bible/translations";
import { copyReferences, type CopyItem } from "@/lib/copy-rich";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function toCopyItem(
  passage: Passage,
  locale: Locale,
  appId: string,
  translationId: string,
  preferNative: boolean,
): CopyItem | null {
  const book = bookById(passage.bookId);
  const translation = translationById(translationId);
  if (!book) return null;
  const url = buildDeepLink(appId, passage, translation, preferNative);
  if (!url) return null;
  return { label: formatPassage(book, passage, locale), url };
}

function dayItems(
  day: PlanDay,
  locale: Locale,
  appId: string,
  translationId: string,
  preferNative: boolean,
): CopyItem[] {
  return day.readings
    .map((reading) => toCopyItem(readingToPassage(reading), locale, appId, translationId, preferNative))
    .filter((item): item is CopyItem => item != null);
}

const EMPTY_DAYS: number[] = [];

export function ReadingPlanDetail({ plan }: { plan: ReadingPlan }) {
  const locale = useAppStore((s) => s.locale);
  const appId = useAppStore((s) => s.appId);
  const translationId = useAppStore((s) => s.translationId);
  const preferNative = useAppStore((s) => s.preferNative);
  const copyFormat = useAppStore((s) => s.copyFormat);
  const remember = useAppStore((s) => s.remember);
  const doneDays = useAppStore((s) => s.planProgress[plan.id]) ?? EMPTY_DAYS;
  const togglePlanDay = useAppStore((s) => s.togglePlanDay);
  const resetPlanProgress = useAppStore((s) => s.resetPlanProgress);
  const [copied, setCopied] = useState<string | null>(null);
  const firstOpen = useRef<HTMLLIElement | null>(null);

  const done = doneDays.length;
  const total = plan.days.length;
  const nextDay = plan.days.find((day) => !doneDays.includes(day.day))?.day ?? null;

  useEffect(() => {
    firstOpen.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [plan.id]);

  function flash(key: string) {
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  }

  function notify(message: string, mode: "success" | "error" = "success") {
    const id = mode === "success" ? toast.success(message) : toast.error(message);
    window.setTimeout(() => toast.dismiss(id), 2000);
  }

  async function onCopy(items: CopyItem[], passages: Passage[], key: string) {
    if (items.length === 0) return;
    try {
      await copyReferences(items, copyFormat);
      for (const passage of passages) remember(passage);
      flash(key);
      notify(t(locale, "copied"));
    } catch {
      notify(t(locale, "copy"), "error");
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="space-y-2">
        <p className="text-sm text-muted">
          {done} / {total} {t(locale, "days")}
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }}
          />
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {plan.days.map((day) => {
          const complete = doneDays.includes(day.day);
          const passages = day.readings.map(readingToPassage);
          const items = dayItems(day, locale, appId, translationId, preferNative);
          return (
            <li
              key={day.day}
              ref={day.day === nextDay ? firstOpen : undefined}
              className={cn(
                "flex gap-2 rounded-md bg-surface px-2 py-2 shadow-[var(--shadow-border)]",
                complete ? "opacity-70" : "",
              )}
            >
              <button
                type="button"
                onClick={() => togglePlanDay(plan.id, day.day)}
                aria-pressed={complete}
                aria-label={t(locale, complete ? "readingUnmark" : "readingMark")}
                className={cn(
                  "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-md",
                  complete ? "bg-accent text-accent-fg" : "text-muted hover:bg-elevated",
                )}
              >
                {complete ? <Check className="size-5" /> : <span className="size-4 rounded-full border-2 border-current" />}
              </button>
              <div className="min-w-0 flex-1 py-1.5">
                <p className="text-xs font-medium tracking-wide text-subtle uppercase">
                  {t(locale, "day")} {day.day}
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {items.map((item, index) => (
                    <span key={`${item.label}-${index}`} className="inline-flex items-center rounded-sm bg-elevated">
                      <button
                        type="button"
                        onClick={() => void onCopy([item], [passages[index]], `${day.day}-${index}`)}
                        className="min-h-11 px-2.5 text-sm text-fg"
                      >
                        {copied === `${day.day}-${index}` ? t(locale, "copied") : item.label}
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={t(locale, "open")}
                        className="flex size-11 items-center justify-center text-muted"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </span>
                  ))}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="mt-0.5 shrink-0"
                onClick={() => void onCopy(items, passages, `day-${day.day}`)}
                aria-label={t(locale, "copy")}
              >
                {copied === `day-${day.day}` ? <Check /> : <Copy />}
              </Button>
            </li>
          );
        })}
      </ul>
      {done > 0 ? (
        <Button variant="secondary" className="w-full" onClick={() => resetPlanProgress(plan.id)}>
          {t(locale, "readingReset")}
        </Button>
      ) : null}
    </div>
  );
}
