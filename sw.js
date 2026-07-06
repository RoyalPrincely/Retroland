const CACHE_NAME = 'retroland-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './retroland.jpeg'
];

// Force immediate caching during installation
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Intercept asset requests to serve them directly from the local cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
