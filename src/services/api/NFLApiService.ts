import { Game } from '../../types/game';
import { BaseApiService } from './BaseApiService';
import { transformGameData } from '../transformers/gameTransformer';
import { isNFLOffseason, getNextSeasonStartDate } from '../../utils/nflSeasonUtils';
import { formatDate } from '../../utils/dateUtils';

/**
 * NFL API Service
 * Handles all NFL-specific API requests and data processing
 */
export class NFLApiService extends BaseApiService {
    constructor() {
        super('NFL', 'football/nfl');
    }

    /**
     * Get the current NFL scoreboard data
     */
    public async getScoreboard(): Promise<Game[]> {
        try {
            if (isNFLOffseason()) {
                return this.getNextSeasonGames();
            }

            const now = new Date();

            // Get today's games first
            let todayEvents;
            try {
                todayEvents = await this.fetchScoreboard(now);
            } catch (error) {
                console.error('Error fetching today\'s games:', error);
                todayEvents = [];
            }

            // NFL games are typically on Sunday, Monday and Thursday
            if (todayEvents.length > 0) {
                const games = await Promise.all(todayEvents.map(this.enhanceWithGameDetails.bind(this)));
                return Promise.all(games.map(transformGameData));
            }

            // Try to find the next game day
            const nextGameDay = await this.findNextGameDay(now);
            if (nextGameDay) {
                try {
                    const nextDayEvents = await this.fetchScoreboard(nextGameDay);
                    const games = await Promise.all(nextDayEvents.map(this.enhanceWithGameDetails.bind(this)));
                    const transformedGames = await Promise.all(games.map(transformGameData));

                    return transformedGames.map(game => ({
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
            console.error('NFL API Error:', error);
            return [];
        }
    }

    /**
     * Get NFL games for the next season's start date
     */
    private async getNextSeasonGames(): Promise<Game[]> {
        const seasonStartDate = getNextSeasonStartDate();
        try {
            const events = await this.fetchScoreboard(seasonStartDate);
            const games = await Promise.all(events.map(this.enhanceWithGameDetails.bind(this)));
            const transformedGames = await Promise.all(games.map(transformGameData));

            return transformedGames.map(game => ({
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
                drives: gameDetails.drives,
                leaders: gameDetails.leaders,
                stats: gameDetails.stats,
                situation: gameDetails.situation,
                gameInfo: gameDetails.header
            };
        } catch (error) {
            console.error('Error fetching NFL game stats:', error);
            return null;
        }
    }

    /**
     * Enhance basic game data with detailed information
     */
    private async enhanceWithGameDetails(event: any): Promise<any> {
        try {
            const gameDetails = await this.fetchGameDetails(event.id);
            return {
                ...event,
                drives: gameDetails.drives,
                leaders: gameDetails.leaders,
                stats: gameDetails.stats
            };
        } catch (error) {
            console.error('Error fetching game details:', error);
            return event;
        }
    }
}

// Export a singleton instance
export const nflApiService = new NFLApiService(); 