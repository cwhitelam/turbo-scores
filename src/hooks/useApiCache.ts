import { useState, useEffect, useCallback } from 'react';
import apiCacheService, { ApiCacheOptions } from '../services/cache/apiCacheService';

interface ApiCacheResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}

/**
 * Hook for using the API cache service in React components
 * 
 * @param endpoint - The API endpoint to fetch
 * @param fetchFn - A function that performs the actual API call
 * @param options - Caching options
 */
export function useApiCache<T>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    options: ApiCacheOptions & {
        initialData?: T | null,
        skip?: boolean
    } = {}
): ApiCacheResult<T> {
    const { initialData = null, skip = false, ...cacheOptions } = options;
    const [data, setData] = useState<T | null>(initialData);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState<Error | null>(null);

    // Determine which cache method to use based on options
    const cacheFn = useCallback(async () => {
        const { keyPrefix } = cacheOptions;

        if (keyPrefix === 'game') {
            return apiCacheService.cacheGameData<T>(endpoint, fetchFn, cacheOptions);
        } else if (keyPrefix === 'team') {
            return apiCacheService.cacheTeamData<T>(endpoint, fetchFn, cacheOptions);
        } else if (keyPrefix === 'static') {
            return apiCacheService.cacheStaticData<T>(endpoint, fetchFn, cacheOptions);
        } else if (keyPrefix === 'weather') {
            return apiCacheService.cacheWeatherData<T>(endpoint, fetchFn, cacheOptions);
        } else {
            // Default to fetchWithCache with provided options
            return apiCacheService.cacheGameData<T>(endpoint, fetchFn, cacheOptions);
        }
    }, [endpoint, fetchFn, cacheOptions]);

    // Function to refresh the data
    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Force skip cache by invalidating first
            apiCacheService.invalidate(endpoint);
            const result = await cacheFn();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, [endpoint, cacheFn]);

    // Load data on mount if not skipped
    useEffect(() => {
        if (skip) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await cacheFn();
                if (isMounted) {
                    setData(result);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error(String(err)));
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [skip, cacheFn]);

    return { data, loading, error, refresh };
}

export default useApiCache; 