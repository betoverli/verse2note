const CACHE = "verse2note-v2";

const PRECACHE = [
  "/",
  "/app",
  "/collections",
  "/reading",
  "/profile",
  "/about",
  "/for-ai",
  "/llms.txt",
  "/skill.md",
  "/robots.txt",
  "/favicon.svg",
  "/icon-180.png",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.webmanifest",
  "/fonts/cormorant-italic-500-latin.woff2",
  "/fonts/cormorant-italic-500-latin-ext.woff2",
  "/fonts/cormorant-normal-500-latin.woff2",
  "/fonts/cormorant-normal-500-latin-ext.woff2",
  "/fonts/outfit-normal-400-latin.woff2",
  "/fonts/outfit-normal-400-latin-ext.woff2",
  "/apps/youversion.png",
  "/apps/tecarta.png",
  "/apps/logos.png",
  "/apps/olive-tree.png",
  "/apps/bible-gateway.png",
  "/apps/blue-letter.png",
  "/apps/esv.png",
  "/apps/biblia-online.svg",
  "/apps/bible-hub.png",
  "/apps/accordance.png",
  "/apps/e-sword.png",
  "/apps/mysword.png",
  "/apps/jw-library.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          return (await caches.match("/app")) || (await caches.match("/"));
        }
        return Response.error();
      }),
  );
});
