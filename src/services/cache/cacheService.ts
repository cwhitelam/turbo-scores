/**
 * Cache Service
 * 
 * A generic caching service that supports multiple storage strategies
 * including in-memory, localStorage, and sessionStorage.
 */

export type CacheOptions = {
    /** Time-to-live in milliseconds, 0 = no expiration */
    ttl?: number;
    /** Storage type to use for this cache entry */
    storage?: CacheStorageType;
    /** Whether to use stale-while-revalidate strategy */
    staleWhileRevalidate?: boolean;
    /** Whether to automatically clean expired entries when accessing cache */
    autoCleanup?: boolean;
};

export type CacheEntry<T> = {
    /** The cached data */
    data: T;
    /** When the entry expires (timestamp) */
    expiry: number | null;
    /** When the entry was created (timestamp) */
    createdAt: number;
    /** Storage type for this entry */
    storage: CacheStorageType;
    /** Metadata about the cache entry */
    meta?: Record<string, any>;
};

export type CacheStorageType = 'memory' | 'localStorage' | 'sessionStorage';

export type PersistentStorageAdapter = {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
    clear: () => void;
    keys: () => string[];
};

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_STORAGE = 'memory';
const CACHE_PREFIX = 'ts_cache_';

/**
 * Cache Service for storing and retrieving data with TTL
 */
class CacheService {
    private memoryCache: Map<string, CacheEntry<any>> = new Map();
    private localStorageAdapter: PersistentStorageAdapter | null = null;
    private sessionStorageAdapter: PersistentStorageAdapter | null = null;

    constructor() {
        // Initialize storage adapters if we're in a browser environment
        if (typeof window !== 'undefined') {
            this.localStorageAdapter = this.createStorageAdapter('localStorage');
            this.sessionStorageAdapter = this.createStorageAdapter('sessionStorage');
        }
    }

    /**
     * Create a storage adapter for the specified storage type
     */
    private createStorageAdapter(type: 'localStorage' | 'sessionStorage'): PersistentStorageAdapter {
        const storage = window[type];
        return {
            getItem: (key: string) => storage.getItem(CACHE_PREFIX + key),
            setItem: (key: string, value: string) => storage.setItem(CACHE_PREFIX + key, value),
            removeItem: (key: string) => storage.removeItem(CACHE_PREFIX + key),
            clear: () => {
                // Only clear items with our prefix
                Object.keys(storage).forEach(key => {
                    if (key.startsWith(CACHE_PREFIX)) {
                        storage.removeItem(key);
                    }
                });
            },
            keys: () => {
                return Object.keys(storage)
                    .filter(key => key.startsWith(CACHE_PREFIX))
                    .map(key => key.substring(CACHE_PREFIX.length));
            }
        };
    }

    /**
     * Get a storage adapter for the specified storage type
     */
    private getStorage(type: CacheStorageType): PersistentStorageAdapter | null {
        switch (type) {
            case 'localStorage':
                return this.localStorageAdapter;
            case 'sessionStorage':
                return this.sessionStorageAdapter;
            default:
                return null;
        }
    }

    /**
     * Set a value in the cache
     */
    set<T>(key: string, data: T, options: CacheOptions = {}): void {
        const {
            ttl = DEFAULT_TTL,
            storage = DEFAULT_STORAGE,
            autoCleanup = true,
        } = options;

        // Create cache entry
        const entry: CacheEntry<T> = {
            data,
            expiry: ttl > 0 ? Date.now() + ttl : null,
            createdAt: Date.now(),
            storage,
        };

        // Store in memory cache
        if (storage === 'memory') {
            this.memoryCache.set(key, entry);
            return;
        }

        // Store in persistent storage
        const storageAdapter = this.getStorage(storage);
        if (storageAdapter) {
            try {
                storageAdapter.setItem(key, JSON.stringify(entry));
            } catch (error) {
                console.error(`Failed to cache in ${storage}:`, error);
                // Fall back to memory cache
                this.memoryCache.set(key, entry);
            }
        } else {
            // Fall back to memory cache if storage type is not available
            this.memoryCache.set(key, entry);
        }

        // Optionally cleanup expired entries
        if (autoCleanup) {
            this.cleanup();
        }
    }

    /**
     * Get a value from the cache
     * @returns The cached value or null if not found or expired
     */
    get<T>(key: string, options: { checkExpiry?: boolean } = {}): T | null {
        const { checkExpiry = true } = options;

        // Check memory cache first
        if (this.memoryCache.has(key)) {
            const entry = this.memoryCache.get(key) as CacheEntry<T>;

            // Check if the entry is expired
            if (checkExpiry && entry.expiry && entry.expiry < Date.now()) {
                this.remove(key);
                return null;
            }

            return entry.data;
        }

        // Check persistent storage
        const storageTypes: CacheStorageType[] = ['localStorage', 'sessionStorage'];

        for (const storageType of storageTypes) {
            const storage = this.getStorage(storageType);
            if (!storage) continue;

            const rawData = storage.getItem(key);
            if (!rawData) continue;

            try {
                const entry = JSON.parse(rawData) as CacheEntry<T>;

                // Check if the entry is expired
                if (checkExpiry && entry.expiry && entry.expiry < Date.now()) {
                    this.remove(key);
                    return null;
                }

                // Cache in memory for faster access next time
                this.memoryCache.set(key, entry);

                return entry.data;
            } catch (error) {
                console.error(`Failed to parse cache entry from ${storageType}:`, error);
            }
        }

        return null;
    }

    /**
     * Get a cached value, or fetch and cache it if not found
     */
    async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        options: CacheOptions = {}
    ): Promise<T> {
        // Try to get from cache first
        const cachedData = this.get<T>(key);

        // If we have valid cached data, return it
        if (cachedData !== null) {
            return cachedData;
        }

        // If not found or expired, fetch new data
        try {
            const data = await fetchFn();
            this.set(key, data, options);
            return data;
        } catch (error) {
            console.error(`Failed to fetch data for cache key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Remove an item from all caches
     */
    remove(key: string): void {
        // Remove from memory cache
        this.memoryCache.delete(key);

        // Remove from persistent storage
        const storageTypes: CacheStorageType[] = ['localStorage', 'sessionStorage'];

        for (const storageType of storageTypes) {
            const storage = this.getStorage(storageType);
            if (storage) {
                storage.removeItem(key);
            }
        }
    }

    /**
     * Clear all items from the specified storage
     */
    clear(storageType?: CacheStorageType): void {
        if (!storageType || storageType === 'memory') {
            this.memoryCache.clear();
        }

        if (!storageType || storageType === 'localStorage') {
            this.localStorageAdapter?.clear();
        }

        if (!storageType || storageType === 'sessionStorage') {
            this.sessionStorageAdapter?.clear();
        }
    }

    /**
     * Remove all expired items from the cache
     */
    cleanup(): void {
        const now = Date.now();

        // Clean memory cache
        for (const [key, entry] of this.memoryCache.entries()) {
            if (entry.expiry && entry.expiry < now) {
                this.memoryCache.delete(key);
            }
        }

        // Clean localStorage
        this.cleanPersistentStorage('localStorage', now);

        // Clean sessionStorage
        this.cleanPersistentStorage('sessionStorage', now);
    }

    /**
     * Clean expired items from a persistent storage
     */
    private cleanPersistentStorage(storageType: 'localStorage' | 'sessionStorage', now: number): void {
        const storage = this.getStorage(storageType);
        if (!storage) return;

        const keys = storage.keys();

        for (const key of keys) {
            const rawData = storage.getItem(key);
            if (!rawData) continue;

            try {
                const entry = JSON.parse(rawData) as CacheEntry<any>;
                if (entry.expiry && entry.expiry < now) {
                    storage.removeItem(key);
                }
            } catch (error) {
                // If the entry is corrupted, remove it
                storage.removeItem(key);
            }
        }
    }
}

// Create a singleton instance
export const cacheService = new CacheService();

// Export a hook-friendly version for components
export default cacheService; 