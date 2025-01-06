import { useQuery } from '@tanstack/react-query';
import type { QueryStatus } from '@tanstack/react-query';
import { Game } from '../types/game';
import { Sport } from '../types/sport';
import { getScoreboard } from '../services/nflApi';
import { getMLBScoreboard } from '../services/mlbApi';
import { getNBAScoreboard } from '../services/nbaApi';
import { getNHLScoreboard } from '../services/nhlApi';
import { getUpdateInterval } from '../utils/updateIntervalUtils';

const STALE_TIME = 10000; // 10 seconds
const DEFAULT_INTERVAL = 30000; // 30 seconds
const INITIAL_FETCH_DELAY = 1000; // 1 second delay before first fetch

export function useSportsDataQuery(sport: Sport) {
    const fetchSportData = async (): Promise<Game[]> => {
        // Add a small delay on initial fetch to prevent multiple rapid retries
        if (!fetchSportData.initialFetchDone) {
            await new Promise(resolve => setTimeout(resolve, INITIAL_FETCH_DELAY));
            fetchSportData.initialFetchDone = true;
        }

        console.log(`[Query] Fetching ${sport} data at ${new Date().toLocaleTimeString()}`);

        try {
            let data: Game[];
            switch (sport) {
                case 'NFL':
                    data = await getScoreboard();
                    break;
                case 'MLB':
                    data = await getMLBScoreboard();
                    break;
                case 'NBA':
                    data = await getNBAScoreboard();
                    break;
                case 'NHL':
                    data = await getNHLScoreboard();
                    break;
                default:
                    throw new Error(`Unsupported sport: ${sport}`);
            }

            if (data.length > 0) {
                console.log(`[Query] Received ${data.length} ${sport} games`);
            }
            return data;
        } catch (error) {
            console.error(`[Query] Error fetching ${sport} data:`, error);
            throw error;
        }
    };
    // Add the flag to the function
    fetchSportData.initialFetchDone = false;

    const { data: games = [], isLoading, error } = useQuery<Game[], Error>({
        queryKey: ['sports', sport],
        queryFn: fetchSportData,
        staleTime: STALE_TIME,
        gcTime: 300000, // 5 minutes garbage collection time
        refetchInterval: (query) => {
            const currentData = query.state.data as Game[] | undefined;
            if (!currentData?.length) {
                // Only log this message on initial load
                const status = query.state.status as QueryStatus;
                if (status === 'loading') {
                    console.log(`[Query] Waiting for initial ${sport} data...`);
                }
                return DEFAULT_INTERVAL;
            }
            const interval = getUpdateInterval(currentData);
            console.log(`[Query] Next update for ${sport} in ${interval}ms`);
            return interval;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Only log state changes when something meaningful changes
    const hasGames = games.length > 0;
    const hasError = !!error;

    if (isLoading || hasError || hasGames) {
        console.log(`[Query] ${sport} state:`, {
            gamesCount: games.length,
            isLoading,
            hasError
        });
    }

    return {
        games,
        loading: isLoading,
        error: error ? error.message : null,
    };
} 