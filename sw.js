// ============================================================
// WASSOU MOBILE — SERVICE WORKER
// ============================================================
const CACHE = 'wassou-mobile-v6';
const ASSETS = [
  './',
  './index.html',
  './login.html',
  './dashboard.html',
  './clients.html',
  './client-detail.html',
  './agents.html',
  './interventions.html',
  './intervention-detail.html',
  './sms.html',
  './devis.html',
  './facture-view.html',
  './paiements.html',
  './carte-fidelite.html',
  './rapports.html',
  './agent-ia.html',
  './parametres.html',
  './nexus.html',
  './manifest.json',
  './css/app.css',
  './js/app.js',
  './js/auth.js',
  './js/data.js',
  './js/fidelite.js',
  './js/pdf-facture.js',
  './js/pull-refresh.js',
  './js/whatsapp.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(a => c.add(a))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  // HTML : network-first
  if (e.request.mode === 'navigate' || (e.request.headers.get('accept')||'').includes('text/html')){
    e.respondWith(
      fetch(e.request)
        .then(r => { const cl = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cl)); return r; })
        .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Assets : cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
      const cl = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cl));
      return r;
    }))
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
