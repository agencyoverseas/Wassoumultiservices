// ============================================================
// WASSOU MULTISERVICES — SERVICE WORKER
// ============================================================
const CACHE_NAME = 'wassou-v1';
const ASSETS = [
  './',
  './index.html',
  './clients.html',
  './agents.html',
  './interventions.html',
  './sms.html',
  './devis.html',
  './rapports.html',
  './css/style.css',
  './js/app.js',
  './js/data.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install : pré-cache des fichiers essentiels
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('[SW] Some assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate : nettoie les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : stratégie network-first, fallback cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre à jour le cache avec la nouvelle version
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
  );
});
