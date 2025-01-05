import { useEffect, useRef } from 'react';

const ACTIVE_GAME_INTERVAL = 30000; // 30 seconds
const INACTIVE_GAME_INTERVAL = 300000; // 5 minutes
const UPDATE_DEBOUNCE = 1000; // 1 second debounce

export function useUpdateInterval(
    gameId: string | undefined,
    gameState: string,
    updateData: () => Promise<void>
) {
    const lastUpdateRef = useRef<number>(0);
    const updateTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (!gameId) return;

        // Reset last update time when gameId changes
        lastUpdateRef.current = 0;

        // Determine update interval based on game state
        const interval = gameState === 'active' ? ACTIVE_GAME_INTERVAL : INACTIVE_GAME_INTERVAL;

        // Don't poll if game is complete
        if (gameState === 'complete') return;

        const debouncedUpdate = async () => {
            const now = Date.now();
            if (now - lastUpdateRef.current < UPDATE_DEBOUNCE) {
                if (updateTimeoutRef.current) {
                    clearTimeout(updateTimeoutRef.current);
                }
                updateTimeoutRef.current = setTimeout(debouncedUpdate, UPDATE_DEBOUNCE);
                return;
            }

            lastUpdateRef.current = now;
            await updateData();
        };

        // Initial update
        debouncedUpdate();

        // Set up interval
        const timer = setInterval(debouncedUpdate, interval);

        return () => {
            clearInterval(timer);
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, [gameId, gameState, updateData]);

    return lastUpdateRef;
} 