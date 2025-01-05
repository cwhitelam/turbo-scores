import { useState, useEffect } from 'react';
import { WinProbability } from '../types/game';
import { getGameWinProbability } from '../services/espnApi';

const POLL_INTERVAL = 60000; // 1 minute

export function useWinProbability(gameId: string) {
  const [probability, setProbability] = useState<WinProbability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let pollInterval: NodeJS.Timeout;

    const fetchProbability = async () => {
      if (!gameId) return;

      try {
        setLoading(true);
        const data = await getGameWinProbability(gameId);
        
        if (!mounted) return;

        if (data) {
          setProbability(data);
          setError(null);
        } else {
          // If we get null back, clear the probability but don't show an error
          setProbability(null);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Win probability error:', err);
        setProbability(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProbability();

    // Only poll if we have a game ID
    if (gameId) {
      pollInterval = setInterval(fetchProbability, POLL_INTERVAL);
    }

    return () => {
      mounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [gameId]);

  return { probability, loading, error };
}