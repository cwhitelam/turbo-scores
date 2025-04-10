import { useQuery } from '@tanstack/react-query';
import { Game } from '../types/game';
import { Sport } from '../types/sport';
import { getScoreboard } from '../services/nflApi';
import { getMLBScoreboard } from '../services/mlbApi';
import { getNBAScoreboard } from '../services/nbaApi';
import { getNHLScoreboard } from '../services/nhlApi';
import { getUpdateInterval } from '../utils/updateIntervalUtils';
import { useMemo, useRef, useCallback, useEffect } from 'react';
import { debugLog, appMetrics } from '../utils/debugUtils';

// Constants for query configuration
const STALE_TIME = 30000; // 30 seconds
const DEFAULT_INTERVAL = 30000; // 30 seconds
const INITIAL_FETCH_DELAY = 1000; // 1 second delay before first fetch
const UPDATE_DEBOUNCE = 1000; // 1 second minimum between updates

// Enable/disable debug logging
const DEBUG = import.meta.env.VITE_FEATURE_DEBUG_MODE === 'true';

type UpdateState = {
    timestamp: number;
    data: Game[];
    updateCount: number;
    lastChangeId: string;
    lastScores: Map<string, { home: number; away: number }>;
    pollingStats: {
        lastPollTime: number;
        averageInterval: number;
        pollCount: number;
        intervalHistory: number[];
    };
};

/**
 * Custom hook that fetches and manages sports data with optimized polling
 */
export function useSportsDataQuery(sport: Sport) {
    console.log(`[useSportsDataQuery] Hook called with sport: ${sport}`);

    // Define all refs first to maintain consistent hook order
    const updateStateRef = useRef<UpdateState>({
        timestamp: 0,
        data: [],
        updateCount: 0,
        lastChangeId: '',
        lastScores: new Map(),
        pollingStats: {
            lastPollTime: 0,
            averageInterval: DEFAULT_INTERVAL,
            pollCount: 0,
            intervalHistory: []
        }
    });
    const isInitialLoadRef = useRef(true);
    const lastUpdateTimeRef = useRef(0);
    const initialFetchDoneRef = useRef(false);
    const backgroundRef = useRef(false);
    const queryStartTimeRef = useRef(Date.now());
    const prevSportRef = useRef<Sport>(sport);

    // Reset state when sport changes
    useEffect(() => {
        if (prevSportRef.current !== sport) {
            console.log(`[useSportsDataQuery] Sport changed from ${prevSportRef.current} to ${sport} - RESETTING STATE`);
            console.log(`[useSportsDataQuery] Prior data count: ${updateStateRef.current.data.length}`);

            // Clear all data when switching sports to prevent contamination
            updateStateRef.current = {
                timestamp: 0,
                data: [],
                updateCount: 0,
                lastChangeId: '',
                lastScores: new Map(),
                pollingStats: {
                    lastPollTime: 0,
                    averageInterval: DEFAULT_INTERVAL,
                    pollCount: 0,
                    intervalHistory: []
                }
            };
            isInitialLoadRef.current = true;
            lastUpdateTimeRef.current = 0;
            initialFetchDoneRef.current = false;
            queryStartTimeRef.current = Date.now();
            debugLog(`Sport changed from ${prevSportRef.current} to ${sport}, state reset`);
            prevSportRef.current = sport;
            console.log(`[useSportsDataQuery] After reset - data count: ${updateStateRef.current.data.length}`);
        }
    }, [sport]);

    // Listen for visibility changes to detect when app is in background
    useEffect(() => {
        const handleVisibilityChange = () => {
            const isHidden = document.hidden;
            debugLog(`App ${isHidden ? 'hidden' : 'visible'}, adjusting polling...`);
            backgroundRef.current = isHidden;
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Log initial startup
        debugLog(`${sport} data query initialized`);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            // Log metrics when unmounting
            if (DEBUG) {
                const uptime = Math.round((Date.now() - queryStartTimeRef.current) / 1000);
                debugLog(`${sport} query unmounted after ${uptime}s, stats:`, updateStateRef.current.pollingStats);
                appMetrics.polling.logStats(`${sport} polling metrics`);
            }
        };
    }, [sport]);

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

        // Update polling stats
        const stats = updateStateRef.current.pollingStats;
        const pollInterval = now - stats.lastPollTime;
        const newIntervalHistory = [...stats.intervalHistory, pollInterval].slice(-10); // Keep last 10 intervals

        const updatedStats = {
            lastPollTime: now,
            pollCount: stats.pollCount + 1,
            intervalHistory: newIntervalHistory,
            averageInterval: newIntervalHistory.reduce((sum, val) => sum + val, 0) / newIntervalHistory.length || DEFAULT_INTERVAL
        };

        if (changedGames.length > 0) {
            debugLog(`Score update (${sport}): ${changedGames.length} games changed, interval: ${Math.round(pollInterval / 1000)}s`);

            // Log details about changed games for debugging
            if (DEBUG) {
                changedGames.forEach(game => {
                    const prevScores = updateStateRef.current.lastScores.get(game.id);
                    debugLog(`  Game ${game.id}: ${game.awayTeam.abbreviation} vs ${game.homeTeam.abbreviation} - Score changed from ${prevScores?.away ?? '?'}-${prevScores?.home ?? '?'} to ${game.awayTeam.score}-${game.homeTeam.score}`);
                });
            }
        }

        // Update state
        lastUpdateTimeRef.current = now;
        updateStateRef.current = {
            timestamp: now,
            data: newData,
            updateCount: updateStateRef.current.updateCount + 1,
            lastChangeId: changeId,
            lastScores: newScoreMap,
            pollingStats: updatedStats
        };
    }, [sport]);

    const fetchSportData = useCallback(async (): Promise<Game[]> => {
        console.log(`[useSportsDataQuery] Fetching data for sport: ${sport}`);

        if (!initialFetchDoneRef.current) {
            await new Promise(resolve => setTimeout(resolve, INITIAL_FETCH_DELAY));
            initialFetchDoneRef.current = true;
        }

        // Track fetch timing for analytics
        const fetchStart = Date.now();

        // Record this poll in app-wide metrics
        appMetrics.polling.recordPoll();

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

            const fetchTime = Date.now() - fetchStart;
            console.log(`[useSportsDataQuery] ${sport} data fetched: ${data.length} games`);
            if (data.length > 0) {
                console.log(`[useSportsDataQuery] First game sample:`, {
                    id: data[0].id,
                    homeTeam: data[0].homeTeam?.name,
                    homeAbbr: data[0].homeTeam?.abbreviation,
                    awayTeam: data[0].awayTeam?.name,
                    awayAbbr: data[0].awayTeam?.abbreviation
                });
            }

            debugLog(`${sport} data fetched in ${fetchTime}ms, ${data.length} games`);

            return data;
        } catch (error) {
            console.error(`Error fetching ${sport} data:`, error);
            throw error;
        }
    }, [sport]);

    const selectFn = useCallback((data: Game[]) => {
        console.log(`[useSportsDataQuery] Select function called for ${sport} with ${data.length} games`);

        // Normalize the data
        const normalizedData = normalizeData(data);

        // Handle initial load
        if (isInitialLoadRef.current) {
            console.log(`[useSportsDataQuery] Initial load for ${sport}`);
            isInitialLoadRef.current = false;
            const scoreMap = new Map(
                normalizedData.map(g => [g.id, {
                    home: g.homeTeam.score,
                    away: g.awayTeam.score
                }])
            );
            updateStateRef.current = {
                ...updateStateRef.current,
                timestamp: Date.now(),
                data: normalizedData,
                updateCount: 0,
                lastChangeId: '',
                lastScores: scoreMap,
            };
            return normalizedData;
        }

        // Check for actual score changes
        const changedGames = normalizedData.filter((game, i) => {
            const origGame = updateStateRef.current.data[i];
            return origGame ? hasScoreChanged(origGame, game) : true;
        });

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
    }, [normalizeData, hasScoreChanged, safeUpdate]);

    // Calculate dynamic refetch interval based on game state and app visibility
    const getRefetchInterval = useCallback((query: any) => {
        const currentData = query.state.data as Game[] | undefined;
        if (!currentData?.length) return DEFAULT_INTERVAL;

        // Get base interval from the update interval utility
        let interval = getUpdateInterval(currentData);

        // If app is in background, we can be more conservative with updates
        if (backgroundRef.current) {
            // When in background, poll at most once per minute, or less frequently
            interval = Math.max(interval * 2, 60000);

            debugLog(`App in background, increased interval to ${Math.round(interval / 1000)}s for ${sport}`);
        }

        return interval;
    }, [sport]);

    const { data: games = [], isLoading, error } = useQuery<Game[], Error>({
        queryKey: ['sports', sport],
        queryFn: fetchSportData,
        staleTime: STALE_TIME,
        gcTime: 300000,
        refetchInterval: getRefetchInterval,
        refetchOnWindowFocus: true,
        refetchOnMount: false,
        refetchOnReconnect: true,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        notifyOnChangeProps: ['data'],
        structuralSharing: true,
        select: selectFn
    });

    // Ensure data is properly reset when sport changes
    useEffect(() => {
        return () => {
            // This cleanup will run when sport changes or component unmounts
            // It helps ensure the next sport doesn't see cached data
            if (DEBUG) {
                debugLog(`Cleaning up query for ${sport}`);
            }
        };
    }, [sport]);

    return useMemo(() => ({
        games: games as Game[],
        loading: isLoading && !games.length,
        error: error ? error.message : null,
    }), [games, isLoading, error]);
} 