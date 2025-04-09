/**
 * Cache Service
 * 
 * A general-purpose caching system that supports:
 * - In-memory caching for quick access
 * - LocalStorage persistence for longer-term storage
 * - Configurable TTL (Time-To-Live)
 * - Cache invalidation
 */

// Cache storage types
export type CacheStorageType = 'memory' | 'localStorage' | 'both';

// Cache options
export interface CacheOptions {
    /** Time to live in milliseconds */
    ttl?: number;
    /** Where to store the cached data */
    storage?: CacheStorageType;
    /** Check if item is expired (used for stale-while-revalidate) */
    checkExpiry?: boolean;
}

// Cache entry structure
interface CacheEntry<T> {
    data: T;
    expiry: number | null;
}

// Default cache options
const DEFAULT_OPTIONS: CacheOptions = {
    ttl: 5 * 60 * 1000, // 5 minutes
    storage: 'memory',
    checkExpiry: true
};

// Cache key prefix for localStorage
const STORAGE_KEY_PREFIX = 'ts_cache_';

/**
 * Main cache service implementation
 */
class CacheService {
    // In-memory cache storage
    memoryCache = new Map<string, CacheEntry<any>>();

    /**
     * Store data in the cache
     */
    set<T>(key: string, data: T, options: CacheOptions = {}): void {
        const { ttl, storage } = { ...DEFAULT_OPTIONS, ...options };

        const entry: CacheEntry<T> = {
            data,
            expiry: ttl ? Date.now() + ttl : null
        };

        // Store in memory if specified
        if (storage === 'memory' || storage === 'both') {
            this.memoryCache.set(key, entry);
        }

        // Store in localStorage if specified
        if ((storage === 'localStorage' || storage === 'both') && this.isLocalStorageAvailable()) {
            try {
                localStorage.setItem(
                    `${STORAGE_KEY_PREFIX}${key}`,
                    JSON.stringify({
                        data,
                        expiry: entry.expiry
                    })
                );
            } catch (error) {
                console.warn('Failed to store item in localStorage:', error);
                // If localStorage fails, ensure it's at least in memory
                if (storage === 'localStorage') {
                    this.memoryCache.set(key, entry);
                }
            }
        }
    }

    /**
     * Get data from the cache
     */
    get<T>(key: string, options: CacheOptions = {}): T | null {
        const { storage, checkExpiry } = { ...DEFAULT_OPTIONS, ...options };
        const now = Date.now();

        // Try to get from memory first
        if (storage === 'memory' || storage === 'both') {
            const memoryEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined;

            if (memoryEntry) {
                // Check if the entry is expired
                if (checkExpiry && memoryEntry.expiry && memoryEntry.expiry < now) {
                    this.remove(key);
                    return null;
                }
                return memoryEntry.data;
            }
        }

        // If not found in memory or if storage is localStorage, try localStorage
        if ((storage === 'localStorage' || storage === 'both') && this.isLocalStorageAvailable()) {
            try {
                const storedItem = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);

                if (storedItem) {
                    const entry = JSON.parse(storedItem) as CacheEntry<T>;

                    // Check if the entry is expired
                    if (checkExpiry && entry.expiry && entry.expiry < now) {
                        this.remove(key);
                        return null;
                    }

                    // Store in memory for faster access next time
                    if (storage === 'localStorage') {
                        this.memoryCache.set(key, entry);
                    }

                    return entry.data;
                }
            } catch (error) {
                console.warn('Failed to retrieve item from localStorage:', error);
            }
        }

        return null;
    }

    /**
     * Remove item from cache
     */
    remove(key: string): void {
        // Remove from memory
        this.memoryCache.delete(key);

        // Remove from localStorage if available
        if (this.isLocalStorageAvailable()) {
            try {
                localStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`);
            } catch (error) {
                console.warn('Failed to remove item from localStorage:', error);
            }
        }
    }

    /**
     * Clear all cache data
     */
    clear(): void {
        // Clear memory cache
        this.memoryCache.clear();

        // Clear localStorage cache if available
        if (this.isLocalStorageAvailable()) {
            try {
                const keysToRemove: string[] = [];

                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
                        keysToRemove.push(key);
                    }
                }

                keysToRemove.forEach(key => localStorage.removeItem(key));
            } catch (error) {
                console.warn('Failed to clear localStorage cache:', error);
            }
        }
    }

    /**
     * Check if localStorage is available
     */
    private isLocalStorageAvailable(): boolean {
        try {
            const testKey = `${STORAGE_KEY_PREFIX}_test`;
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Export the singleton instance
export const cacheService = new CacheService(); 