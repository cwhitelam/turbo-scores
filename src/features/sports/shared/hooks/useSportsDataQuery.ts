import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef, useCallback } from 'react';
import { Game } from '../../../../types/game';
import { Sport } from '../../../../types/sport';
import { getScoreboard } from '../../../../services/nflApi';
import { getMLBScoreboard } from '../../../../services/mlbApi';
import { getNBAScoreboard } from '../../../../services/nbaApi';
import { getNHLScoreboard } from '../../../../services/nhlApi';
import { getUpdateInterval } from '../../../../utils/updateIntervalUtils';

const STALE_TIME = 30000; // 30 seconds
const DEFAULT_INTERVAL = 30000; // 30 seconds
const INITIAL_FETCH_DELAY = 1000; // 1 second delay before first fetch
const UPDATE_DEBOUNCE = 1000; // 1 second minimum between updates

type UpdateState = {
    timestamp: number;
    data: Game[];
    updateCount: number;
    lastChangeId: string;
    lastScores: Map<string, { home: number; away: number }>;
};

export function useSportsDataQuery(sport: Sport) {
    // Define all refs first to maintain consistent hook order
    const updateStateRef = useRef<UpdateState>({
        timestamp: 0,
        data: [],
        updateCount: 0,
        lastChangeId: '',
        lastScores: new Map()
    });
    const isInitialLoadRef = useRef(true);
    const lastUpdateTimeRef = useRef(0);
    const initialFetchDoneRef = useRef(false);

    // Memoize callbacks before using them
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

    const hasScoreChanged = useCallback((prevGame: Game | undefined, newGame: Game): boolean => {
        if (!prevGame) return true;
        const prevScores = updateStateRef.current.lastScores.get(prevGame.id);
        const newHomeScore = Number(newGame.homeTeam.score);
        const newAwayScore = Number(newGame.awayTeam.score);

        if (!prevScores) return true;

        return prevScores.home !== newHomeScore || prevScores.away !== newAwayScore;
    }, []);

    const safeUpdate = useCallback((newData: Game[], changeId: string, changedGames: Game[]) => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

        // If this is a duplicate update or too soon, skip it
        if (changeId === updateStateRef.current.lastChangeId ||
            timeSinceLastUpdate < UPDATE_DEBOUNCE) {
            return;
        }

        // Update the score map
        const newScoreMap = new Map(updateStateRef.current.lastScores);
        changedGames.forEach(g => {
            newScoreMap.set(g.id, {
                home: g.homeTeam.score,
                away: g.awayTeam.score
            });
        });

        // Update state
        lastUpdateTimeRef.current = now;
        updateStateRef.current = {
            timestamp: now,
            data: newData,
            updateCount: updateStateRef.current.updateCount + 1,
            lastChangeId: changeId,
            lastScores: newScoreMap
        };
    }, [sport]);

    const fetchSportData = useCallback(async (): Promise<Game[]> => {
        if (!initialFetchDoneRef.current) {
            await new Promise(resolve => setTimeout(resolve, INITIAL_FETCH_DELAY));
            initialFetchDoneRef.current = true;
        }

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
            console.error(`Error fetching ${sport} data:`, error);
            throw error;
        }
    }, [sport]);

    const selectFn = useCallback((data: Game[]) => {
        // Normalize the data
        const normalizedData = normalizeData(data).map(game => ({
            ...game,
            gameSport: sport // Add explicit sport tracking to each game
        }));

        // Handle initial load
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            const scoreMap = new Map(
                normalizedData.map(g => [g.id, {
                    home: g.homeTeam.score,
                    away: g.awayTeam.score
                }])
            );
            updateStateRef.current = {
                timestamp: Date.now(),
                data: normalizedData,
                updateCount: 0,
                lastChangeId: '',
                lastScores: scoreMap
            };
            return normalizedData;
        }

        // Check for actual score changes
        const changedGames = normalizedData.filter((game, i) =>
            hasScoreChanged(updateStateRef.current.data[i], game)
        );

        if (changedGames.length === 0) {
            return updateStateRef.current.data;
        }

        // Generate a unique change ID based on the changed scores
        const changeId = changedGames
            .map(g => `${g.id}:${g.homeTeam.score}:${g.awayTeam.score}`)
            .sort()
            .join('|');

        // Try to update state
        safeUpdate(normalizedData, changeId, changedGames);

        // Return current data
        return updateStateRef.current.data;
    }, [normalizeData, hasScoreChanged, safeUpdate, sport]);

    const { data: games = [], isLoading, error } = useQuery<Game[], Error>({
        queryKey: ['sports', sport],
        queryFn: fetchSportData,
        staleTime: STALE_TIME,
        gcTime: 300000,
        refetchInterval: (query) => {
            const currentData = query.state.data as Game[] | undefined;
            if (!currentData?.length) return DEFAULT_INTERVAL;
            return getUpdateInterval(currentData);
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        notifyOnChangeProps: ['data'],
        structuralSharing: true,
        select: selectFn
    });

    return useMemo(() => ({
        games: games as Game[],
        loading: isLoading && !games.length,
        error: error ? error.message : null,
    }), [games, isLoading, error]);
} 