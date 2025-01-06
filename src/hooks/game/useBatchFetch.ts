import { useCallback } from 'react';

// Global batch queue to optimize concurrent fetches
const batchQueue = new Map<string, Promise<any>>();
const BATCH_WINDOW = 50; // 50ms window to batch requests

export function useBatchFetch() {
    return useCallback(async <T>(
        gameId: string,
        fetchData: () => Promise<T>
    ): Promise<T> => {
        // If there's already a fetch in the batch queue for this game, return that
        const existingBatch = batchQueue.get(gameId);
        if (existingBatch) {
            return existingBatch;
        }

        // Create a new batch promise
        const batchPromise = new Promise<T>((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const data = await fetchData();
                    resolve(data);
                } catch (error) {
                    reject(error);
                } finally {
                    batchQueue.delete(gameId);
                }
            }, BATCH_WINDOW);
        });

        // Store the batch promise
        batchQueue.set(gameId, batchPromise);
        return batchPromise;
    }, []);
} 