/**
 * API Cache Service
 * 
 * A specialized cache service for API requests that includes:
 * - Automatic caching of API responses
 * - Cache invalidation strategies
 * - Request deduplication
 * - Stale-while-revalidate pattern
 */

import { cacheService, CacheOptions, CacheStorageType } from './cacheService';

// Default TTL for different types of data
const API_CACHE_DEFAULTS = {
    // Game data refreshes frequently
    GAME_DATA_TTL: 30 * 1000, // 30 seconds

    // Team data changes less frequently
    TEAM_DATA_TTL: 24 * 60 * 60 * 1000, // 24 hours

    // Static data rarely changes
    STATIC_DATA_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days

    // Weather data
    WEATHER_TTL: 30 * 60 * 1000, // 30 minutes
};

// Active fetches to deduplicate concurrent requests
const pendingFetches: Map<string, Promise<any>> = new Map();

export type ApiCacheOptions = CacheOptions & {
    /** Whether to deduplicate concurrent requests */
    deduplicate?: boolean;
    /** Cache key prefix */
    keyPrefix?: string;
};

/**
 * Generate a consistent cache key for API requests
 */
export function generateCacheKey(
    endpoint: string,
    params?: Record<string, any>,
    keyPrefix = 'api'
): string {
    // Generate a stable key based on the endpoint and params
    let key = `${keyPrefix}:${endpoint}`;

    if (params && Object.keys(params).length > 0) {
        // Sort keys for consistent order
        const sortedKeys = Object.keys(params).sort();
        const paramsStr = sortedKeys
            .map(k => `${k}=${String(params[k])}`)
            .join('&');
        key += `:${paramsStr}`;
    }

    return key;
}

/**
 * Fetch data from the API with caching
 */
export async function fetchWithCache<T>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    options: ApiCacheOptions = {}
): Promise<T> {
    const {
        ttl,
        storage = 'memory',
        staleWhileRevalidate = true,
        deduplicate = true,
        keyPrefix = 'api',
    } = options;

    const cacheKey = generateCacheKey(endpoint, {}, keyPrefix);

    // Use request deduplication to avoid duplicate API calls
    if (deduplicate && pendingFetches.has(cacheKey)) {
        return pendingFetches.get(cacheKey) as Promise<T>;
    }

    // Check for cached data (even if expired in stale-while-revalidate mode)
    const cachedData = staleWhileRevalidate
        ? cacheService.get<T>(cacheKey, { checkExpiry: false })
        : cacheService.get<T>(cacheKey);

    // If we have valid non-expired data, return it
    if (cachedData !== null && !isExpired(cacheKey)) {
        return cachedData;
    }

    // If using stale-while-revalidate and we have stale data,
    // return the stale data and refresh in the background
    if (staleWhileRevalidate && cachedData !== null) {
        // Fetch fresh data in the background without blocking
        refreshInBackground(cacheKey, fetchFn, { ttl, storage });
        return cachedData;
    }

    // If no cached data or expired, fetch fresh data
    const fetchPromise = fetchFreshData(cacheKey, fetchFn, { ttl, storage });

    // Store the promise to deduplicate concurrent requests
    if (deduplicate) {
        pendingFetches.set(cacheKey, fetchPromise);

        // Clean up after the promise resolves or rejects
        fetchPromise.finally(() => {
            pendingFetches.delete(cacheKey);
        });
    }

    return fetchPromise;
}

/**
 * Check if a cached item is expired
 */
function isExpired(cacheKey: string): boolean {
    // Get the item from memory first (faster)
    const cacheEntry = (cacheService as any).memoryCache.get(cacheKey);

    if (cacheEntry) {
        return !!cacheEntry.expiry && cacheEntry.expiry < Date.now();
    }

    // For local/session storage, we'd need to parse the entry
    // This is handled in the cacheService.get method
    return false;
}

/**
 * Refresh data in the background without blocking
 */
async function refreshInBackground<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    options: { ttl?: number; storage?: CacheStorageType }
): Promise<void> {
    try {
        const data = await fetchFn();
        cacheService.set(cacheKey, data, options);
    } catch (error) {
        console.error(`Background refresh failed for ${cacheKey}:`, error);
        // Don't throw - this is in the background
    }
}

/**
 * Fetch fresh data and cache it
 */
async function fetchFreshData<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    options: { ttl?: number; storage?: CacheStorageType }
): Promise<T> {
    try {
        const data = await fetchFn();
        cacheService.set(cacheKey, data, options);
        return data;
    } catch (error) {
        console.error(`Failed to fetch data for ${cacheKey}:`, error);
        throw error; // Rethrow to let the caller handle it
    }
}

/**
 * API Cache Service object that provides caching for different data types
 */
export const apiCacheService = {
    /**
     * Cache game data (short TTL)
     */
    async cacheGameData<T>(
        endpoint: string,
        fetchFn: () => Promise<T>,
        options: ApiCacheOptions = {}
    ): Promise<T> {
        return fetchWithCache(endpoint, fetchFn, {
            ttl: API_CACHE_DEFAULTS.GAME_DATA_TTL,
            storage: 'memory', // Game data refreshes frequently, keep in memory
            staleWhileRevalidate: true,
            keyPrefix: 'game',
            ...options,
        });
    },

    /**
     * Cache team data (medium TTL)
     */
    async cacheTeamData<T>(
        endpoint: string,
        fetchFn: () => Promise<T>,
        options: ApiCacheOptions = {}
    ): Promise<T> {
        return fetchWithCache(endpoint, fetchFn, {
            ttl: API_CACHE_DEFAULTS.TEAM_DATA_TTL,
            storage: 'localStorage', // Team data changes less frequently
            staleWhileRevalidate: true,
            keyPrefix: 'team',
            ...options,
        });
    },

    /**
     * Cache static data (long TTL)
     */
    async cacheStaticData<T>(
        endpoint: string,
        fetchFn: () => Promise<T>,
        options: ApiCacheOptions = {}
    ): Promise<T> {
        return fetchWithCache(endpoint, fetchFn, {
            ttl: API_CACHE_DEFAULTS.STATIC_DATA_TTL,
            storage: 'localStorage', // Static data rarely changes
            staleWhileRevalidate: false, // No need to revalidate frequently
            keyPrefix: 'static',
            ...options,
        });
    },

    /**
     * Cache weather data
     */
    async cacheWeatherData<T>(
        endpoint: string,
        fetchFn: () => Promise<T>,
        options: ApiCacheOptions = {}
    ): Promise<T> {
        return fetchWithCache(endpoint, fetchFn, {
            ttl: API_CACHE_DEFAULTS.WEATHER_TTL,
            storage: 'localStorage', // Weather data changes moderately
            staleWhileRevalidate: true,
            keyPrefix: 'weather',
            ...options,
        });
    },

    /**
     * Invalidate cache for a specific endpoint
     */
    invalidate(endpoint: string, params?: Record<string, any>, keyPrefix = 'api'): void {
        const cacheKey = generateCacheKey(endpoint, params, keyPrefix);
        cacheService.remove(cacheKey);
    },

    /**
     * Invalidate all caches for a specific prefix
     */
    invalidateByPrefix(keyPrefix: string): void {
        const allKeys = [...(cacheService as any).memoryCache.keys()];

        for (const key of allKeys) {
            if (key.startsWith(`${keyPrefix}:`)) {
                cacheService.remove(key);
            }
        }

        // Also try to invalidate from localStorage
        if (typeof window !== 'undefined') {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(`ts_cache_${keyPrefix}:`)) {
                    localStorage.removeItem(key);
                }
            });
        }
    },

    /**
     * Clear all API caches
     */
    clearAll(): void {
        cacheService.clear();
    },
};

export default apiCacheService; 