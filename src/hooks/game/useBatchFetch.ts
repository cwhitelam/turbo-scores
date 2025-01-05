import { useCallback } from 'react';
import { logFetchError } from '../../utils/loggingUtils';

const BATCH_DELAY = 100; // 100ms delay for batching

// Batch fetching system
type BatchFetch = {
    gameId: string;
    fetchData: () => Promise<any>;
    resolve: (value: any) => void;
};

let batchTimeout: NodeJS.Timeout | null = null;
let batchedFetches: BatchFetch[] = [];

async function processBatchedFetches() {
    const fetches = [...batchedFetches];
    batchedFetches = [];
    batchTimeout = null;

    // Group fetches by unique fetch functions (based on toString comparison)
    const fetchGroups = new Map<string, BatchFetch[]>();
    fetches.forEach(fetch => {
        const key = fetch.fetchData.toString();
        if (!fetchGroups.has(key)) {
            fetchGroups.set(key, []);
        }
        fetchGroups.get(key)!.push(fetch);
    });

    // Process each group of fetches
    for (const [_, groupFetches] of fetchGroups) {
        try {
            const firstFetch = groupFetches[0];
            const result = await firstFetch.fetchData();

            // Resolve all fetches in this group with the same result
            groupFetches.forEach(fetch => {
                fetch.resolve(result);
            });
        } catch (error) {
            // If fetch fails, reject all fetches in this group
            groupFetches.forEach(fetch => {
                logFetchError(`Game data for ${fetch.gameId}`, error);
                fetch.resolve(null);
            });
        }
    }
}

export function useBatchFetch() {
    const batchFetch = useCallback(<T>(gameId: string, fetchData: () => Promise<T>): Promise<T> => {
        return new Promise(resolve => {
            batchedFetches.push({ gameId, fetchData, resolve });

            if (batchTimeout) {
                clearTimeout(batchTimeout);
            }

            batchTimeout = setTimeout(processBatchedFetches, BATCH_DELAY);
        });
    }, []);

    return batchFetch;
} 