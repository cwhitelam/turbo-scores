/**
 * Turbo Scores Service Worker
 * 
 * This service worker enables offline capability by caching:
 * - Static assets (JS, CSS, images)
 * - API responses for game data
 * - Base HTML for offline access
 */

// Cache names for different types of content
const CACHE_NAMES = {
    STATIC_ASSETS: 'turbo-scores-static-v1',
    API_RESPONSES: 'turbo-scores-api-v1',
    IMAGES: 'turbo-scores-images-v1',
    HTML: 'turbo-scores-html-v1',
};

// Assets to cache on install for offline access
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/offline.html', // Fallback page when offline
    '/manifest.json',
    '/favicon.ico',
    '/logo192.png',
    '/logo512.png',
];

// API endpoints patterns to cache
const API_CACHE_PATTERNS = [
    /\/api\/nba\//,
    /\/api\/nfl\//,
    /\/api\/mlb\//,
    /\/api\/nhl\//,
];

// Image patterns to cache
const IMAGE_CACHE_PATTERNS = [
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    /\/teamlogos\//,
    /\/playerheadshots\//,
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing service worker...');

    // Skip waiting to ensure the new service worker activates immediately
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAMES.STATIC_ASSETS)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((error) => {
                console.error('[Service Worker] Install cache failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating service worker...');

    const currentCaches = Object.values(CACHE_NAMES);

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (!currentCaches.includes(cacheName)) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                // Claim clients to ensure the SW is in control immediately
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip cross-origin requests
    if (url.origin !== self.location.origin && !url.hostname.includes('api')) {
        return;
    }

    // Handle API requests
    if (isApiRequest(event.request)) {
        event.respondWith(handleApiRequest(event.request));
        return;
    }

    // Handle image requests
    if (isImageRequest(event.request)) {
        event.respondWith(handleImageRequest(event.request));
        return;
    }

    // Handle HTML requests - network-first strategy
    if (event.request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(event.request));
        return;
    }

    // Handle static assets - cache-first strategy
    event.respondWith(handleStaticAssetRequest(event.request));
});

// Check if a request is an API request
function isApiRequest(request) {
    const url = new URL(request.url);
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Check if a request is an image request
function isImageRequest(request) {
    const url = new URL(request.url);
    return IMAGE_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Handle API requests with stale-while-revalidate strategy
async function handleApiRequest(request) {
    const cache = await caches.open(CACHE_NAMES.API_RESPONSES);

    // Try to get a cached response
    const cachedResponse = await cache.match(request);

    // Clone the request as it can only be used once
    const fetchPromise = fetch(request.clone())
        .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
                // Clone the response as it can only be used once
                const responseToCache = networkResponse.clone();
                cache.put(request, responseToCache);
            }
            return networkResponse;
        })
        .catch((error) => {
            console.error('[Service Worker] API fetch failed:', error);
            return null;
        });

    // Return cached response immediately if available, but update cache in background
    return cachedResponse || fetchPromise || caches.match('/offline.html');
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
    const cache = await caches.open(CACHE_NAMES.IMAGES);

    // Try to get a cached response
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    // If not in cache, fetch from network and cache
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Image fetch failed:', error);
        // Return fallback image or null
        return caches.match('/images/fallback.png') || null;
    }
}

// Handle navigation requests with network-first strategy
async function handleNavigationRequest(request) {
    try {
        // Try network first for HTML
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAMES.HTML);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Navigation fetch failed, serving from cache');

        // If network fails, try to serve from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // If not in cache, return the offline page
        return caches.match('/offline.html');
    }
}

// Handle static asset requests with cache-first strategy
async function handleStaticAssetRequest(request) {
    const cache = await caches.open(CACHE_NAMES.STATIC_ASSETS);

    // Try to get from cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    // If not in cache, fetch from network and cache
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Static asset fetch failed:', error);
        return null;
    }
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
}); 