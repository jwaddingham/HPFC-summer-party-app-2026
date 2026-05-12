// Service Worker for HPFC Tournament App
const CACHE_NAME = 'hpfc-tournament-v1';
const urlsToCache = [
  '/',
  '/offline.html'
];

const OFFLINE_FALLBACK = new Response(
  '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title></head><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1a1a1a;color:#fff;text-align:center;padding:20px"><div><h1>You\'re offline</h1><p style="color:#ccc">Check your connection and try again.</p><button onclick="location.reload()" style="margin-top:16px;padding:12px 24px;background:#dc2626;color:#fff;border:none;font-size:16px;font-weight:bold;cursor:pointer">Try Again</button></div></body></html>',
  { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/html' } }
);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // For navigation requests, use network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline.html').then(r => r || OFFLINE_FALLBACK.clone()))
    );
    return;
  }

  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          // Clone the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
      .catch(() => OFFLINE_FALLBACK.clone())
  );
});
