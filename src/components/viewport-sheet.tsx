import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export function ViewportSheet({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-fg/40" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 mx-auto w-full max-w-sm" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
