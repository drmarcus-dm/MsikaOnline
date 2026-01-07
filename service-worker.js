const CACHE_NAME = 'msikaonline-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/styles.css',
  '/scripts.js',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Take control of all open clients as soon as possible
      self.clients.claim(),
      // Delete old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Clone the response as it's a stream
        const responseClone = networkResponse.clone();

        // Cache the new response for future requests
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return networkResponse;
      }).catch(() => {
        // Optional: Return a fallback if offline and no cache match
        // For example, for navigation requests:
        if (event.request.mode === 'navigate') {
          return new Response('<h1>Offline</h1><p>You are offline. Please check your connection.</p>', {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      });
    })
  );
});
