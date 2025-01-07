import { useEffect, useState } from 'react';

/**
 * Hook to manage staggered refresh intervals for multiple games
 * @param gameId - The unique identifier for the game
 * @param totalGames - Total number of games being displayed
 * @returns boolean indicating if this game should refresh
 */
export function useStaggeredRefresh(gameId: string, totalGames: number) {
    const [shouldRefresh, setShouldRefresh] = useState(false);

    useEffect(() => {
        // Generate a random delay between 0 and 10 seconds
        const randomDelay = Math.random() * 10000;

        // Set up an interval that triggers every 15-25 seconds (random)
        const getRandomInterval = () => 15000 + Math.random() * 10000;

        // Initial delay to stagger the starts
        const initialTimer = setTimeout(() => {
            setShouldRefresh(true);

            // After initial delay, set up recurring interval
            const interval = setInterval(() => {
                setShouldRefresh(true);

                // Reset the refresh flag after 2 seconds
                setTimeout(() => {
                    setShouldRefresh(false);
                }, 2000);
            }, getRandomInterval());

            return () => clearInterval(interval);
        }, randomDelay);

        return () => clearTimeout(initialTimer);
    }, [gameId, totalGames]);

    return shouldRefresh;
} 