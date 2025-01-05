import { useState, useEffect, useRef } from 'react';

export function useGameQuarter(gameId: string) {
  const [currentQuarter, setCurrentQuarter] = useState<string>('');
  const lastCheck = useRef<number>(0);
  const MIN_CHECK_INTERVAL = 10000; // 10 seconds
  
  useEffect(() => {
    if (!gameId) return;

    const checkQuarter = async () => {
      const now = Date.now();
      if (now - lastCheck.current < MIN_CHECK_INTERVAL) return;
      
      try {
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`);
        const data = await response.json();
        
        const quarter = data?.header?.competitions?.[0]?.status?.period?.toString() || '';
        if (quarter !== currentQuarter) {
          setCurrentQuarter(quarter);
        }
        lastCheck.current = now;
      } catch (error) {
        console.error('Error checking quarter:', error);
      }
    };

    const interval = setInterval(checkQuarter, MIN_CHECK_INTERVAL);
    checkQuarter();
    
    return () => clearInterval(interval);
  }, [gameId]);

  return currentQuarter;
}