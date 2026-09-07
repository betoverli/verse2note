export function isAppleUa(ua = typeof navigator === "undefined" ? "" : navigator.userAgent) {
  return /iPhone|iPad|iPod/i.test(ua) || (typeof navigator !== "undefined" && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
