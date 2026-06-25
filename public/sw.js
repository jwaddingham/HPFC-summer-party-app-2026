const STATIC_CACHE = 'hpfc-static-v2';
const PAGE_CACHE = 'hpfc-public-pages-v2';
const PUBLIC_DATA_CACHE = 'hpfc-public-data-v2';

const PRECACHE_URLS = ['/', '/offline.html'];

const OFFLINE_FALLBACK = new Response(
  '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title></head><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1a1a1a;color:#fff;text-align:center;padding:20px"><div><h1>You are offline</h1><p style="color:#ccc">Reconnect to load the latest tournament data.</p><div style="display:flex;flex-direction:column;gap:12px;margin-top:16px"><button onclick="location.reload()" style="padding:12px 24px;background:#dc2626;color:#fff;border:none;font-size:16px;font-weight:bold;cursor:pointer">Try Again</button><a href="/" style="padding:12px 24px;background:#404040;color:#fff;font-size:16px;font-weight:bold;text-decoration:none">Go Home</a></div></div></body></html>',
  { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/html' } },
);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  const expectedCaches = new Set([STATIC_CACHE, PAGE_CACHE, PUBLIC_DATA_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.map((cacheName) => (expectedCaches.has(cacheName) ? undefined : caches.delete(cacheName)))),
      )
      .then(() => self.clients.claim()),
  );
});

function isSameOriginGet(request) {
  return request.method === 'GET' && new URL(request.url).origin === self.location.origin;
}

function isPublicTournamentApi(request) {
  if (!isSameOriginGet(request)) return false;
  return new URL(request.url).pathname.startsWith('/api/tournament/');
}

function isPublicNavigation(request) {
  if (!isSameOriginGet(request) || request.mode !== 'navigate') return false;
  return !new URL(request.url).pathname.startsWith('/admin');
}

function isStaticAsset(request) {
  if (!isSameOriginGet(request)) return false;
  return ['font', 'image', 'manifest', 'script', 'style'].includes(request.destination);
}

async function cacheResponse(cacheName, request, response) {
  if (!response || response.status !== 200 || response.type === 'error') return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

function staleWhileRevalidate(event) {
  const request = event.request;
  return caches.open(PUBLIC_DATA_CACHE).then(async (cache) => {
    const cached = await cache.match(request);
    const update = fetch(request)
      .then((response) => {
        if (response.ok) {
          return cache.put(request, response.clone()).then(() => response);
        }
        return response;
      })
      .catch(() => null);
    event.waitUntil(update.then(() => undefined));

    if (cached) {
      return cached;
    }

    const response = await update;
    return response || new Response(JSON.stringify({ error: 'Tournament data is unavailable offline.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    await cacheResponse(PAGE_CACHE, request, response);
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || (await caches.match('/offline.html')) || OFFLINE_FALLBACK.clone();
  }
}

async function cacheFirstAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  await cacheResponse(STATIC_CACHE, request, response);
  return response;
}

self.addEventListener('fetch', (event) => {
  if (isPublicTournamentApi(event.request)) {
    event.respondWith(staleWhileRevalidate(event));
    return;
  }

  if (isPublicNavigation(event.request)) {
    event.respondWith(networkFirstPage(event.request));
    return;
  }

  if (isStaticAsset(event.request)) {
    event.respondWith(cacheFirstAsset(event.request));
  }
});
