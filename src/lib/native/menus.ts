/**
 * Native iOS menus (UIMenu / UIAlertController) for the Capacitor shell.
 * Safe to import from the website: nothing talks to Capacitor unless
 * `isNativeApp()` is true.
 */
import { isNativeApp } from "./runtime.ts";

export type NativeMenuItem = {
  id: string;
  title: string;
  /** SF Symbol name, e.g. `trash`, `checkmark`. */
  symbol?: string;
  destructive?: boolean;
  checked?: boolean;
  disabled?: boolean;
  children?: NativeMenuItem[];
};

export type NativeMenuAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type NativeMenuStyle = "menu" | "sheet";

export type NativeMenuRequest = {
  style?: NativeMenuStyle;
  title?: string;
  message?: string;
  cancelLabel?: string;
  appearance?: "light" | "dark";
  anchor?: NativeMenuAnchor | null;
  items: NativeMenuItem[];
};

export type NativeMenuResult = {
  id: string | null;
  cancelled: boolean;
  /**
   * Plugin missing, threw, timed out, or native presentation failed.
   * Callers should fall back to the web menu when this is true — do not treat
   * it as a user dismiss.
   */
  failed?: boolean;
};

export type NativeMenusInfo = {
  available: boolean;
  glass: boolean;
  major: number;
};

type NativeMenusPlugin = {
  available(): Promise<NativeMenusInfo>;
  present(options: {
    style: NativeMenuStyle;
    title?: string;
    message?: string;
    cancelLabel?: string;
    appearance?: "light" | "dark";
    anchor: NativeMenuAnchor;
    items: NativeMenuItem[];
  }): Promise<NativeMenuResult>;
  dismiss(): Promise<void>;
};

let pluginPromise: Promise<NativeMenusPlugin | null> | null = null;
let infoPromise: Promise<NativeMenusInfo | null> | null = null;

/** Probe / connect budget — never block the UI on a silent native hang. */
const AVAILABLE_TIMEOUT_MS = 1500;
/**
 * Safety net if native `present` never settles (menu never shown and never
 * rejected). Far longer than a real presentation so an open menu is not
 * interrupted; short enough that a hung promise recovers in-session.
 */
const PRESENT_HANG_TIMEOUT_MS = 12_000;

function readAppearance(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(label)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** CSS viewport rect → plugin anchor (1:1 with the WKWebView when scale is 1). */
export function rectFromElement(el: Element | null | undefined): NativeMenuAnchor {
  if (!el || typeof el.getBoundingClientRect !== "function") {
    const width = typeof window !== "undefined" ? window.innerWidth : 320;
    const height = typeof window !== "undefined" ? window.innerHeight : 568;
    return { x: width / 2 - 22, y: height / 2 - 22, width: 44, height: 44 };
  }
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: Math.max(1, rect.width),
    height: Math.max(1, rect.height),
  };
}

export function rectFromPoint(x: number, y: number, size = 44): NativeMenuAnchor {
  return { x: x - size / 2, y: y - size / 2, width: size, height: size };
}

async function connect(): Promise<NativeMenusPlugin | null> {
  if (typeof window === "undefined") return null;
  if (!isNativeApp()) return null;
  if (!pluginPromise) {
    pluginPromise = (async () => {
      try {
        const { registerPlugin } = await import("@capacitor/core");
        return registerPlugin<NativeMenusPlugin>("NativeMenus");
      } catch {
        return null;
      }
    })();
  }
  return pluginPromise;
}

export async function nativeMenusInfo(): Promise<NativeMenusInfo | null> {
  if (!isNativeApp()) return null;
  if (!infoPromise) {
    infoPromise = (async () => {
      const plugin = await connect();
      if (!plugin) return null;
      try {
        const info = await withTimeout(plugin.available(), AVAILABLE_TIMEOUT_MS, "native-menus-available-timeout");
        return info?.available ? info : null;
      } catch {
        // Allow a later tap to retry after a failed/hung probe.
        infoPromise = null;
        return null;
      }
    })();
  }
  return infoPromise;
}

/** True only inside the Capacitor iOS app when the NativeMenus plugin answers. */
export async function canUseNativeMenus(): Promise<boolean> {
  return (await nativeMenusInfo()) != null;
}

/**
 * Present a native menu. On plugin errors / hang, returns `{ failed: true }`
 * so callers can open the existing web UI instead of swallowing the tap.
 */
export async function presentNativeMenu(request: NativeMenuRequest): Promise<NativeMenuResult> {
  const plugin = await connect();
  if (!plugin) return { id: null, cancelled: true, failed: true };
  const anchor = request.anchor ?? rectFromElement(null);
  try {
    const result = await withTimeout(
      plugin.present({
        style: request.style ?? "menu",
        title: request.title,
        message: request.message,
        cancelLabel: request.cancelLabel,
        appearance: request.appearance ?? readAppearance(),
        anchor,
        items: request.items,
      }),
      PRESENT_HANG_TIMEOUT_MS,
      "native-menu-present-timeout",
    );
    if (result?.cancelled || !result?.id) {
      return { id: null, cancelled: true };
    }
    return { id: result.id, cancelled: false };
  } catch {
    try {
      await plugin.dismiss();
    } catch {
      /* already gone */
    }
    return { id: null, cancelled: true, failed: true };
  }
}

export async function dismissNativeMenu(): Promise<void> {
  const plugin = await connect();
  if (!plugin) return;
  try {
    await plugin.dismiss();
  } catch {
    /* already gone */
  }
}

/** Pick one option through a native menu when available; otherwise `null` (caller keeps the web UI). */
export async function pickNativeOption(input: {
  title?: string;
  anchor: NativeMenuAnchor;
  options: NativeMenuItem[];
}): Promise<string | null> {
  if (!(await canUseNativeMenus())) return null;
  const result = await presentNativeMenu({
    style: "menu",
    title: input.title,
    anchor: input.anchor,
    items: input.options,
  });
  if (result.failed || result.cancelled) return null;
  return result.id;
}
