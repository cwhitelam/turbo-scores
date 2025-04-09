/**
 * Preloading Utilities
 * 
 * This module provides utilities for preloading modules, components, and assets
 * to improve page load performance for the Turbo Scores application.
 */

// Track which modules are already being preloaded
const preloadCache = new Set<string>();

/**
 * Preload a module using dynamic import with high priority
 * @param importPath Path to the module to preload
 * @param priority Whether to use high priority loading
 */
export function preloadModule(importPath: string, priority: boolean = false): Promise<any> {
    if (preloadCache.has(importPath)) {
        return Promise.resolve();
    }

    preloadCache.add(importPath);

    return new Promise((resolve) => {
        // Use requestIdleCallback in browsers that support it
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
                import(/* @vite-ignore */ importPath).then(resolve);
            }, { timeout: priority ? 500 : 2000 });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
                import(/* @vite-ignore */ importPath).then(resolve);
            }, priority ? 100 : 1000);
        }
    });
}

/**
 * Preload an image with specific dimensions
 * @param src Image source URL
 * @param priority Whether this is a high priority image
 */
export function preloadImage(src: string, priority: boolean = false): void {
    if (!src || typeof window === 'undefined') return;

    const linkEl = document.createElement('link');
    linkEl.rel = 'preload';
    linkEl.as = 'image';
    linkEl.href = src;

    if (priority) {
        linkEl.setAttribute('fetchpriority', 'high');
    }

    document.head.appendChild(linkEl);
}

/**
 * Preload a stylesheet
 * @param href URL of the stylesheet
 */
export function preloadStylesheet(href: string): void {
    if (!href || typeof window === 'undefined') return;

    const linkEl = document.createElement('link');
    linkEl.rel = 'preload';
    linkEl.as = 'style';
    linkEl.href = href;

    document.head.appendChild(linkEl);
}

/**
 * Preload all assets for a specific sport
 * @param sport The sport identifier (nba, nfl, mlb, nhl)
 */
export function preloadSportAssets(sport: 'nba' | 'nfl' | 'mlb' | 'nhl'): void {
    // Preload the sport-specific module
    preloadModule(`/src/features/sports/${sport}/${sport.toUpperCase()}Dashboard.tsx`, true);

    // Preload components likely to be needed
    preloadModule(`/src/features/sports/${sport}/components/Game${sport.toUpperCase()}Details.tsx`);
    preloadModule(`/src/features/sports/${sport}/components/${sport.toUpperCase()}Scoreboard.tsx`);

    // Preload sport-specific data hooks
    preloadModule(`/src/features/sports/${sport}/hooks/use${sport.toUpperCase()}Data.ts`);
}

/**
 * Preload assets based on user navigation patterns
 * @param currentPage The current page the user is viewing
 */
export function preloadBasedOnNavigation(currentPage: string): void {
    // If on the home page, preload the most popular sport
    if (currentPage === 'home') {
        preloadSportAssets('nba');
    }

    // If viewing a specific sport, preload details and other related components
    if (currentPage.includes('nba')) {
        preloadModule('/src/features/sports/nba/components/GameLeaders.tsx');
        preloadModule('/src/features/sports/nba/components/TeamStats.tsx');
    }

    if (currentPage.includes('nfl')) {
        preloadModule('/src/features/sports/nfl/components/GameStats.tsx');
        preloadModule('/src/features/sports/nfl/components/PlayerStats.tsx');
    }
}

/**
 * Hook to use in components to preload data for the next likely user action
 * @param currentSport Current sport being viewed
 * @param gamePhase Current phase of the game (pre, live, post)
 */
export function usePreloadStrategy(currentSport: string, gamePhase?: 'pre' | 'live' | 'post'): void {
    // Only run in the browser
    if (typeof window === 'undefined') return;

    // When viewing pre-game, preload live game components
    if (gamePhase === 'pre') {
        preloadModule(`/src/components/game/LiveGameTracker.tsx`);
    }

    // When viewing live game, preload post-game components
    if (gamePhase === 'live') {
        preloadModule(`/src/components/game/GameSummary.tsx`);
    }

    // When in post-game, preload the next likely games
    if (gamePhase === 'post') {
        // Preload the upcoming games content
        preloadModule(`/src/components/common/UpcomingGames.tsx`);
    }
} 