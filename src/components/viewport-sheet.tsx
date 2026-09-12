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
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-x-0 z-[80] flex items-end justify-center bg-fg/50 sm:items-center"
      style={{ top: box.top, height: box.height }}
      onClick={onClose}
    >
      {children}
    </div>,
    document.body,
  );
}
