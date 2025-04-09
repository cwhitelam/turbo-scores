import { useEffect, useRef } from 'react';
import { preloadSportAssets, preloadModule, preloadBasedOnNavigation } from '../utils/preloadUtil';

type PreloadType = 'sport' | 'navigation' | 'component';

interface PreloadOptions {
    type: PreloadType;
    sport?: 'nba' | 'nfl' | 'mlb' | 'nhl';
    currentPage?: string;
    componentPath?: string;
    priority?: boolean;
    delay?: number;
}

/**
 * React hook to preload assets when a component mounts
 * 
 * Examples:
 * - `usePreloadAssets({ type: 'sport', sport: 'nba' })` - Preload NBA-specific assets
 * - `usePreloadAssets({ type: 'navigation', currentPage: 'nba/games' })` - Preload based on navigation patterns
 * - `usePreloadAssets({ type: 'component', componentPath: '/components/GameDetails.tsx' })` - Preload a specific component
 * 
 * @param options Configuration options for preloading
 * @param dependencies Additional dependencies that should trigger re-preloading
 */
export function usePreloadAssets(options: PreloadOptions, dependencies: any[] = []): void {
    const hasPreloaded = useRef<boolean>(false);

    useEffect(() => {
        // Skip if already preloaded and dependencies haven't changed
        if (hasPreloaded.current && dependencies.length === 0) {
            return;
        }

        // Function to handle preloading after optional delay
        const handlePreload = () => {
            switch (options.type) {
                case 'sport':
                    if (options.sport) {
                        preloadSportAssets(options.sport);
                    }
                    break;

                case 'navigation':
                    if (options.currentPage) {
                        preloadBasedOnNavigation(options.currentPage);
                    }
                    break;

                case 'component':
                    if (options.componentPath) {
                        preloadModule(options.componentPath, options.priority);
                    }
                    break;
            }

            hasPreloaded.current = true;
        };

        // Apply delay if requested
        if (options.delay && options.delay > 0) {
            const timer = setTimeout(handlePreload, options.delay);
            return () => clearTimeout(timer);
        } else {
            // Request idle callback if available
            if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
                const handle = window.requestIdleCallback(handlePreload, {
                    timeout: options.priority ? 500 : 2000
                });
                return () => window.cancelIdleCallback(handle);
            } else {
                // Fallback to setTimeout
                const timer = setTimeout(handlePreload, options.priority ? 100 : 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [options, ...dependencies]);
}

/**
 * Hook to preload assets for the next game phase
 * 
 * @param gamePhase Current phase of the game ('pre', 'live', 'post')
 * @param gameId Game identifier
 */
export function usePreloadNextPhase(gamePhase: 'pre' | 'live' | 'post', gameId: string): void {
    useEffect(() => {
        // Preload strategy based on current game phase
        if (gamePhase === 'pre') {
            // When in pre-game, preload live game components
            preloadModule('/src/components/game/LiveGameTracker.tsx');
            preloadModule('/src/components/game/GameCountdown.tsx');
        } else if (gamePhase === 'live') {
            // When watching live, preload components for game conclusion
            preloadModule('/src/components/game/GameSummary.tsx');
            preloadModule('/src/components/game/GameHighlights.tsx');
        } else if (gamePhase === 'post') {
            // After game concludes, preload components for exploring other games
            preloadModule('/src/components/common/UpcomingGames.tsx');
            preloadModule('/src/components/common/GameRecap.tsx');
        }
    }, [gamePhase, gameId]);
} 