import { logger } from '../../utils/loggingUtils';
import { apiCacheService, ApiCacheOptions } from '../cache/apiCacheService';
import { formatDate } from '../../utils/dateUtils';

/**
 * Base API Service that provides common functionality for all sport-specific API services
 */
export abstract class BaseApiService {
    protected baseUrl: string;
    protected sportType: string;
    protected apiPath: string;

    constructor(sportType: string, apiPath: string) {
        this.baseUrl = 'https://site.api.espn.com/apis/site/v2/sports';
        this.sportType = sportType;
        this.apiPath = apiPath;
    }

    /**
     * Get the scoreboard data for a specific date
     */
    protected async fetchScoreboard(date: Date, cacheOptions?: ApiCacheOptions): Promise<any> {
        const formattedDate = formatDate(date);
        const endpoint = `${this.apiPath}/scoreboard`;
        const url = `${this.baseUrl}/${this.apiPath}/scoreboard?dates=${formattedDate}&limit=100`;

        try {
            return await apiCacheService.cacheGameData(
                endpoint + ':' + formattedDate,
                async () => {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`${this.sportType} API HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    if (!data?.events) {
                        throw new Error('Invalid API response: missing events data');
                    }

                    return data.events;
                },
                cacheOptions
            );
        } catch (error) {
            logger.error(`${this.sportType} scoreboard API error:`, error);
            throw error;
        }
    }

    /**
     * Get detailed game data for a specific game
     */
    protected async fetchGameDetails(gameId: string, cacheOptions?: ApiCacheOptions): Promise<any> {
        const endpoint = `${this.apiPath}/game/${gameId}`;
        const url = `${this.baseUrl}/${this.apiPath}/summary?event=${gameId}`;

        try {
            return await apiCacheService.cacheGameData(
                endpoint,
                async () => {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`${this.sportType} game details API error! status: ${response.status}`);
                    }

                    return response.json();
                },
                cacheOptions
            );
        } catch (error) {
            logger.error(`${this.sportType} game details API error:`, error);
            throw error;
        }
    }

    /**
     * Format a date for API requests
     */
    protected formatDateForApi(date: Date): string {
        return formatDate(date);
    }

    /**
     * Find the next date with games scheduled
     * @param startDate Date to start searching from
     * @param maxDays Maximum number of days to look ahead
     */
    protected async findNextGameDay(startDate: Date, maxDays: number = 7): Promise<Date | null> {
        const searchDate = new Date(startDate);

        for (let i = 1; i <= maxDays; i++) {
            searchDate.setDate(startDate.getDate() + i);
            try {
                const events = await this.fetchScoreboard(searchDate);
                if (events && events.length > 0) {
                    return searchDate;
                }
            } catch (error) {
                console.error(`Error searching for next game day:`, error);
            }
        }

        return null;
    }
} 