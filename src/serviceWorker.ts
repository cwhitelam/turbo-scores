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

// Environment check
const isDevelopment = self.location.hostname === 'localhost' ||
    self.location.hostname === '127.0.0.1' ||
    self.location.hostname.includes('.local');

// Simple logger that only logs in development mode
const logger = {
    log: (...args: any[]) => {
        if (isDevelopment) {
            console.log('[SW]', ...args);
        }
    },
    error: (...args: any[]) => {
        if (isDevelopment) {
            console.error('[SW]', ...args);
        }
    },
    warn: (...args: any[]) => {
        if (isDevelopment) {
            console.warn('[SW]', ...args);
        }
    }
};

declare const self: ServiceWorkerGlobalScope;

// TypeScript definitions for service worker
interface WorkerGlobalScope {
    location: Location;
    navigator: WorkerNavigator;
    self: ServiceWorkerGlobalScope;
}

interface Clients {
    claim(): Promise<void>;
    get(id: string): Promise<Client | undefined>;
    matchAll(options?: ClientMatchOptions): Promise<Client[]>;
    openWindow(url: string): Promise<WindowClient | null>;
}

interface ClientMatchOptions {
    includeUncontrolled?: boolean;
    type?: ClientType;
}

type ClientType = 'window' | 'worker' | 'sharedworker' | 'all';
interface Client {
    id: string;
    type: ClientType;
    url: string;
}

interface WindowClient extends Client {
    focused: boolean;
    visibilityState: VisibilityState;
    focus(): Promise<WindowClient>;
    navigate(url: string): Promise<WindowClient | null>;
}

interface ExtendableEvent extends Event {
    waitUntil(promise: Promise<any>): void;
}

interface FetchEvent extends ExtendableEvent {
    request: Request;
    respondWith(response: Promise<Response> | Response): void;
}

interface ExtendableMessageEvent extends ExtendableEvent {
    data: any;
    source: Client | ServiceWorker | MessagePort | null;
}

interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
    skipWaiting(): Promise<void>;
    clients: Clients;
    registration: ServiceWorkerRegistration;
    caches: CacheStorage;

    addEventListener(type: 'install', listener: (event: ExtendableEvent) => void): void;
    addEventListener(type: 'activate', listener: (event: ExtendableEvent) => void): void;
    addEventListener(type: 'fetch', listener: (event: FetchEvent) => void): void;
    addEventListener(type: 'message', listener: (event: ExtendableMessageEvent) => void): void;
    addEventListener(type: string, listener: EventListener): void;
}

interface WorkerNavigator {
    userAgent: string;
    appVersion: string;
    platform: string;
    language: string;
}

type VisibilityState = 'hidden' | 'visible' | 'prerender';

// Install event: Cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                logger.log('Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
    const cacheAllowList = [CACHE_NAME, API_CACHE_NAME];

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (!cacheAllowList.includes(cacheName)) {
                            logger.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                        return Promise.resolve();
                    })
                );
            })
            .then(() => self.clients.claim())
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

// Helper function to determine if cache should be refreshed
// This can be customized based on app needs
function shouldRefreshCache(url: string): boolean {
    // Default: always refresh API caches if we have a network connection
    return url.includes('/api/');
}

// Fetch event: Handle requests based on type
self.addEventListener('fetch', (event: FetchEvent) => {
    const request = event.request;

    // Skip cross-origin requests
    if (!request.url.startsWith(self.location.origin)) {
        return;
    }

    // Different caching strategies based on request type
    if (isApiRequest(request)) {
        // Network first, then cache for API requests
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        // Check if we should refresh cache
                        if (shouldRefreshCache(request.url)) {
                            // Update cache in background
                            fetch(request)
                                .then(response => addToCache(CACHE_NAME, request, response))
                                .catch(() => logger.log('Failed to refresh cache for:', request.url));

                            return cachedResponse;
                        }
                        return cachedResponse;
                    }

                    // Not in cache, get from network
                    return fetch(request)
                        .then(response => {
                            // Cache copy of response
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseToCache);
                                })
                                .catch(error => logger.error('Error caching response:', error));

                            return response;
                        })
                        .catch(error => {
                            logger.error('Network fetch failed:', error);
                            return new Response('Network error', {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: new Headers({
                                    'Content-Type': 'text/plain'
                                })
                            });
                        });
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
                            .catch(() => logger.log('Failed to refresh cache for:', request.url));

                        return cachedResponse;
                    }

                    // If not in cache, fetch from network
                    return fetch(request)
                        .then(response => addToCache(CACHE_NAME, request, response))
                        .catch(() => {
                            logger.log('Failed to fetch asset:', request.url);
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
self.addEventListener('message', (event: ExtendableMessageEvent) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Get offline API response
function getOfflineApiResponse(request: Request): Response {
    return new Response(JSON.stringify({
        error: 'You are offline and the requested resource is not available in cache.'
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

// Handle API request with caching
function handleApiRequest(request: Request): Promise<Response> {
    // First, try the network
    return fetch(request)
        .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }

            // Clone the response since the browser consumes the response body
            const responseToCache = response.clone();

            // Cache the response for future use
            caches.open(API_CACHE_NAME)
                .then(cache => {
                    cache.put(request, responseToCache);
                    logger.log(`Cached API response for: ${request.url}`);
                });

            return response;
        })
        .catch(() => {
            // If network fails, try to get it from the cache
            return caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        logger.log(`Serving cached API response for: ${request.url}`);
                        return cachedResponse;
                    }

                    // If not in cache either, return offline response
                    logger.log(`No cached data found for: ${request.url}`);
                    return Promise.resolve(getOfflineApiResponse(request));
                });
        });
} 