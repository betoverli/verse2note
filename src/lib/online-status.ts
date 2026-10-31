/**
 * Reliable online/offline for the website and the Capacitor iOS shell.
 *
 * `navigator.onLine` alone is not trustworthy in WKWebView — it can stay
 * false while Wi‑Fi works (and the hosted page already loaded). The banner
 * must not appear for a single failed API/auth call either.
 *
 * Rules:
 * - Start optimistic (online) — never seed from navigator.onLine.
 * - Hide immediately on the `online` event.
 * - Only flip to offline after confirmed probe failures to a same-origin
 *   static asset (not /api/* or auth).
 * - A successful probe always restores online.
 */

export type OnlineListener = (online: boolean) => void;

const PROBE_PATH = "/robots.txt";
/** Failures needed when navigator.onLine still claims online. */
const FAIL_WHEN_CLAIMING_ONLINE = 3;
/** Failures needed after an `offline` event / navigator.onLine === false. */
const FAIL_WHEN_CLAIMING_OFFLINE = 2;
const PROBE_MS = 4_000;

let online = true;
let fails = 0;
let timer = 0;
let probing = false;
let started = false;
const listeners = new Set<OnlineListener>();

function emit() {
  listeners.forEach((listener) => listener(online));
}

function setOnline(next: boolean) {
  if (online === next) return;
  online = next;
  if (next) fails = 0;
  emit();
}

async function probeOnce(): Promise<boolean> {
  if (typeof window === "undefined" || typeof fetch !== "function") return true;
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const kill = window.setTimeout(() => ctrl?.abort(), PROBE_MS);
  try {
    const response = await fetch(`${PROBE_PATH}?_online=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
      credentials: "omit",
      signal: ctrl?.signal,
    });
    // Any HTTP response means the network path works.
    void response;
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(kill);
  }
}

function threshold() {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return FAIL_WHEN_CLAIMING_OFFLINE;
  return FAIL_WHEN_CLAIMING_ONLINE;
}

async function runProbe() {
  if (probing) return;
  probing = true;
  try {
    if (await probeOnce()) {
      fails = 0;
      setOnline(true);
      return;
    }
    fails += 1;
    if (fails >= threshold()) setOnline(false);
  } finally {
    probing = false;
  }
}

function schedule(ms: number) {
  if (typeof window === "undefined") return;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    void runProbe();
  }, ms);
}

function onBrowserOnline() {
  fails = 0;
  setOnline(true);
}

function onBrowserOffline() {
  // Confirm — do not flip the banner on a lone event.
  schedule(250);
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  online = true;
  window.addEventListener("online", onBrowserOnline);
  window.addEventListener("offline", onBrowserOffline);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") schedule(500);
  });
  // Quiet background check; never show the banner from the initial read.
  schedule(8_000);
}

export function getOnlineStatus() {
  return online;
}

export function subscribeOnlineStatus(listener: OnlineListener) {
  start();
  listeners.add(listener);
  listener(online);
  return () => {
    listeners.delete(listener);
  };
}

/** Test helper — reset module state between unit tests. */
export function __resetOnlineStatusForTests() {
  online = true;
  fails = 0;
  probing = false;
  started = false;
  listeners.clear();
  if (typeof window !== "undefined") window.clearTimeout(timer);
  timer = 0;
}
