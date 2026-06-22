const CACHE_NAME = 'game-assets-v1';

// URLs to cache aggressively
const ASSET_EXTENSIONS = /\.(svg|png|jpg|jpeg|gif|webp|mp3)$/i;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only cache GET requests for specific static asset extensions
  if (event.request.method === 'GET' && ASSET_EXTENSIONS.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return from cache if available (instant load)
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network, cache a copy, and return
        return fetch(event.request).then((networkResponse) => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Clone the response because it's a stream and can only be consumed once
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(() => {
          // If network fetch fails (offline) and no cache, just return a dummy offline response or fail gracefully
          // For images this will just show a broken image, but most assets should be cached by now
          return new Response('', { status: 408, statusText: 'Request timed out.' });
        });
      })
    );
  }
});
