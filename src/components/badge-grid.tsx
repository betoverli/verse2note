import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { Locale } from "@/lib/bible/books";
import { BADGE_COPY, BADGE_IDS, type BadgeId } from "@/lib/badges";
import { BadgeSeal } from "@/components/badge-seal";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BadgeGrid({
  earned,
  locale,
  locked,
}: {
  earned: BadgeId[];
  locale: Locale;
  locked?: boolean;
}) {
  const have = new Set(earned);
  const ids = locked ? BADGE_IDS.filter((id) => !have.has(id)) : earned;
  const [open, setOpen] = useState<BadgeId | null>(null);
  if (ids.length === 0) return null;
  const active = open ? BADGE_COPY[open] : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-6">
        {ids.map((id) => {
          const on = have.has(id);
          const copy = BADGE_COPY[id];
          const inner = (
            <>
              <BadgeSeal id={id} earned={on} />
              <span className="font-display text-lg leading-tight italic">{copy.names[locale]}</span>
              <span className="max-w-[11rem] text-xs leading-snug text-muted">{copy.hints[locale]}</span>
            </>
          );
          return (
            <li key={id} className={cn("flex flex-col items-center text-center", on ? "text-fg" : "text-subtle")}>
              {on ? (
                <button
                  type="button"
                  onClick={() => setOpen(id)}
                  className="flex w-full flex-col items-center gap-2.5 rounded-md"
                >
                  {inner}
                </button>
              ) : (
                <div className="flex w-full flex-col items-center gap-2.5">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
      <Dialog.Root open={Boolean(open)} onOpenChange={(next) => !next && setOpen(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed inset-0 z-50 grid place-items-center px-6 outline-none"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) setOpen(null);
            }}
          >
            {open && active ? (
              <div className="flex max-w-sm flex-col items-center gap-5 text-center">
                <div className="badge-hero">
                  <span className="badge-hero-shine" />
                  <BadgeSeal id={open} earned size="lg" />
                </div>
                <Dialog.Title className="font-display text-3xl leading-tight italic text-fg">
                  {active.names[locale]}
                </Dialog.Title>
                <Dialog.Description className="text-sm leading-relaxed text-muted">
                  {active.hints[locale]}
                </Dialog.Description>
              </div>
            ) : null}
            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] grid size-12 place-items-center text-muted"
                aria-label={t(locale, "back")}
              >
                <X className="size-6" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}