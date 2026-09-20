import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function ViewportSheet({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const [box, setBox] = useState({ top: 0, height: 0 });

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
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed z-[80] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      style={{ top: box.top, left: 0, width: "100%", height: box.height || "100%" }}
    >
      <button type="button" className="absolute inset-0 bg-fg/40" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 mx-auto w-full max-w-sm max-h-full overflow-y-auto" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
