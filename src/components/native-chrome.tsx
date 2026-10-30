import { useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { t } from "@/lib/i18n";
import { currentFab, currentHeader, subscribeChrome } from "@/lib/native/chrome-store";
import {
  chromeVisibility,
  connectLiquidChrome,
  readTrailing,
  suspensionFromDom,
  type LiquidChromePayload,
  type LiquidChromePlugin,
} from "@/lib/native/liquid-chrome";
import { isNativeApp } from "@/lib/native/runtime";
import { scrollPageTo } from "@/lib/page-scroll";
import { APP_TABS, selectedTabId, showTabBar } from "@/lib/tabs";
import { useAppStore } from "@/lib/store";

/**
 * Keeps the native iOS bars in step with the route. On the web, and on an
 * iOS binary that does not include the plugin, it does nothing and the HTML
 * chrome stays.
 */
export function NativeChrome() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const locale = useAppStore((s) => s.locale);
  const navigate = useNavigate();
  const pathRef = useRef(pathname);
  const localeRef = useRef(locale);
  const navigateRef = useRef(navigate);
  const scheduleRef = useRef<() => void>(() => {});
  pathRef.current = pathname;
  localeRef.current = locale;
  navigateRef.current = navigate;

  useEffect(() => {
    if (!isNativeApp()) return;
    const root = document.documentElement;
    let cancelled = false;
    let plugin: LiquidChromePlugin | null = null;
    let signature = "";
    let running = false;
    let pending = false;
    const handles: { remove: () => Promise<void> }[] = [];

    const deactivate = () => {
      plugin = null;
      signature = "";
      root.classList.remove("native-tabs", "native-top", "native-fab-on");
      delete root.dataset.liquidGlass;
      const bar = document.querySelector(".tab-bar");
      if (bar instanceof HTMLElement) bar.removeAttribute("aria-hidden");
    };

    const applyClasses = (payload: LiquidChromePayload, insets?: { top: number; bottom: number; glass?: boolean }) => {
      if (insets) {
        root.style.setProperty("--native-tab-inset", `${Math.round(insets.bottom)}px`);
        root.style.setProperty("--native-top-inset", `${Math.round(insets.top)}px`);
        if (typeof insets.glass === "boolean") root.dataset.liquidGlass = insets.glass ? "liquid" : "classic";
      }
      const topReady = payload.topVisible && (insets ? insets.top > 0 : root.style.getPropertyValue("--native-top-inset") !== "");
      root.classList.toggle("native-tabs", payload.tabsVisible);
      root.classList.toggle("native-top", topReady);
      // The keyboard hides the native + button. Keep the HTML copy hidden too,
      // or it pops back over the keyboard.
      const fabOwned = payload.fabVisible || Boolean(payload.keyboard && currentFab());
      root.classList.toggle("native-fab-on", fabOwned);
      const bar = document.querySelector(".tab-bar");
      if (bar instanceof HTMLElement) {
        if (payload.tabsVisible) bar.setAttribute("aria-hidden", "true");
        else bar.removeAttribute("aria-hidden");
      }
    };

    const once = async () => {
      if (!plugin || cancelled) return;
      const header = currentHeader();
      const fab = currentFab();
      const flags = chromeVisibility({
        active: true,
        suspension: suspensionFromDom(document),
        hasTabBar: root.classList.contains("has-tab-bar") && showTabBar(pathRef.current),
        hasHeader: header != null,
        hasFab: fab != null,
        keyboard: root.classList.contains("keyboard-open"),
      });
      const trailing = readTrailing(document, flags.top ? header?.trailingSymbol ?? null : null);
      const selected = selectedTabId(pathRef.current);
      const payload: LiquidChromePayload = {
        tabsVisible: flags.tabs,
        tabs: APP_TABS.map((tab) => ({ id: tab.id, label: t(localeRef.current, tab.key), symbol: tab.symbol })),
        selectedTab: selected ?? "",
        topVisible: flags.top,
        title: flags.top ? header?.title ?? "" : "",
        back: Boolean(flags.top && header?.back),
        backLabel: header?.backLabel ?? "",
        searchVisible: Boolean(flags.top && header?.search),
        searchText: header?.search?.value ?? "",
        searchPlaceholder: header?.search?.placeholder ?? "",
        trailingVisible: trailing.visible,
        trailingSymbol: header?.trailingSymbol ?? "",
        trailingBadge: trailing.badge,
        trailingLabel: trailing.label,
        fabVisible: flags.fab,
        fabLabel: fab?.label ?? "",
        fabMenu: (fab?.menu ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          symbol: item.symbol ?? "",
          destructive: Boolean(item.destructive),
        })),
        keyboard: flags.keyboard,
        appearance: root.classList.contains("light") ? "light" : "dark",
      };
      const next = JSON.stringify(payload);
      if (next === signature) return;
      try {
        const insets = await plugin.setChrome(payload);
        if (cancelled) return;
        signature = next;
        applyClasses(payload, insets);
      } catch {
        deactivate();
      }
    };

    const sync = async () => {
      if (running) {
        pending = true;
        return;
      }
      running = true;
      try {
        do {
          pending = false;
          await once();
        } while (pending && !cancelled);
      } finally {
        running = false;
      }
    };

    let frame = 0;
    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => void sync());
    };
    scheduleRef.current = schedule;

    const go = (id: string) => {
      const tab = APP_TABS.find((item) => item.id === id);
      if (!tab) return;
      const path = pathRef.current;
      if (path === tab.to || path === `${tab.to}/`) {
        scrollPageTo(0);
        return;
      }
      if (tab.id === "verses") void navigateRef.current({ to: "/app" });
      else if (tab.id === "groups") void navigateRef.current({ to: "/groups" });
      else if (tab.id === "notebook") void navigateRef.current({ to: "/notebook" });
      else if (tab.id === "reading") void navigateRef.current({ to: "/reading" });
      else void navigateRef.current({ to: "/profile" });
    };

    const observer = new MutationObserver(schedule);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { childList: true, subtree: true });
    const unsub = subscribeChrome(schedule);

    void (async () => {
      let connected: Awaited<ReturnType<typeof connectLiquidChrome>> = null;
      for (let attempt = 0; attempt < 6 && !cancelled; attempt++) {
        connected = await connectLiquidChrome();
        if (connected) break;
        await new Promise((resolve) => window.setTimeout(resolve, 120 * (attempt + 1)));
      }
      if (!connected || cancelled) return;
      plugin = connected.plugin;
      root.dataset.liquidGlass = connected.info.glass ? "liquid" : "classic";
      handles.push(
        await connected.plugin.addListener("tabSelected", (event) => go(String(event.id))),
        await connected.plugin.addListener("back", () => {
          document.querySelector<HTMLElement>("[data-native-back]")?.click();
        }),
        await connected.plugin.addListener("trailingTap", () => {
          const control = document.querySelector<HTMLElement>("[data-native-trailing] a, [data-native-trailing] button");
          control?.click();
        }),
        await connected.plugin.addListener("fabTap", () => currentFab()?.onPress()),
        await connected.plugin.addListener("fabMenuSelect", (event) => {
          const fab = currentFab();
          const id = String(event.id ?? "");
          if (!id) return;
          if (fab?.onMenuSelect) fab.onMenuSelect(id);
          else fab?.onPress();
        }),
        await connected.plugin.addListener("searchChanged", (event) => currentHeader()?.onSearch(event.text)),
        await connected.plugin.addListener("insets", (event) => {
          root.style.setProperty("--native-tab-inset", `${Math.round(Number(event.bottom) || 0)}px`);
          root.style.setProperty("--native-top-inset", `${Math.round(Number(event.top) || 0)}px`);
        }),
      );
      if (!cancelled) schedule();
    })();

    return () => {
      cancelled = true;
      scheduleRef.current = () => {};
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      unsub();
      handles.forEach((handle) => void handle.remove());
      deactivate();
    };
  }, []);

  useLayoutEffect(() => {
    scheduleRef.current();
  }, [pathname, locale]);

  return null;
}
