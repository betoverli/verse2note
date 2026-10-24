import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/** Full-width bottom form sheet. Top radius only, flush with the screen edge. */
export const formSheetClass =
  "flex w-full flex-col rounded-t-[20px] bg-elevated pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]";

export function SheetGrabber() {
  return <div className="mx-auto mb-3 h-1.5 w-9 shrink-0 rounded-full bg-fill" aria-hidden />;
}

function useViewportBox() {
  const [box, setBox] = useState({ top: 0, height: 0 });

  useEffect(() => {
    const vv = window.visualViewport;
    const update = () => {
      const next = !vv ? { top: 0, height: window.innerHeight } : { top: vv.offsetTop, height: vv.height };
      setBox((prev) => (prev.top === next.top && prev.height === next.height ? prev : next));
    };
    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return box;
}

function SheetFrame({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const box = useViewportBox();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed z-[80] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      style={{ top: box.top, left: 0, width: "100%", height: box.height || "100%" }}
    >
      <button type="button" className="ios-sheet-backdrop absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div className="ios-sheet-panel relative z-10 w-full max-h-[min(85dvh,40rem)] overflow-y-auto">{children}</div>
    </div>,
    document.body,
  );
}

export function ViewportSheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <SheetFrame onClose={onClose}>{children}</SheetFrame>;
}

export type SheetAction = {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
};

/** iOS action sheet: inset groups, separate Cancel, tint and destructive rows. */
export function ActionSheet({
  title,
  message,
  actions,
  cancelLabel,
  onClose,
}: {
  title?: string;
  message?: string;
  actions: SheetAction[];
  cancelLabel: string;
  onClose: () => void;
}) {
  return (
    <SheetFrame onClose={onClose}>
      <div className="flex flex-col gap-2 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="overflow-hidden rounded-[14px] bg-surface">
          {title || message ? (
            <div className="px-4 py-3 text-center text-[13px] leading-snug text-muted">
              {title ? <p className="text-[13px] font-semibold text-fg">{title}</p> : null}
              {message ? <p className={title ? "mt-0.5" : undefined}>{message}</p> : null}
            </div>
          ) : null}
          {actions.map((action, index) => (
            <button
              key={action.label}
              type="button"
              className={cn(
                "flex min-h-[57px] w-full items-center justify-center px-4 text-center text-[20px] leading-snug text-accent active:bg-fill",
                (index > 0 || title || message) && "border-t border-separator",
                action.destructive && "text-danger",
              )}
              onClick={() => {
                action.onSelect();
                onClose();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="flex min-h-[57px] w-full items-center justify-center rounded-[14px] bg-surface px-4 text-[20px] font-semibold text-accent active:bg-fill"
          onClick={onClose}
        >
          {cancelLabel}
        </button>
      </div>
    </SheetFrame>
  );
}
