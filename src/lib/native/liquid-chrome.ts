import type { AppTabId } from "@/lib/tabs";

export type LiquidChromeInfo = {
  available: boolean;
  glass: boolean;
  major: number;
};

export type LiquidChromeInsets = {
  top: number;
  bottom: number;
  glass: boolean;
};

export type LiquidChromePayload = {
  tabsVisible: boolean;
  tabs: { id: string; label: string; symbol: string }[];
  selectedTab: string;
  topVisible: boolean;
  title: string;
  back: boolean;
  backLabel: string;
  /**
   * The screen offers search. The native bar shows a magnifying glass and
   * opens the field in the title row. This does not reserve a second strip.
   */
  searchVisible: boolean;
  searchText: string;
  searchPlaceholder: string;
  trailingVisible: boolean;
  trailingSymbol: string;
  trailingBadge: string;
  trailingLabel: string;
  fabVisible: boolean;
  fabLabel: string;
  keyboard: boolean;
  appearance: "light" | "dark";
};

export type ChromeSuspension = "none" | "tabs" | "all";

/**
 * Which native surfaces stay up.
 * `tabs` (a bottom sheet) drops the tab bar and the FAB so the sheet can
 * reach the bottom of the web view. `all` (the first-run tour) drops the
 * top bar too, so the tour can see the HTML chrome it measures.
 */
export function chromeVisibility(input: {
  active: boolean;
  suspension: ChromeSuspension;
  hasTabBar: boolean;
  hasHeader: boolean;
  hasFab: boolean;
  keyboard: boolean;
}) {
  if (!input.active || input.suspension === "all") {
    return { tabs: false, top: false, fab: false, keyboard: false };
  }
  const tabs = input.hasTabBar && input.suspension !== "tabs";
  return {
    tabs,
    top: input.hasHeader,
    fab: input.hasFab && input.suspension === "none" && !input.keyboard,
    keyboard: input.keyboard && tabs,
  };
}

export function suspensionFromDom(root: ParentNode): ChromeSuspension {
  if (root.querySelector('[data-native-chrome="all"]')) return "all";
  if (root.querySelector('[data-native-chrome="tabs"], [role="dialog"][aria-modal="true"]')) return "tabs";
  return "none";
}

export function readTrailing(root: ParentNode, symbol: string | null) {
  if (!symbol) return { visible: false, label: "", badge: "" };
  const slot = root.querySelector("[data-native-trailing]");
  const control = slot?.querySelector("a, button");
  if (control == null || typeof control.getAttribute !== "function") return { visible: false, label: "", badge: "" };
  return {
    visible: true,
    label: control.getAttribute("aria-label") ?? "",
    badge: control.getAttribute("data-native-badge") ?? "",
  };
}

export type LiquidChromePlugin = {
  info(): Promise<LiquidChromeInfo>;
  setChrome(payload: LiquidChromePayload): Promise<LiquidChromeInsets>;
  addListener(
    event: "tabSelected",
    handler: (event: { id: AppTabId | string }) => void,
  ): Promise<{ remove: () => Promise<void> }>;
  addListener(event: "back" | "trailingTap" | "fabTap", handler: () => void): Promise<{ remove: () => Promise<void> }>;
  addListener(
    event: "searchChanged",
    handler: (event: { text: string }) => void,
  ): Promise<{ remove: () => Promise<void> }>;
  addListener(
    event: "insets",
    handler: (event: { top: number; bottom: number; glass?: boolean }) => void,
  ): Promise<{ remove: () => Promise<void> }>;
};

export async function connectLiquidChrome(): Promise<{ plugin: LiquidChromePlugin; info: LiquidChromeInfo } | null> {
  if (typeof window === "undefined") return null;
  try {
    const { registerPlugin } = await import("@capacitor/core");
    const plugin = registerPlugin<LiquidChromePlugin>("LiquidChrome");
    const info = await plugin.info();
    if (!info?.available) return null;
    return { plugin, info };
  } catch {
    return null;
  }
}
