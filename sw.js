/* Futsal app: keeps a copy of the app so it opens instantly and works on poor signal.
   App files are fetched fresh when online (so updates arrive straight away) and the
   saved copy is used when offline. Squad data from Supabase is never cached here. */
var CACHE = 'futsal-v8';
var SHELL = ['./', './index.html', './admin.html', './style.css', './app.js', './config.js', './manifest.webmanifest', './manifest-coach.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png', './logo.jpg'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (/supabase\.co$/.test(url.hostname)) return;
  var cdn = /fonts\.(googleapis|gstatic)\.com$|cdn\.jsdelivr\.net$/.test(url.hostname);
  if (url.origin !== self.location.origin && !cdn) return;
  if (cdn) {
    e.respondWith(caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) { if (res && (res.ok || res.type === 'opaque')) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); } return res; }).catch(function () { return hit; });
      return hit || net;
    }));
    return;
  }
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match(req.mode === 'navigate' && /admin/.test(url.pathname) ? './admin.html' : './index.html'); });
  }));
});
