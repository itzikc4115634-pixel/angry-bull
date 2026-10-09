// השור הזועם: keeps the game on the phone so it opens fast and plays offline.
// The game itself is fetched fresh when there is a connection (so updates arrive on the next open),
// and the saved copy is used when there is none, or when the network is slow.
const CACHE = 'angry-bull-v3';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function keep(req, res) {
  if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
  return res;
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    const net = fetch(req).then(res => keep(req, res));
    const saved = caches.match(req, { ignoreSearch: true }).then(m => m || (req.mode === 'navigate' ? caches.match('index.html') : undefined));
    // the fresh copy, unless it takes more than a few seconds and a saved one exists
    e.respondWith(new Promise(resolve => {
      let done = false;
      const timer = setTimeout(() => saved.then(m => { if (m && !done) { done = true; resolve(m); } }), 3000);
      net.then(res => { if (!done) { done = true; clearTimeout(timer); resolve(res); } })
        .catch(() => saved.then(m => { if (!done) { done = true; clearTimeout(timer); resolve(m || Response.error()); } }));
    }));
  } else if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    // the fonts: the saved copy first
    e.respondWith(caches.match(req).then(m => m || fetch(req).then(res => keep(req, res))));
  }
});
