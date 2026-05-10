// ============================================================
//  WASSOU SERVICE WORKER v2.2 — avec Agent IA + Nexus
// ============================================================
const CACHE_NAME = 'wassou-v2-2';
const ASSETS = [
  './', './index.html', './login.html',
  './dashboard-admin.html', './dashboard-agent.html',
  './clients.html', './client-detail.html', './agents.html',
  './interventions.html', './sms.html', './devis.html',
  './rapports.html', './parametres.html', './agent-ia.html',
  './manifest.json', './config.js',
  './css/style.css',
  './js/app.js', './js/auth.js', './js/data.js', './js/payment.js', './js/nexus-secret.js',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(ASSETS.map(a => cache.add(a)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  // Ne JAMAIS cacher nexus-panel (zone sensible, toujours fraîche)
  if (url.pathname.endsWith('nexus-panel.html')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
  );
});

// Push notifications (pour alertes Nexus)
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
