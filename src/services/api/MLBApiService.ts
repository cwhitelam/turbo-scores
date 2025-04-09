import { Game } from '../../types/game';
import { BaseApiService } from './BaseApiService';
import { transformMLBGameData } from '../transformers/mlbGameTransformer';
import { isMLBOffseason, getNextSeasonStartDate } from '../../utils/mlbSeasonUtils';
import { formatDate } from '../../utils/dateUtils';

/**
 * MLB API Service
 * Handles all MLB-specific API requests and data processing
 */
export class MLBApiService extends BaseApiService {
    constructor() {
        super('MLB', 'baseball/mlb');
    }

    /**
     * Get the current MLB scoreboard data
     */
    public async getScoreboard(): Promise<Game[]> {
        try {
            // Check if we're in the offseason
            if (isMLBOffseason()) {
                return this.getNextSeasonGames();
            }

            // Try to get today's games first
            const now = new Date();
            let todayEvents;
            try {
                todayEvents = await this.fetchScoreboard(now);
            } catch (error) {
                console.error('Error fetching today\'s games:', error);
                todayEvents = [];
            }

            // Show today's games if we have them
            if (todayEvents.length > 0) {
                const games = await Promise.all(todayEvents.map(transformMLBGameData));
                return games;
            }

            // If no games today, get the next game day
            const nextGameDay = await this.findNextGameDay(now);
            if (nextGameDay) {
                try {
                    const nextDayEvents = await this.fetchScoreboard(nextGameDay);
                    const games = await Promise.all(nextDayEvents.map(transformMLBGameData));
                    return games.map(game => ({
                        ...game,
                        isUpcoming: true,
                        gameDate: formatDate(nextGameDay)
                    }));
                } catch (error) {
                    console.error('Error fetching next game day:', error);
                }
            }

            return [];
        } catch (error) {
            console.error('MLB API Error:', error);
            return [];
        }
    }

    /**
     * Get MLB games for the next season's start date
     */
    private async getNextSeasonGames(): Promise<Game[]> {
        const seasonStartDate = getNextSeasonStartDate();
        try {
            const events = await this.fetchScoreboard(seasonStartDate);
            const games = await Promise.all(events.map(transformMLBGameData));
            return games.map(game => ({
                ...game,
                isUpcoming: true,
                gameDate: formatDate(seasonStartDate),
                isSeasonOpener: true
            }));
        } catch (error) {
            console.error('Error fetching next season games:', error);
            return [];
        }
    }

    /**
     * Fetch detailed stats for a specific game
     */
    public async getGameStats(gameId: string): Promise<any> {
        try {
            const gameDetails = await this.fetchGameDetails(gameId);
            return {
                plays: gameDetails.plays,
                leaders: gameDetails.leaders,
                boxscore: gameDetails.boxscore,
                gameInfo: gameDetails.header
            };
        } catch (error) {
            console.error('Error fetching MLB game stats:', error);
            return null;
        }
    }
}

// Export a singleton instance
export const mlbApiService = new MLBApiService(); 