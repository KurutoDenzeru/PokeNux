// Service Worker for PokeNuxt
const CACHE_NAME = 'pokenuxt-cache-v1';
const urlsToCache = [
    '/',
    '/favicon.ico',
    '/rotom.avif',
    '/pokeapi.avif',
    '/sitemap.avif',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    // For API requests, use network first, then cache
    if (event.request.url.includes('pokeapi.co') || event.request.url.includes('pokemontcg.io')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Clone the response to store in cache
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            // Add response to cache with expiration (24 hours)
                            cache.put(event.request, responseToCache);

                            // Clean old cached API responses
                            cleanupOldCaches();
                        });

                    return response;
                })
                .catch(() => {
                    // If network fails, try to get from cache
                    return caches.match(event.request);
                })
        );
    } else {
        // For static assets, use cache first, then network
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    return response || fetch(event.request);
                })
        );
    }
});

// Clean up old cached API responses (older than 24 hours)
function cleanupOldCaches() {
    caches.open(CACHE_NAME).then(cache => {
        cache.keys().then(keys => {
            for (const request of keys) {
                if (request.url.includes('pokeapi.co') || request.url.includes('pokemontcg.io')) {
                    cache.match(request).then(response => {
                        if (response) {
                            const fetchDate = response.headers.get('date');
                            if (fetchDate) {
                                const date = new Date(fetchDate);
                                const now = new Date();
                                const oneDay = 24 * 60 * 60 * 1000;
                                if ((now - date) > oneDay) {
                                    cache.delete(request);
                                }
                            }
                        }
                    });
                }
            }
        });
    });
}