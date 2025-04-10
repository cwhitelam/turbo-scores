/**
 * API Cache Service
 *
 * A specialized cache service for API requests that includes:
 * - Different cache TTLs for different data types
 * - Cache invalidation strategies
 * - Support for stale-while-revalidate pattern
 * - Request deduplication
 */

import { logger } from '../../utils/loggingUtils';
import { cacheService, CacheOptions, CacheStorageType } from './cacheService';

// Default TTLs for different types of API data
const API_CACHE_DEFAULTS = {
    // Game data changes frequently so short TTL
    GAME_DATA_TTL: 30 * 1000, // 30 seconds

    // Team data changes less frequently
    TEAM_DATA_TTL: 24 * 60 * 60 * 1000, // 24 hours

    // Static data rarely changes
    STATIC_DATA_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days

    // Weather data changes occasionally
    WEATHER_TTL: 30 * 60 * 1000, // 30 minutes
};

// Map to track pending requests to deduplicate them
const pendingFetches = new Map<string, Promise<any>>();

// Extended options for API caching
export type ApiCacheOptions = CacheOptions & {
    /** Enable request deduplication */
    deduplicate?: boolean;
    /** Use stale-while-revalidate pattern */
    staleWhileRevalidate?: boolean;
    /** Cache key prefix */
    keyPrefix?: string;
};

/**
 * Generate a consistent cache key for API requests
 */
export function generateCacheKey(
    endpoint: string,
    params: Record<string, any> = {},
    prefix: string = 'api'
): string {
    // Sort params to ensure consistent key regardless of object property order
    const sortedParams = Object.keys(params)
        .sort()
        .reduce<Record<string, any>>((acc, key) => {
            acc[key] = params[key];
            return acc;
        }, {});

    // Create a key with the endpoint and stringified params
    const paramsString = Object.keys(sortedParams).length
        ? ':' + JSON.stringify(sortedParams)
        : '';

    return `${prefix}:${endpoint}${paramsString}`;
}

/**
 * Fetch data with caching support
 */
export async function fetchWithCache<T>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    options: ApiCacheOptions = {}
): Promise<T> {
    const {
        ttl,
        storage,
        deduplicate = true,
        staleWhileRevalidate = false,
        keyPrefix = 'api'
    } = options;

    const cacheKey = generateCacheKey(endpoint, {}, keyPrefix);

    // Handle request deduplication
    if (deduplicate && pendingFetches.has(cacheKey)) {
        return pendingFetches.get(cacheKey) as Promise<T>;
    }

    // Check for cached data (even if expired in stale-while-revalidate mode)
    const cachedData = staleWhileRevalidate
        ? cacheService.get<T>(cacheKey, { checkExpiry: false })
        : cacheService.get<T>(cacheKey);

    // Return valid cached data
    if (cachedData !== null && !isExpired(cacheKey)) {
        return cachedData;
    }

    // Handle stale-while-revalidate pattern
    if (staleWhileRevalidate && cachedData !== null) {
        // Return stale data immediately, but refresh in background
        refreshInBackground(cacheKey, fetchFn, { ttl, storage });
        return cachedData;
    }

    // If no cached data or expired, fetch fresh data
    const fetchPromise = fetchFreshData(cacheKey, fetchFn, { ttl, storage });

    // Store the promise for deduplication
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
    // Access the internal structure to check expiry
    const cacheEntry = (cacheService as any).memoryCache.get(cacheKey);

    if (cacheEntry) {
        return !!cacheEntry.expiry && cacheEntry.expiry < Date.now();
    }

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
        // Use centralized logger instead of console.error
        logger.error(`Failed to fetch data for ${cacheKey}:`, error);
        throw error;
    }
}

/**
 * API Cache Service object that provides caching for different data types
 */
export const apiCacheService = {
    /**
     * Directly get an item from cache
     */
    get<T>(key: string, options: CacheOptions = {}): T | null {
        return cacheService.get<T>(key, options);
    },

    /**
     * Directly set an item in cache
     */
    set<T>(key: string, data: T, options: CacheOptions = {}): void {
        cacheService.set(key, data, options);
    },

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
            storage: 'memory', // Game data changes frequently
            deduplicate: true,
            staleWhileRevalidate: true,
            ...options
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
            deduplicate: true,
            ...options
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
            deduplicate: true,
            ...options
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
            deduplicate: true,
            ...options
        });
    },

    /**
     * Invalidate cache for a specific endpoint
     */
    invalidate(endpoint: string, params: Record<string, any> = {}, keyPrefix: string = 'api'): void {
        const cacheKey = generateCacheKey(endpoint, params, keyPrefix);
        cacheService.remove(cacheKey);
    },

    /**
     * Invalidate all caches for a specific prefix
     */
    invalidateByPrefix(keyPrefix: string): void {
        // Try to invalidate from memory cache
        const allKeys = [...(cacheService as any).memoryCache.keys()];

        allKeys.forEach(key => {
            if (key.startsWith(`${keyPrefix}:`)) {
                cacheService.remove(key);
            }
        });

        // Also try to invalidate from localStorage
        if (typeof localStorage !== 'undefined') {
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
    }
};

export default apiCacheService; 