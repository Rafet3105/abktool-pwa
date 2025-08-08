const CACHE_NAME = 'abktool-v1';
const OFFLINE_URL = '/offline.html';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // statische assets, passe an falls du andere Dateinamen hast:
  '/favicon.webp',
  // optional: CSS/JS-Dateien des Projekts
];

// Install: cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn('Some assets failed to cache', err));
    }).then(() => self.skipWaiting())
  );
});

// Activate: cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

// Fetch: respond from cache, otherwise network, otherwise fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cachedResp => {
      if (cachedResp) return cachedResp;
      return fetch(event.request).then(networkResp => {
        // optional: cache new resources dynamically
        return networkResp;
      }).catch(() => {
        // If request is for a navigation page, show offline fallback (simple text or local page)
        if (event.request.mode === 'navigate') {
          return new Response('<!doctype html><meta charset="utf-8"><title>Offline</title><body style="font-family:Arial;padding:20px;">Du bist offline. Bitte prüfe deine Verbindung.</body></html>', {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      });
    })
  );
});
