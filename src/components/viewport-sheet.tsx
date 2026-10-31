import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  canUseNativeMenus,
  dismissNativeMenu,
  presentNativeMenu,
  rectFromElement,
} from "@/lib/native/menus";
import { isNativeApp } from "@/lib/native/runtime";
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
      data-native-chrome="tabs"
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

/** iOS action sheet / alert: inset groups, separate Cancel, tint and destructive rows.
 * On Capacitor iOS this becomes a native `UIAlertController` (action sheet or
 * centered alert); web and Android keep the HTML sheet. */
export function ActionSheet({
  title,
  message,
  actions,
  cancelLabel,
  onClose,
  anchor,
  variant = "sheet",
}: {
  title?: string;
  message?: string;
  actions: SheetAction[];
  cancelLabel: string;
  onClose: () => void;
  /** Optional element whose rect anchors the native popover (iPad). */
  anchor?: Element | null;
  /** `"alert"` → centered UIAlertController; default is the bottom action sheet. */
  variant?: "sheet" | "alert";
}) {
  // Browser/Android paint the HTML sheet immediately. Capacitor iOS waits for
  // the plugin so the web sheet never flashes under the native one.
  const [mode, setMode] = useState<"pending" | "native" | "web">(() =>
    typeof window !== "undefined" && isNativeApp() ? "pending" : "web",
  );
  const onCloseRef = useRef(onClose);
  const actionsRef = useRef(actions);
  const settledRef = useRef(false);
  onCloseRef.current = onClose;
  actionsRef.current = actions;

  useEffect(() => {
    if (mode === "web") return;
    let alive = true;
    let handedToNative = false;
    void (async () => {
      const ok = await canUseNativeMenus();
      if (!alive) return;
      if (!ok) {
        setMode("web");
        return;
      }
      // Snapshot handlers at present time so a later parent render cannot
      // replace onSelect with a stale closure (e.g. dropSpeaker cleared).
      const presented = actionsRef.current.map((action, index) => ({
        id: `action-${index}`,
        title: action.label,
        destructive: action.destructive,
        symbol: action.destructive ? "trash" : undefined,
        onSelect: action.onSelect,
      }));
      // Stay in "pending" (no web flash) until native confirms or fails fast.
      const result = await presentNativeMenu({
        style: variant === "alert" ? "alert" : "sheet",
        title,
        message,
        cancelLabel,
        anchor: rectFromElement(anchor ?? null),
        items: presented.map(({ id, title: itemTitle, destructive, symbol }) => ({
          id,
          title: itemTitle,
          destructive,
          symbol,
        })),
      });
      // A remount may have set alive=false, but if the user already picked an
      // item on this presentation we must still apply it — that was the
      // first-speaker / remove-× bug on iOS.
      if (result.failed) {
        if (!alive) return;
        setMode("web");
        return;
      }
      handedToNative = true;
      if (settledRef.current) return;
      settledRef.current = true;
      if (!result.cancelled && result.id) {
        const index = Number(result.id.replace("action-", ""));
        const action = presented[index];
        try {
          action?.onSelect();
        } catch (error) {
          console.warn("[ActionSheet] onSelect failed", error);
        }
      }
      onCloseRef.current();
    })();
    return () => {
      alive = false;
      // Only dismiss a sheet we actually handed to native. Dismissing during
      // the pending probe was cancelling a just-presented alert (blank UI).
      if (handedToNative) void dismissNativeMenu();
    };
    // Mount once per sheet open; callers remount when ask* flags flip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (mode !== "web") return null;

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
