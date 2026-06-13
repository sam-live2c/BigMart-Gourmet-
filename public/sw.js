// Service Worker for BigMart Gourmet (PWA / Offline Support)

const CACHE_NAME = 'bigmart-assets-v1';
const IMAGE_CACHE_NAME = 'bigmart-images-v1';

// Static resources to cache immediately on install
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/#/',
  '/#/cart',
  '/#/compare',
  '/#/categories',
  '/#/help',
  '/#/contact'
];

// Install Event - Pre-cache the main app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static resources');
      return cache.addAll(STATIC_RESOURCES);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event - Clean up stale cache names
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('[Service Worker] Consolidating and clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Helper: Determine if a request is for an image (internal or external)
const isImageRequest = (url, request) => {
  return (
    request.destination === 'image' ||
    url.search(/\.(png|jpe?g|gif|svg|webp|ico)/i) !== -1 ||
    url.includes('images.unsplash.com') ||
    url.includes('firebasestorage.googleapis.com')
  );
};

// Fetch Event - Handle caching strategies
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip caching for non-GET requests or Firebase Auth / Firestore collection writes
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Chrome extensions
  if (requestUrl.protocol !== 'http:' && requestUrl.protocol !== 'https:') {
    return;
  }

  // Only handle requests for our own origin (local assets) or specific external assets like trusted images.
  // This is critical to prevent the Service Worker from intercepting and breaking persistent streams or Firestore/Auth API endpoints.
  const isLocal = requestUrl.origin === self.location.origin;
  const isTargetImage = isImageRequest(event.request.url, event.request);

  if (!isLocal && !isTargetImage) {
    return;
  }

  // 1. Navigation requests (HTML SPA routing fallback support)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If response is valid, cache the standard document page
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put('/', responseClone);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback: respond with cached root index.html so React SPA router handles it local-first
          return caches.match('/').then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Absolute fallback return index.html if we matched any other cached page
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // 2. Image requests: Use "Cache-First, Falling Back to Network" Strategy
  if (isImageRequest(event.request.url, event.request)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Serve immediately from offline cache
            return cachedResponse;
          }

          // Otherwise fetch from remote/local and store in cache
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch((err) => {
              console.log('[Service Worker] Offline image fetch failed:', event.request.url, err);
              // Graceful placeholder or just undefined (let standard broken image icon appear)
              return;
            });
        });
      })
    );
    return;
  }

  // 3. Static JS, CSS, and general assets: Use "Stale-While-Revalidate" Strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.log('[Service Worker] Fetch asset error (offline):', event.request.url);
      });

      // Returns the cache instantly for speedy loading, while fetching in background
      return cachedResponse || fetchPromise;
    })
  );
});
