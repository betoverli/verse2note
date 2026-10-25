import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Overlay chrome (FAB, verse dock) that must stay on the viewport.
 * A scrollport ancestor in the iOS shell would carry `position: fixed`
 * along with the rubber-band.
 */
export function ViewportFixed({ children }: { children: ReactNode }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setRoot(document.body);
  }, []);
  if (typeof document === "undefined" || !root) return children;
  return createPortal(children, root);
}
