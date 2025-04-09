import { Game } from '../../types/game';
import { BaseApiService } from './BaseApiService';
import { transformNBAGameData } from '../transformers/nbaGameTransformer';
import { isNBAOffseason, getNextSeasonStartDate } from '../../utils/nbaSeasonUtils';
import { formatDate } from '../../utils/dateUtils';

/**
 * NBA API Service
 * Handles all NBA-specific API requests and data processing
 */
export class NBAApiService extends BaseApiService {
    constructor() {
        super('NBA', 'basketball/nba');
    }

    /**
     * Get the current NBA scoreboard data
     */
    public async getScoreboard(): Promise<Game[]> {
        try {
            if (isNBAOffseason()) {
                return this.getNextSeasonGames();
            }

            const now = new Date();
            const hour = now.getHours();

            // Get today's games first to check if there are any early games
            let todayEvents;
            try {
                todayEvents = await this.fetchScoreboard(now);
            } catch (error) {
                console.error('Error fetching today\'s games:', error);
                todayEvents = [];
            }

            // Before 5 PM, show yesterday's games unless there are games scheduled before 5 PM
            if (hour < 17) {
                const hasEarlyGames = todayEvents.some((event: any) => {
                    const gameTime = new Date(event.date);
                    return gameTime.getHours() < 17;
                });

                if (!hasEarlyGames) {
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);
                    try {
                        const yesterdayEvents = await this.fetchScoreboard(yesterday);
                        if (yesterdayEvents.length > 0) {
                            const games = await Promise.all(yesterdayEvents.map(this.enhanceWithGameDetails.bind(this)));
                            return Promise.all(games.map(transformNBAGameData));
                        }
                    } catch (error) {
                        console.error('Error fetching yesterday\'s games:', error);
                    }
                }
            }

            // Show today's games if we have them
            if (todayEvents.length > 0) {
                const games = await Promise.all(todayEvents.map(this.enhanceWithGameDetails.bind(this)));
                return Promise.all(games.map(transformNBAGameData));
            }

            // Only look for next day's games if it's late and we have no games today
            if (hour >= 23) {
                const nextGameDay = await this.findNextGameDay(now);
                if (nextGameDay) {
                    try {
                        const nextDayEvents = await this.fetchScoreboard(nextGameDay);
                        const games = await Promise.all(nextDayEvents.map(this.enhanceWithGameDetails.bind(this)));
                        const transformedGames = await Promise.all(games.map(transformNBAGameData));

                        return transformedGames.map(game => ({
                            ...game,
                            isUpcoming: true,
                            gameDate: formatDate(nextGameDay)
                        }));
                    } catch (error) {
                        console.error('Error fetching next game day:', error);
                    }
                }
            }

            return [];
        } catch (error) {
            console.error('NBA API Error:', error);
            return [];
        }
    }

    /**
     * Get NBA games for the next season's start date
     */
    private async getNextSeasonGames(): Promise<Game[]> {
        const seasonStartDate = getNextSeasonStartDate();
        try {
            const events = await this.fetchScoreboard(seasonStartDate);
            const games = await Promise.all(events.map(this.enhanceWithGameDetails.bind(this)));
            const transformedGames = await Promise.all(games.map(transformNBAGameData));

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
                boxScore: gameDetails.boxScore,
                leaders: gameDetails.leaders,
                stats: gameDetails.stats,
                situation: gameDetails.situation,
                gameInfo: gameDetails.header
            };
        } catch (error) {
            console.error('Error fetching NBA game stats:', error);
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
                boxScore: gameDetails.boxScore,
                stats: gameDetails.stats,
                leaders: gameDetails.leaders
            };
        } catch (error) {
            console.error('Error fetching game details:', error);
            return event;
        }
    }
}

// Export a singleton instance
export const nbaApiService = new NBAApiService(); 