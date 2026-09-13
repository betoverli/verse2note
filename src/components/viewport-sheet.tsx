import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function useVisualViewportBox() {
  const [box, setBox] = useState({ top: 0, height: typeof window === "undefined" ? 0 : window.innerHeight });
  useEffect(() => {
    const vv = window.visualViewport;
    const update = () => {
      if (!vv) {
        setBox({ top: 0, height: window.innerHeight });
        return;
      }
      setBox({ top: vv.offsetTop, height: vv.height });
    };
    update();
    window.addEventListener("resize", update);
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
    };
  }, []);
  return box;
}

export function ViewportSheet({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const box = useVisualViewportBox();
  const keyboard =
    typeof window === "undefined" ? 0 : Math.max(0, window.innerHeight - box.height - box.top);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-fg/40" aria-label="Close" onClick={onClose} />
      <div
        className="relative z-10 flex w-full max-h-full justify-center overflow-y-auto"
        style={{ paddingBottom: keyboard }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
