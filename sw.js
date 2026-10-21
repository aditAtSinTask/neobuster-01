'use strict';
// The service worker that makes NEOBUSTER an installable app (see js/core/pwa.js) that also plays offline. Every file
// of the game comes from the network first, so an update shows up at once, and the copy kept here is used when there
// is no connection. On install it keeps the page, the manifest, the icons and every script index.html loads (read from
// the page itself, so new scripts are kept without listing them here). The songs in music/ are kept as the game fetches
// them (all of them, in the background, the first time it is played). The Cloud Save API is never cached.

const CACHE = 'neobuster';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE),
        html = await (await fetch('index.html', { cache: 'no-cache' })).text(),
        scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
      await cache.addAll([...FILES, ...scripts]);
      await self.skipWaiting();
    })(),
  );
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      // offline: the kept copy; a page with none falls back to the game, anything else (a song not kept yet) fails, so
      // the game can play its own instead
      .catch(
        async () =>
          (await caches.match(req, { ignoreSearch: true })) ||
          (req.mode === 'navigate' ? caches.match('./') : Response.error()),
      ),
  );
});
