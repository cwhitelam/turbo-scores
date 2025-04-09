/**
 * Service Worker for Turbo Scores
 * 
 * Implements advanced caching strategies:
 * - Static assets: Cache first, then network
 * - API responses: Network first, then cache
 * - Offline fallback: Default offline page
 */

// This file would typically be saved as a separate JS file outside src/
// and referenced in the main app for registration.
// Using 'any' in some places to avoid strict TypeScript service worker typing issues

const CACHE_NAME = 'turbo-scores-cache-v1';
const API_CACHE_NAME = 'turbo-scores-api-cache-v1';

// Assets to cache on install
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/offline.html',  // Fallback page for offline
    '/assets/icons/favicon.ico',
    '/assets/icons/logo.svg',
];

// API URLs that should be cached
const API_URLS = [
    '/api/scoreboard',
    '/api/summary'
];

// Install event: Cache static assets
self.addEventListener('install', (event: any) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => (self as any).skipWaiting())
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event: any) => {
    const cacheAllowList = [CACHE_NAME, API_CACHE_NAME];

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (!cacheAllowList.includes(cacheName)) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                        return Promise.resolve();
                    })
                );
            })
            .then(() => (self as any).clients.claim())
    );
});

// Helper function to determine if a request is for an API
function isApiRequest(request: Request): boolean {
    const url = new URL(request.url);
    return API_URLS.some(apiUrl => url.pathname.includes(apiUrl));
}

// Helper function to determine if a request is for a static asset
function isStaticAsset(request: Request): boolean {
    const url = new URL(request.url);
    return url.pathname.startsWith('/assets/') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.ico') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.gif');
}

// Helper function to add response to cache
async function addToCache(cacheName: string, request: Request, response: Response): Promise<Response> {
    if (response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
    }
    return response;
}

// Fetch event: Handle requests based on type
self.addEventListener('fetch', (event: any) => {
    const request = event.request;

    // Skip cross-origin requests
    if (!request.url.startsWith((self as any).location.origin)) {
        return;
    }

    // Different caching strategies based on request type
    if (isApiRequest(request)) {
        // Network first, then cache for API requests
        event.respondWith(
            fetch(request)
                .then(response => addToCache(API_CACHE_NAME, request, response))
                .catch(() => {
                    return caches.match(request) || Promise.resolve(
                        new Response('Network error', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain' }
                        })
                    );
                })
        );
    } else if (isStaticAsset(request)) {
        // Cache first, then network for static assets
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        // Refresh cache in background
                        fetch(request)
                            .then(response => addToCache(CACHE_NAME, request, response))
                            .catch(() => console.log('Failed to refresh cache for:', request.url));

                        return cachedResponse;
                    }

                    // If not in cache, fetch from network
                    return fetch(request)
                        .then(response => addToCache(CACHE_NAME, request, response))
                        .catch(() => {
                            console.log('Failed to fetch asset:', request.url);
                            return new Response('Network error', {
                                status: 408,
                                headers: { 'Content-Type': 'text/plain' }
                            });
                        });
                })
        );
    } else {
        // Default strategy: Network first, fallback to cache, then offline page
        event.respondWith(
            fetch(request)
                .then(response => addToCache(CACHE_NAME, request, response))
                .catch(() => {
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }

                            // If this is a navigation request, show offline page
                            if (request.mode === 'navigate') {
                                return caches.match('/offline.html') || Promise.resolve(
                                    new Response('Offline - No cached page available', {
                                        status: 200,
                                        headers: { 'Content-Type': 'text/html' }
                                    })
                                );
                            }

                            // If not a navigation request and not in cache, return error
                            return new Response('Network error', {
                                status: 408,
                                headers: { 'Content-Type': 'text/plain' }
                            });
                        });
                })
        );
    }
});

// Message event: Handle messages from client
self.addEventListener('message', (event: any) => {
    if (event.data && event.data.action === 'skipWaiting') {
        (self as any).skipWaiting();
    }
});

// TypeScript interfaces for service worker events
interface ExtendableEvent extends Event {
    waitUntil(fn: Promise<any>): void;
}

interface FetchEvent extends Event {
    request: Request;
    respondWith(response: Promise<Response> | Response): void;
} 