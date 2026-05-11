// ============================================================
//  WASSOU SERVICE WORKER v3.0 — Mode application stricte
//  - Cache toutes les ressources
//  - Navigate fallback → index.html (pas d'écran navigateur web)
//  - Strategy: network-first pour HTML, cache-first pour assets
// ============================================================
const CACHE_NAME = 'wassou-v3-0';
const ASSETS = [
  './', './index.html', './login.html',
  './dashboard-admin.html', './dashboard-agent.html',
  './clients.html', './client-detail.html', './agents.html',
  './interventions.html', './sms.html', './devis.html', './paiements.html',
  './rapports.html', './parametres.html', './agent-ia.html',
  './manifest.json', './config.js',
  './css/style.css',
  './js/app.js', './js/auth.js', './js/data.js', './js/data-bridge.js',
  './js/payment.js', './js/nexus-secret.js', './js/sidebar.js',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png'
];

// ── INSTALL : précache ──────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(ASSETS.map(a => cache.add(a)))
    )
  );
  self.skipWaiting();
});

// ── ACTIVATE : nettoyer anciens caches ──────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH : stratégie hybride pour mode app stable ──────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('nexus-panel.html')) return;

  // Navigation HTML → network-first avec fallback cache puis index
  if (event.request.mode === 'navigate' ||
      (event.request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request)
          .then(r => r || caches.match('./index.html'))
        )
    );
    return;
  }

  // Assets statiques → cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => cached);
    })
  );
});

// ── NOTIFICATIONS PUSH ──────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Wassou', {
      body: data.body || '',
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      tag: data.tag || 'wassou-notif',
      data: data.url ? { url: data.url } : null,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});

// Message handler pour skipWaiting depuis l'app
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
