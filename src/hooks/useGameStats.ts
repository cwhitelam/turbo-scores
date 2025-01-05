import { useState, useEffect } from 'react';
import { GameStats } from '../types/stats';

export function useGameStats(gameId: string) {
  const [stats, setStats] = useState<GameStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`
        );

        if (!response.ok) return;

        const data = await response.json();
        const stats: GameStats = {};

        // Get player stats from the boxscore
        const players = data.boxscore?.players?.[0]?.statistics || [];

        // Find passing leader
        const passing = players.find((stat: any) => stat.name === "passing");
        if (passing?.leaders?.[0]) {
          const leader = passing.leaders[0];
          const displayValue = leader.displayValue || '';
          const [attempts, yards, tds, ints] = displayValue.match(/\d+/g) || [];

          stats.passer = {
            name: leader.athlete.shortName,
            stat: `${yards} YDS`,
            detail: `${tds} TD${tds !== '1' ? 's' : ''}, ${ints} INT${ints !== '1' ? 's' : ''}`,
            team: leader.team.abbreviation
          };
        }

        // Find rushing leader
        const rushing = players.find((stat: any) => stat.name === "rushing");
        if (rushing?.leaders?.[0]) {
          const leader = rushing.leaders[0];
          const displayValue = leader.displayValue || '';
          const [carries, yards, tds] = displayValue.match(/\d+/g) || [];

          stats.rusher = {
            name: leader.athlete.shortName,
            stat: `${yards} YDS`,
            detail: tds ? `${tds} TD${tds !== '1' ? 's' : ''}` : undefined,
            team: leader.team.abbreviation
          };
        }

        // Find receiving leader
        const receiving = players.find((stat: any) => stat.name === "receiving");
        if (receiving?.leaders?.[0]) {
          const leader = receiving.leaders[0];
          const displayValue = leader.displayValue || '';
          const [receptions, yards, tds] = displayValue.match(/\d+/g) || [];

          stats.receiver = {
            name: leader.athlete.shortName,
            stat: `${yards} YDS`,
            detail: `${receptions} REC${tds ? `, ${tds} TD${tds !== '1' ? 's' : ''}` : ''}`,
            team: leader.team.abbreviation
          };
        }

        setStats(stats);
      } catch (err) {
        console.error('Error fetching game stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchStats();
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [gameId]);

  return { stats, loading };
}