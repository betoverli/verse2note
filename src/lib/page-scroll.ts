import { useLayoutEffect } from "react";

/** The middle column that scrolls inside the iOS shell, when the page has one. */
export function activePageScroller(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  if (!document.documentElement.classList.contains("native-ios")) return null;
  const el = document.querySelector("main.screen > .screen-body, main.note-screen > .screen-body");
  return el instanceof HTMLElement ? el : null;
}

export function scrollPageTo(top: number, behavior: ScrollBehavior = "auto") {
  const scroller = activePageScroller();
  if (scroller) scroller.scrollTo({ top, behavior });
  else window.scrollTo({ top, behavior });
}

export function scrollPageBy(dy: number) {
  const scroller = activePageScroller();
  if (scroller) scroller.scrollBy({ top: dy, behavior: "auto" });
  else window.scrollBy(0, dy);
}

/** Stop the document itself from scrolling while a page scroller is on screen. */
export function useNativeScrollLock() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("scroll-locked");
    if (root.classList.contains("native-ios")) window.scrollTo(0, 0);
    return () => root.classList.remove("scroll-locked");
  }, []);
}
