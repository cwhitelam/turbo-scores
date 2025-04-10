import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Game } from '../../../../types/game';
import { Sport } from '../../../../types/sport';
import { getScoreboard } from '../../../../services/nflApi';
import { getMLBScoreboard } from '../../../../services/mlbApi';
import { getNBAScoreboard } from '../../../../services/nbaApi';
import { getNHLScoreboard } from '../../../../services/nhlApi';

// Constants for query configuration
const STALE_TIME = 30000; // 30 seconds
const DEFAULT_INTERVAL = 30000; // 30 seconds

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Simplified hook that fetches and manages sports data
 */
export function useSportsDataQuery(sport: Sport) {
    const [prevSport, setPrevSport] = useState<Sport>(sport);

    // Reset when sport changes
    useEffect(() => {
        if (prevSport !== sport) {
            setPrevSport(sport);
        }
    }, [sport, prevSport]);

    // Simple fetch function without the complex state management
    const fetchSportData = useCallback(async (): Promise<Game[]> => {
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
            return data;
        } catch (error) {
            // Only log errors in development mode
            if (isDevelopment) {
                console.error(`Error fetching ${sport} data:`, error);
            }
            throw error;
        }
    }, [sport]);

    // Normalize data
    const normalizeData = useCallback((data: Game[]): Game[] => {
        return data.map(game => ({
            ...game,
            id: game.id,
            homeTeam: {
                ...game.homeTeam,
                score: Number(game.homeTeam.score),
            },
            awayTeam: {
                ...game.awayTeam,
                score: Number(game.awayTeam.score),
            }
        }));
    }, []);

    // Simplified query with minimal options
    const { data = [], isLoading, error } = useQuery({
        queryKey: ['sports', sport],
        queryFn: fetchSportData,
        staleTime: STALE_TIME,
        refetchInterval: DEFAULT_INTERVAL,
        select: normalizeData,
        // Keep these options minimal
        gcTime: 300000,
        retry: 2,
        retryDelay: 1000
    });

    return useMemo(() => ({
        games: data as Game[],
        loading: isLoading,
        error: error ? (error as Error).message : null,
    }), [data, isLoading, error]);
} 