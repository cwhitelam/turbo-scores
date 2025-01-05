import { useState, useEffect } from 'react';
import { Game } from '../../../../types/game';
import { getScoreboard } from '../../../../services/nhlApi';
import { shouldResetSchedule, isGameFromPreviousWeek } from '../../../../utils/scheduleUtils';
import { getUpdateInterval } from '../../../../utils/updateIntervalUtils';

export function useNHLData() {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const fetchData = async () => {
            try {
                const data = await getScoreboard();

                // Filter out games from previous week if it's time to reset
                const filteredGames = shouldResetSchedule()
                    ? data.filter(game => !isGameFromPreviousWeek(game.startTime))
                    : data;

                setGames(filteredGames);
                setError(null);

                // Update interval based on current games state
                if (intervalId) {
                    clearInterval(intervalId);
                }
                intervalId = setInterval(fetchData, getUpdateInterval(filteredGames));
            } catch (err) {
                setError('Failed to fetch NHL data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchData();

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);

    return { games, loading, error };
} 