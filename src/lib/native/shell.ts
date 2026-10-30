import { classifyLink, isNativeApp } from "@/lib/native/runtime";

let started = false;

async function openExternal(url: string) {
  const { registerPlugin } = await import("@capacitor/core");
  const native = registerPlugin<{ open(options: { url: string }): Promise<void> }>("NativeAuth");
  await native.open({ url });
}

function onClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (anchor.hasAttribute("download")) return;
  const href = anchor.href;
  if (!href) return;
  if (classifyLink(href, anchor.target, window.location.href) !== "external") return;
  event.preventDefault();
  event.stopPropagation();
  void openExternal(href);
}

function installLinkCapture() {
  document.addEventListener("click", onClick, true);
  const original = window.open.bind(window);
  window.open = (url?: string | URL, target?: string, features?: string) => {
    if (url != null) {
      const href = String(url);
      if (classifyLink(href, target || "_blank", window.location.href) === "external") {
        void openExternal(href);
        return null;
      }
    }
    return original(url as string | URL | undefined, target, features);
  };
}

async function bootChrome() {
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setOverlaysWebView({ overlay: true });
    const apply = () => {
      const dark = document.documentElement.classList.contains("dark");
      void StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => undefined);
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  } catch {
    /* status bar styling is optional */
  }
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    // Cut with no fade so LaunchScreen → web SplashScreen stays visually identical.
    await SplashScreen.hide({ fadeOutDuration: 0 });
  } catch {
    /* splash hides itself */
  }
  try {
    const { installPushListeners } = await import("@/lib/native/push");
    await installPushListeners();
  } catch {
    /* push is optional until the person turns it on */
  }
}

/** Install native behaviors once. No-op in a normal browser. */
export function installNativeShell() {
  if (started || !isNativeApp()) return;
  started = true;
  installLinkCapture();
  void bootChrome();
}

export async function resumeNativePushIfNeeded() {
  if (!isNativeApp()) return;
  const { resumeNativePush } = await import("@/lib/native/push");
  await resumeNativePush();
}
