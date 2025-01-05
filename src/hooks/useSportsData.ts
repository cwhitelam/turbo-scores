import { useState, useEffect } from 'react';
import { Game } from '../types/game';
import { Sport } from '../types/sport';
import { getScoreboard } from '../services/nflApi';
import { getMLBScoreboard } from '../services/mlbApi';
import { getNBAScoreboard } from '../services/nbaApi';
import { getNHLScoreboard } from '../services/nhlApi';
import { getUpdateInterval } from '../utils/updateIntervalUtils';

export function useSportsData(sport: Sport) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
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

        if (!mounted) return;

        setGames(data);
        setError(null);

        if (intervalId) {
          clearInterval(intervalId);
        }
        intervalId = setInterval(fetchData, getUpdateInterval(data));
      } catch (err) {
        if (!mounted) return;
        console.error(`${sport} data fetch error:`, err);
        setError(`Failed to fetch ${sport} data`);
        setGames([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [sport]);

  return { games, loading, error };
}