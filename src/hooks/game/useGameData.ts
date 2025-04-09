import { useState, useEffect } from 'react';
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
    fetchData: () => Promise<Game[]>
): GameDataResult;
export function useGameData(
    gameId: string | undefined,
    fetchStats: () => Promise<GameStats>,
    initialData: GameStats
): SingleGameDataResult;
export function useGameData(
    sportOrGameId: Sport | string | undefined,
    fetchDataOrStats: () => Promise<Game[] | GameStats>,
    initialData?: GameStats
): GameDataResult | SingleGameDataResult {
    // Initialize all state variables unconditionally
    const [games, setGames] = useState<Game[]>([]);
    const [stats, setStats] = useState<GameStats>(initialData || { stats: [], timestamp: 0, isComplete: false });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Determine which mode we're in
    const isSingleGameMode = !!initialData;

    useEffect(() => {
        if (!sportOrGameId) return;

        let intervalId: NodeJS.Timeout;

        if (isSingleGameMode) {
            // Single game stats mode
            const fetchStats = async () => {
                try {
                    const data = await fetchDataOrStats() as GameStats;
                    setStats(data);
                    setError(null);
                } catch (err) {
                    setError('Failed to fetch game stats');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchStats();
            intervalId = setInterval(fetchStats, 30000);
        } else {
            // Multiple games mode
            const fetchGames = async () => {
                try {
                    const data = await fetchDataOrStats() as Game[];
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

            fetchGames();
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [sportOrGameId, fetchDataOrStats, isSingleGameMode]);

    // Return the appropriate result based on the mode
    if (isSingleGameMode) {
        return { ...stats, isLoading, error };
    } else {
        return { games, isLoading, error };
    }
} 