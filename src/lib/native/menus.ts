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

export type NativeMenuStyle = "menu" | "sheet" | "alert" | "prompt";

export type NativeMenuRequest = {
  style?: NativeMenuStyle;
  title?: string;
  message?: string;
  cancelLabel?: string;
  /** Label for the primary button on alert/prompt (defaults to first item / OK). */
  okLabel?: string;
  /** Placeholder for prompt text field. */
  placeholder?: string;
  /** Initial value for prompt text field. */
  defaultValue?: string;
  appearance?: "light" | "dark";
  anchor?: NativeMenuAnchor | null;
  items: NativeMenuItem[];
};

export type NativeMenuResult = {
  id: string | null;
  cancelled: boolean;
  /** Prompt text when style is `"prompt"`. */
  value?: string;
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

type PluginListenerHandle = { remove: () => void | Promise<void> };

type NativeMenusPlugin = {
  available(): Promise<NativeMenusInfo>;
  present(options: {
    style: NativeMenuStyle;
    title?: string;
    message?: string;
    cancelLabel?: string;
    okLabel?: string;
    placeholder?: string;
    defaultValue?: string;
    appearance?: "light" | "dark";
    anchor: NativeMenuAnchor;
    items: NativeMenuItem[];
  }): Promise<NativeMenuResult & { replaced?: boolean }>;
  dismiss(): Promise<void>;
  addListener?(event: "presented", cb: () => void): Promise<PluginListenerHandle>;
};

let pluginPromise: Promise<NativeMenusPlugin | null> | null = null;
let infoPromise: Promise<NativeMenusInfo | null> | null = null;

/** Probe / connect budget — never block the UI on a silent native hang. */
const AVAILABLE_TIMEOUT_MS = 800;
/**
 * If native never confirms presentation (listener or early settle), fall back
 * to the web sheet. Long enough for a real UIAlertController to appear; short
 * enough that a silent failure never leaves a blank screen.
 */
export const PRESENTATION_CONFIRM_MS = 500;
/**
 * ActionSheet / speaker hard fallback if `presentNativeMenu` never returns
 * and never fires `onPresented`. Slightly above PRESENTATION_CONFIRM_MS.
 * Cleared as soon as native confirms presentation so a visible sheet waiting
 * on the user is never covered by a premature web sheet.
 */
export const FORCE_WEB_FALLBACK_MS = PRESENTATION_CONFIRM_MS + 250;
/**
 * Safety net if native `present` never settles after it was shown.
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

function isUnimplemented(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /UNIMPLEMENTED|not implemented|is not implemented|plugin.*not.*found/i.test(message);
}

/**
 * Classify a settled native present() result.
 * Pure — unit-tested. A cancel without a confirmed presentation is a failure
 * (phantom cancel / silent drop), not a user dismiss — callers must open web UI.
 */
export function classifyPresentOutcome(input: {
  presented: boolean;
  result?: NativeMenuResult & { replaced?: boolean };
  error?: unknown;
}): NativeMenuResult {
  if (input.error != null) {
    return { id: null, cancelled: true, failed: true };
  }
  const result = input.result;
  if (!result) {
    return { id: null, cancelled: true, failed: true };
  }
  if (result.replaced) {
    return { id: null, cancelled: true, failed: true };
  }
  if (result.cancelled || !result.id) {
    // UI never appeared → not a real user cancel.
    if (!input.presented) {
      return { id: null, cancelled: true, failed: true, value: result.value };
    }
    return { id: null, cancelled: true, value: result.value };
  }
  return { id: result.id, cancelled: false, value: result.value };
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

async function removeListener(handle: PluginListenerHandle | null | undefined) {
  try {
    await handle?.remove();
  } catch {
    /* ignore */
  }
}

export type PresentNativeMenuOptions = {
  /** Fires when native confirms the sheet is on screen (cancel hard web timers). */
  onPresented?: () => void;
};

/**
 * Present a native menu. On plugin errors / hang / no presentation within
 * ~500ms, returns `{ failed: true }` so callers can open the web UI instead
 * of swallowing the tap.
 */
export async function presentNativeMenu(
  request: NativeMenuRequest,
  options?: PresentNativeMenuOptions,
): Promise<NativeMenuResult> {
  const plugin = await connect();
  if (!plugin) {
    console.warn("[NativeMenus] present skipped — plugin missing");
    return { id: null, cancelled: true, failed: true };
  }
  const anchor = request.anchor ?? rectFromElement(null);
  console.log("[NativeMenus] present", {
    style: request.style ?? "menu",
    items: request.items.length,
    anchor,
  });

  let presented = false;
  const markPresented = () => {
    if (presented) return;
    presented = true;
    console.log("[NativeMenus] presented event");
    try {
      options?.onPresented?.();
    } catch (error) {
      console.warn("[NativeMenus] onPresented callback failed", error);
    }
  };

  // NEVER await addListener before present — that hang left TF85 blank.
  let listener: PluginListenerHandle | null = null;
  const listenerReady =
    typeof plugin.addListener === "function"
      ? plugin
          .addListener("presented", markPresented)
          .then((handle) => {
            listener = handle;
          })
          .catch((error) => {
            console.warn("[NativeMenus] addListener(presented) failed", error);
          })
      : Promise.resolve();

  // Race: give the listener a brief head start, but never block present on it.
  await Promise.race([listenerReady, new Promise<void>((r) => setTimeout(r, 50))]);

  const presentPromise = plugin.present({
    style: request.style ?? "menu",
    title: request.title,
    message: request.message,
    cancelLabel: request.cancelLabel,
    okLabel: request.okLabel,
    placeholder: request.placeholder,
    defaultValue: request.defaultValue,
    appearance: request.appearance ?? readAppearance(),
    anchor,
    items: request.items,
  });

  // Watchdog: if nothing confirms presentation quickly, abort for web fallback.
  const confirmed = await new Promise<"presented" | "settled" | "timeout">((resolve) => {
    let done = false;
    const finish = (value: "presented" | "settled" | "timeout") => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      window.clearInterval(poll);
      resolve(value);
    };
    const timer = window.setTimeout(() => finish("timeout"), PRESENTATION_CONFIRM_MS);
    const poll = window.setInterval(() => {
      if (presented) finish("presented");
    }, 32);
    presentPromise.then(
      () => finish("settled"),
      () => finish("settled"),
    );
  });

  if (confirmed === "timeout" && !presented) {
    console.warn("[NativeMenus] presentation not confirmed in time — web fallback");
    try {
      await plugin.dismiss();
    } catch {
      /* already gone */
    }
    await removeListener(listener);
    void presentPromise.catch(() => {});
    return { id: null, cancelled: true, failed: true };
  }

  if (presented) markPresented();

  try {
    const result = await withTimeout(presentPromise, PRESENT_HANG_TIMEOUT_MS, "native-menu-present-timeout");
    console.log("[NativeMenus] present resolved", { result, presented });
    await removeListener(listener);
    const outcome = classifyPresentOutcome({ presented, result });
    if (outcome.failed) {
      console.warn("[NativeMenus] present settled without UI — web should fall back", result);
    }
    return outcome;
  } catch (error) {
    console.warn("[NativeMenus] present failed — web should fall back", error);
    try {
      await plugin.dismiss();
    } catch {
      /* already gone */
    }
    await removeListener(listener);
    if (isUnimplemented(error)) {
      infoPromise = null;
    }
    return classifyPresentOutcome({ presented, error });
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

/** Centered confirm / multi-button alert. Returns selected id, `null` on cancel, or `{ failed: true }`. */
export async function presentNativeAlert(input: {
  title?: string;
  message?: string;
  cancelLabel: string;
  okLabel?: string;
  items?: NativeMenuItem[];
  anchor?: NativeMenuAnchor | null;
}): Promise<NativeMenuResult> {
  if (!(await canUseNativeMenus())) return { id: null, cancelled: true, failed: true };
  return presentNativeMenu({
    style: "alert",
    title: input.title,
    message: input.message,
    cancelLabel: input.cancelLabel,
    okLabel: input.okLabel,
    anchor: input.anchor ?? rectFromElement(null),
    items: input.items ?? (input.okLabel ? [{ id: "ok", title: input.okLabel }] : []),
  });
}

/** Text-field prompt. Returns trimmed value, `null` on cancel, or failed. */
export async function presentNativePrompt(input: {
  title?: string;
  message?: string;
  cancelLabel: string;
  okLabel: string;
  placeholder?: string;
  defaultValue?: string;
  anchor?: NativeMenuAnchor | null;
}): Promise<{ value: string | null; failed?: boolean; cancelled?: boolean }> {
  if (!(await canUseNativeMenus())) return { value: null, failed: true };
  const result = await presentNativeMenu({
    style: "prompt",
    title: input.title,
    message: input.message,
    cancelLabel: input.cancelLabel,
    okLabel: input.okLabel,
    placeholder: input.placeholder,
    defaultValue: input.defaultValue,
    anchor: input.anchor ?? rectFromElement(null),
    items: [{ id: "ok", title: input.okLabel }],
  });
  if (result.failed) return { value: null, failed: true };
  if (result.cancelled || result.id !== "ok") return { value: null, cancelled: true };
  return { value: (result.value ?? "").trim() };
}
