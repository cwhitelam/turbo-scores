import { useState, useRef, useCallback, useEffect } from 'react';
import { useGameState } from '../useGameState';
import { useBatchFetch } from './useBatchFetch';
import { useGameEvents } from './useGameEvents';
import { useUpdateQueue } from './useUpdateQueue';
import { useUpdateInterval } from './useUpdateInterval';
import { useDataChange } from './useDataChange';

export function useGameData<T>(
    gameId: string | undefined,
    fetchData: () => Promise<T>,
    initialData: T
) {
    const [data, setData] = useState<T>(initialData);
    const gameState = useGameState(gameId);
    const lastDataRef = useRef<T>(initialData);
    const isMountedRef = useRef(true);
    const isInitialFetchRef = useRef(true);
    const hasDataChanged = useDataChange();

    // Initialize hooks
    const batchFetch = useBatchFetch();
    const processUpdate = useGameEvents(gameId, isMountedRef, lastDataRef);
    const queueUpdate = useUpdateQueue();

    // Update data function
    const updateData = useCallback(async () => {
        if (!gameId || !isMountedRef.current) return;

        await queueUpdate(
            gameId,
            async () => {
                // Use batch fetching for initial load
                const newData = isInitialFetchRef.current
                    ? await batchFetch(gameId, fetchData)
                    : await fetchData();

                isInitialFetchRef.current = false;
                return newData;
            },
            async (newData) => {
                if (hasDataChanged(lastDataRef.current, newData)) {
                    lastDataRef.current = newData;
                    setData(newData);
                    await processUpdate(newData);
                }
            }
        );
    }, [gameId, fetchData, batchFetch, queueUpdate, processUpdate, hasDataChanged]);

    // Set up update interval
    useUpdateInterval(gameId, gameState, updateData);

    // Handle component mount/unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, [gameId]);

    // Reset refs when gameId changes
    useEffect(() => {
        if (!gameId) return;
        lastDataRef.current = initialData;
        isInitialFetchRef.current = true;
    }, [gameId, initialData]);

    return data;
} 