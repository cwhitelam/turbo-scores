import { useState, useEffect, useCallback } from 'react';
import { apiCacheService, ApiCacheOptions } from '../services/cache/apiCacheService';

/**
 * Hook options for API cache
 */
export interface UseApiCacheOptions<T> extends ApiCacheOptions {
    /** Initial data to use while loading */
    initialData?: T;
    /** Whether to skip this request */
    skip?: boolean;
    /** Callback to run when data is fetched */
    onSuccess?: (data: T) => void;
    /** Callback to run when fetch fails */
    onError?: (error: Error) => void;
    /** Function to check if data needs an update */
    shouldUpdate?: (data: T | null) => boolean;
}

/**
 * Type returned by useApiCache hook
 */
export interface UseApiCacheResult<T> {
    /** The cached or fetched data */
    data: T | null;
    /** Whether data is currently being loaded */
    loading: boolean;
    /** Any error that occurred */
    error: Error | null;
    /** Last time data was updated */
    lastUpdated: number | null;
    /** Function to force refresh the data */
    refresh: () => Promise<void>;
    /** Function to manually update the cache */
    updateCache: (newData: T) => void;
}

type CacheDataType = 'game' | 'team' | 'static' | 'weather' | 'custom';

/**
 * React hook for fetching and caching API data
 * 
 * @param endpoint The API endpoint or unique identifier
 * @param fetchFn Function to fetch the data
 * @param dataType Type of data for appropriate TTL settings
 * @param options Additional options
 * @returns Cached data, loading state, and utilities
 * 
 * @example
 * // Basic usage
 * const { data, loading, error } = useApiCache(
 *   'nba/scoreboard',
 *   () => fetch('/api/nba/scores').then(r => r.json()),
 *   'game'
 * );
 * 
 * @example
 * // With options
 * const { data, loading, refresh } = useApiCache(
 *   'nfl/teams',
 *   () => nflApi.getTeams(),
 *   'team',
 *   {
 *     ttl: 60 * 60 * 1000, // 1 hour
 *     storage: 'localStorage',
 *     onSuccess: (teams) => console.log('Teams loaded:', teams.length)
 *   }
 * );
 */
export function useApiCache<T>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    dataType: CacheDataType = 'custom',
    options: UseApiCacheOptions<T> = {}
): UseApiCacheResult<T> {
    const {
        initialData = null,
        skip = false,
        onSuccess,
        onError,
        shouldUpdate,
        ...cacheOptions
    } = options;

    const [data, setData] = useState<T | null>(initialData);
    const [loading, setLoading] = useState<boolean>(!initialData && !skip);
    const [error, setError] = useState<Error | null>(null);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    // Function to fetch data based on the data type
    const fetchData = useCallback(async (): Promise<void> => {
        if (skip) return;

        try {
            setLoading(true);
            setError(null);

            let result: T;

            // Use the appropriate cache method based on data type
            switch (dataType) {
                case 'game':
                    result = await apiCacheService.cacheGameData<T>(endpoint, fetchFn, cacheOptions);
                    break;
                case 'team':
                    result = await apiCacheService.cacheTeamData<T>(endpoint, fetchFn, cacheOptions);
                    break;
                case 'static':
                    result = await apiCacheService.cacheStaticData<T>(endpoint, fetchFn, cacheOptions);
                    break;
                case 'weather':
                    result = await apiCacheService.cacheWeatherData<T>(endpoint, fetchFn, cacheOptions);
                    break;
                default:
                    result = await apiCacheService.cacheGameData<T>(endpoint, fetchFn, cacheOptions);
                    break;
            }

            setData(result);
            setLastUpdated(Date.now());

            if (onSuccess) {
                onSuccess(result);
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);

            if (onError) {
                onError(error);
            }
        } finally {
            setLoading(false);
        }
    }, [endpoint, fetchFn, dataType, skip, onSuccess, onError, cacheOptions]);

    // Function to manually refresh data
    const refresh = useCallback(async (): Promise<void> => {
        // Force invalidate the current cache
        apiCacheService.invalidate(endpoint);
        await fetchData();
    }, [endpoint, fetchData]);

    // Function to manually update the cache
    const updateCache = useCallback((newData: T): void => {
        setData(newData);
        setLastUpdated(Date.now());

        // Generate the key prefix based on data type
        const keyPrefix = dataType === 'custom' ? 'api' : dataType;

        // Update the cache with the new data
        apiCacheService.invalidate(endpoint, {}, keyPrefix);

        // Prepare cache options based on data type
        let ttl: number | undefined;
        let storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory';

        switch (dataType) {
            case 'game':
                ttl = 30 * 1000; // 30 seconds
                storage = 'memory';
                break;
            case 'team':
                ttl = 24 * 60 * 60 * 1000; // 24 hours
                storage = 'localStorage';
                break;
            case 'static':
                ttl = 7 * 24 * 60 * 60 * 1000; // 7 days
                storage = 'localStorage';
                break;
            case 'weather':
                ttl = 30 * 60 * 1000; // 30 minutes
                storage = 'localStorage';
                break;
        }

        // Update the cache
        const { cacheService } = apiCacheService as any;
        if (cacheService) {
            const key = `${keyPrefix}:${endpoint}`;
            cacheService.set(key, newData, {
                ttl,
                storage,
                ...cacheOptions,
            });
        }
    }, [endpoint, dataType, cacheOptions]);

    // Effect to fetch data on mount or when dependencies change
    useEffect(() => {
        // Skip fetching if requested
        if (skip) return;

        // Check if we should update based on the current data
        if (shouldUpdate && !shouldUpdate(data)) {
            return;
        }

        fetchData();
    }, [endpoint, fetchFn, dataType, skip, shouldUpdate, fetchData, data]);

    return {
        data,
        loading,
        error,
        lastUpdated,
        refresh,
        updateCache,
    };
}

export default useApiCache; 