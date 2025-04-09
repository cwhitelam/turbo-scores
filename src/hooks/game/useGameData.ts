import { useState, useEffect, useRef, DependencyList } from 'react';
import { Game } from '../../types/game';
import { Sport } from '../../types/sport';
import { PlayerStat } from '../../types/stats';
import { shouldResetSchedule, isGameFromPreviousWeek } from '../../utils/scheduleUtils';
import { getUpdateInterval } from '../../utils/updateIntervalUtils';

export interface GameStats {
    stats: PlayerStat[];
    timestamp: number;
    isComplete: boolean;
}

interface GameDataResult {
    games: Game[];
    isLoading: boolean;
    error: string | null;
}

interface SingleGameDataResult extends GameStats {
    isLoading: boolean;
    error: string | null;
}

export function useGameData(
    sport: Sport,
    fetchData: () => Promise<Game[]>,
    deps?: DependencyList
): GameDataResult;
export function useGameData(
    gameId: string | undefined,
    fetchStats: () => Promise<GameStats>,
    initialData: GameStats,
    deps?: DependencyList
): SingleGameDataResult;
export function useGameData(
    sportOrGameId: Sport | string | undefined,
    fetchDataOrStats: () => Promise<Game[] | GameStats>,
    initialDataOrDeps?: GameStats | DependencyList,
    depsForStats?: DependencyList
): GameDataResult | SingleGameDataResult {
    // Determine if we're in single game stats mode
    const isStatsMode = initialDataOrDeps && 'stats' in initialDataOrDeps;

    // Extract dependencies and initial data
    const initialData: GameStats | undefined = isStatsMode ? initialDataOrDeps as GameStats : undefined;
    const deps: DependencyList = isStatsMode
        ? depsForStats || [sportOrGameId]
        : (initialDataOrDeps as DependencyList) || [sportOrGameId];

    // Add ref to track the current sport
    const currentSportRef = useRef<string | null>(null);

    if (initialData) {
        // Single game stats mode
        const [stats, setStats] = useState<GameStats>(initialData);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        // Extract sport from deps if available
        const currentSport = deps?.[0] || null;

        useEffect(() => {
            if (!sportOrGameId) return;

            // Check for sport changes 
            const sportChanged = currentSportRef.current !== null &&
                currentSportRef.current !== currentSport;

            // Update the ref
            currentSportRef.current = currentSport as string;

            // If sport changed, clear stats immediately to prevent showing wrong sport data
            if (sportChanged) {
                console.log(`Sport changed from ${currentSportRef.current} to ${currentSport}, resetting stats`);
                setStats({ ...initialData });
            }

            const fetchStats = async () => {
                try {
                    console.log(`Fetching stats for ${sportOrGameId} in sport ${currentSport}`);
                    const data = await fetchDataOrStats() as GameStats;

                    // Double-check that the sport hasn't changed during fetch
                    if (currentSportRef.current !== currentSport) {
                        console.log(`Sport changed during fetch (${currentSportRef.current} vs ${currentSport}), discarding results`);
                        return;
                    }

                    setStats(data);
                    setError(null);
                } catch (err) {
                    setError('Failed to fetch game stats');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };

            setIsLoading(true);
            fetchStats();
            const intervalId = setInterval(fetchStats, 30000);

            return () => clearInterval(intervalId);
        }, deps);

        return { ...stats, isLoading, error };
    } else {
        // Multiple games mode
        const [games, setGames] = useState<Game[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        // Extract sport from deps
        const currentSport = deps?.[0] || null;

        useEffect(() => {
            let intervalId: NodeJS.Timeout;

            // Update the ref and check for sport changes
            const sportChanged = currentSportRef.current !== null &&
                currentSportRef.current !== currentSport;
            currentSportRef.current = currentSport as string;

            // If sport changed, clear games immediately
            if (sportChanged) {
                console.log(`Sport changed from ${currentSportRef.current} to ${currentSport}, resetting games list`);
                setGames([]);
            }

            const fetchGames = async () => {
                try {
                    console.log(`Fetching games for sport ${currentSport}`);
                    const data = await fetchDataOrStats() as Game[];

                    // Double-check sport hasn't changed during fetch
                    if (currentSportRef.current !== currentSport) {
                        console.log(`Sport changed during fetch (${currentSportRef.current} vs ${currentSport}), discarding results`);
                        return;
                    }

                    const filteredGames = shouldResetSchedule()
                        ? data.filter(game => !isGameFromPreviousWeek(game.startTime))
                        : data;

                    setGames(filteredGames);
                    setError(null);

                    if (intervalId) {
                        clearInterval(intervalId);
                    }
                    intervalId = setInterval(fetchGames, getUpdateInterval(filteredGames));
                } catch (err) {
                    setError(`Failed to fetch ${sportOrGameId} data`);
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };

            setIsLoading(true);
            fetchGames();

            return () => {
                if (intervalId) {
                    clearInterval(intervalId);
                }
            };
        }, deps);

        return { games, isLoading, error };
    }
} 