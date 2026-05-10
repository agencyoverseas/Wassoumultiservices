// ============================================================
//  WASSOU — Service Worker v2 (PWA offline)
// ============================================================
const CACHE = 'wassou-v2.0.0';
const ASSETS = [
  './',
  './index.html',
  './login.html',
  './dashboard-admin.html',
  './dashboard-agent.html',
  './clients.html',
  './client-detail.html',
  './agents.html',
  './interventions.html',
  './sms.html',
  './devis.html',
  './devis-create.html',
  './paiements.html',
  './rapports.html',
  './parametres.html',
  './css/style.css',
  './config.js',
  './js/app.js',
  './js/auth.js',
  './js/data.js',
  './js/payment.js',
  './js/pwa-install.js',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => null))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Stratégie : Network-first pour HTML (frais), Cache-first pour le reste
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHTML = req.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(c => c || caches.match('./index.html')))
    );
  } else {
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        if (res.ok && url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached))
    );
  }
});
