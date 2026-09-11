/**
 * Harita Tools GNSS Pos Studio - Service Worker
 * Network-First (Online First) with Offline Fallback Strategy
 * 
 * Bu strateji sayesinde:
 * 1. Sunucu çalışırken ve online iken (F5 dahil) her zaman en güncel dosyalar diskten/ağdan yüklenir.
 * 2. Ağ bağlantısı kesildiğinde (çevrimdışı/offline) önbellekten kesintisiz hizmet verilir.
 * 3. Yeni sürüm derlendiğinde eski önbellekler anında silinir.
 */

const CACHE_NAME = 'gnss-pos-studio-v1789145390775';
const PRECACHE_ASSETS = [
  './',
  'index.html',
  'css/foundation.css',
  'css/components.css',
  'css/layout.css',
  'css/responsive-theme.css',
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
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache partial fail (non-critical):', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[ServiceWorker] Eski önbellek siliniyor:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Sadece GET isteklerini işle
  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);

  // Harici tile sunucuları (OSM, Google, Carto vb.) için tarayıcı doğrudan yönetsin
  if (url.origin !== self.location.origin && !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
    return;
  }

  // Network-First (Önce Ağ, Çevrimdışı İse Önbellek)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Ağ hatası veya çevrimdışı (offline) modda önbellekten yanıt ver
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Eğer sayfa gezintisi ise index.html fallback ver
          if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
            return caches.match('index.html');
          }
        });
      })
  );
});
