/**
 * Harita Tools GNSS Pos Studio - Service Worker
 * Offline-first static asset caching and network fallback
 */

const CACHE_NAME = 'gnss-pos-studio-v2';
const PRECACHE_ASSETS = [
  './',
  'index.html',
  'css/foundation.css',
  'css/components.css',
  'css/layout.css',
  'css/responsive-theme.css',
  'css/core.css',
  'js/app.bundle.js',
  'data/epsg_registry.json',
  'data/hgmDatumDatabase.json',
  'data/drone_sensors.json',
  'data/locales/tr.json',
  'data/locales/en.json',
  'vendor/leaflet/leaflet.css',
  'vendor/leaflet/leaflet.js',
  'vendor/fontawesome/css/all.min.css',
  'vendor/jszip/jszip.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache partial fail (non-critical):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip non-GET requests and tile servers
  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);

  // For external tile servers / OSM, let network handle without aggressive caching
  if (url.origin !== self.location.origin && !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, but optionally revalidate in background
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If offline and request is HTML, fallback to index
          if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
            return caches.match('index.html');
          }
        });
    })
  );
});
