self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('msikaonline-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/styles.css',
                '/scripts.js',
                '/images/icon-192.png',
                '/images/icon-512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});￼Enter
