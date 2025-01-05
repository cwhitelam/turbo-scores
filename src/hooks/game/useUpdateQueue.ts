import { useCallback } from 'react';
import { logFetchError } from '../../utils/loggingUtils';

// Global update queue to prevent concurrent updates for the same game
const updateQueue = new Map<string, Promise<void>>();

export function useUpdateQueue() {
    const queueUpdate = useCallback(async <T>(
        gameId: string,
        fetchData: () => Promise<T>,
        processUpdate: (data: T) => Promise<void>
    ) => {
        // If there's already an update in progress for this game, wait for it
        const currentUpdate = updateQueue.get(gameId);
        if (currentUpdate) {
            await currentUpdate;
            return;
        }

        const updatePromise = (async () => {
            try {
                const newData = await fetchData();
                await processUpdate(newData);
            } catch (error) {
                logFetchError(`Game data for ${gameId}`, error);
            } finally {
                updateQueue.delete(gameId);
            }
        })();

        updateQueue.set(gameId, updatePromise);
        await updatePromise;
    }, []);

    return queueUpdate;
} 