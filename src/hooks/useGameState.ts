import { useState, useEffect } from 'react';

export type GameState = 'pregame' | 'active' | 'halftime' | 'complete';

export function useGameState(gameId?: string) {
  const [gameState, setGameState] = useState<GameState>('pregame');
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const MIN_CHECK_INTERVAL = 10000; // 10 seconds

  useEffect(() => {
    if (!gameId) return;

    const checkGameState = async () => {
      const now = Date.now();
      if (now - lastUpdate < MIN_CHECK_INTERVAL) return;

      try {
        const response = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`
        );
        const data = await response.json();
        
        const status = data?.header?.competitions?.[0]?.status;
        const state = status?.type?.state;
        const period = status?.period || 0;
        const clock = status?.displayClock;

        let newState: GameState = 'pregame';

        if (state === 'post') {
          newState = 'complete';
        } else if (period === 2 && clock === '0:00') {
          newState = 'halftime';
        } else if (period > 0) {
          newState = 'active';
        }

        setGameState(newState);
        setLastUpdate(now);
      } catch (error) {
        console.error('Error checking game state:', error);
      }
    };

    checkGameState();
    const interval = setInterval(checkGameState, MIN_CHECK_INTERVAL);
    
    return () => clearInterval(interval);
  }, [gameId]);

  return gameState;
}