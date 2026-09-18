export function isAppleUa(ua = typeof navigator === "undefined" ? "" : navigator.userAgent) {
  return /iPhone|iPad|iPod/i.test(ua) || (typeof navigator !== "undefined" && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isIpadUa() {
  if (typeof navigator === "undefined") return false;
  return /iPad/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

type Overlay = { visible: boolean; getTitlebarAreaRect: () => DOMRect; addEventListener: (type: string, fn: () => void) => void; removeEventListener: (type: string, fn: () => void) => void };

function overlayApi() {
  return (navigator as Navigator & { windowControlsOverlay?: Overlay }).windowControlsOverlay;
}

export function syncWindowControlsPad() {
  const apply = () => {
    const overlay = overlayApi();
    let left = 0;
    if (overlay?.visible) left = Math.round(overlay.getTitlebarAreaRect().x);
    else if (isIpadUa() && isStandaloneDisplay()) left = 76;
    document.documentElement.style.setProperty("--window-controls-left", left ? `${left}px` : "0px");
  };
  apply();
  const overlay = overlayApi();
  overlay?.addEventListener("geometrychange", apply);
  window.addEventListener("resize", apply);
  return () => {
    overlay?.removeEventListener("geometrychange", apply);
    window.removeEventListener("resize", apply);
  };
}
