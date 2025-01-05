import { useEffect, useCallback } from 'react';
import { logGameUpdate } from '../../utils/loggingUtils';
import { useDataChange } from './useDataChange';

// Global event emitter for game updates
type GameUpdateListener<T> = (data: T) => void;
const gameUpdateListeners = new Map<string, Set<GameUpdateListener<any>>>();

export function useGameEvents<T>(
    gameId: string | undefined,
    isMounted: React.MutableRefObject<boolean>,
    lastData: React.MutableRefObject<T>
) {
    const hasDataChanged = useDataChange();

    // Process updates and notify listeners
    const processUpdate = useCallback(async (newData: T) => {
        if (!gameId || !isMounted.current) return;

        // Notify all listeners of the update
        const listeners = gameUpdateListeners.get(gameId);
        if (listeners) {
            listeners.forEach(listener => listener(newData));
        }

        // Only log the update once
        if (hasDataChanged(lastData.current, newData)) {
            logGameUpdate(gameId, { data: newData });
        }
    }, [gameId, hasDataChanged, lastData]);

    // Register this component as a listener for game updates
    useEffect(() => {
        if (!gameId) return;

        const listener = (newData: T) => {
            if (isMounted.current && hasDataChanged(lastData.current, newData)) {
                lastData.current = newData;
            }
        };

        let listeners = gameUpdateListeners.get(gameId);
        if (!listeners) {
            listeners = new Set();
            gameUpdateListeners.set(gameId, listeners);
        }
        listeners.add(listener);

        return () => {
            const listeners = gameUpdateListeners.get(gameId);
            if (listeners) {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    gameUpdateListeners.delete(gameId);
                }
            }
        };
    }, [gameId, hasDataChanged, isMounted, lastData]);

    return processUpdate;
} 