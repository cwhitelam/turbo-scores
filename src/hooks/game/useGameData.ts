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
    if (initialData) {
        // Single game stats mode
        const [stats, setStats] = useState<GameStats>(initialData);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
            if (!sportOrGameId) return;

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
            const intervalId = setInterval(fetchStats, 30000);

            return () => clearInterval(intervalId);
        }, [sportOrGameId, fetchDataOrStats]);

        return { ...stats, isLoading, error };
    } else {
        // Multiple games mode
        const [games, setGames] = useState<Game[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
            let intervalId: NodeJS.Timeout;

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

            return () => {
                if (intervalId) {
                    clearInterval(intervalId);
                }
            };
        }, [sportOrGameId, fetchDataOrStats]);

        return { games, isLoading, error };
    }
} 