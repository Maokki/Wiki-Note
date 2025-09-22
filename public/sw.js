const CACHE_NAME = 'wikinotes-v1';
const urlsToCache = [
  '/',
  '/src/main.ts',
  '/src/App.vue',
  '/src/style.css',
  '/favicon.ico',
  '/manifest.json',
  '/public/icons/maomao_icon-192.png',
  '/public/icons/maomao_icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
