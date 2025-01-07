import { Game } from '../types/game';

/**
 * Determines whether to show previous day's games based on current time and scheduled games
 * @param currentGames - Array of games scheduled for today
 * @returns boolean indicating whether to show previous day's games
 */
export function shouldShowPreviousDayGames(currentGames: Game[]): boolean {
    const now = new Date();
    const hour = now.getHours();

    // Always show previous day's games before 5 AM
    if (hour < 5) {
        return true;
    }

    // Between 5 AM and 5 PM, show previous day's games only if no games are scheduled before 5 PM
    if (hour >= 5 && hour < 17) {
        const hasEarlyGames = currentGames.some(game => {
            const gameTime = new Date(game.startTime);
            return gameTime.getHours() < 17;
        });
        return !hasEarlyGames;
    }

    // After 5 PM, only show today's games
    return false;
}

/**
 * Gets the date for which games should be shown
 * @param currentGames - Array of games scheduled for today
 * @returns Date object for the day to show games from
 */
export function getTargetGameDate(currentGames: Game[]): Date {
    const now = new Date();
    if (shouldShowPreviousDayGames(currentGames)) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
    }
    return now;
} 