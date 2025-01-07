import { useState, useEffect } from 'react';
import { GameStats } from '../types/game';
import { useSport } from '../context/SportContext';

const SPORT_ENDPOINTS = {
  NFL: 'football/nfl',
  NBA: 'basketball/nba',
  MLB: 'baseball/mlb',
  NHL: 'hockey/nhl'
} as const;

export function useGameStats(gameId: string) {
  const [stats, setStats] = useState<GameStats>({});
  const [loading, setLoading] = useState(true);
  const { currentSport } = useSport();

  useEffect(() => {
    if (!gameId) {
      console.log('🔍 No gameId provided');
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const endpoint = SPORT_ENDPOINTS[currentSport];
        if (!endpoint) {
          console.error(`❌ Unsupported sport: ${currentSport}`);
          return;
        }

        const url = `https://site.api.espn.com/apis/site/v2/sports/${endpoint}/summary?event=${gameId}`;
        console.log(`🔄 Fetching stats from: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
          console.error(`❌ Failed to fetch stats: ${response.status}`);
          return;
        }

        const data = await response.json();
        console.log('📊 Raw API response:', data);

        const stats: GameStats = {};

        switch (currentSport) {
          case 'NFL': {
            // Get player stats from the boxscore
            const players = data.boxscore?.players?.[0]?.statistics || [];
            console.log('🏈 NFL Players stats:', players);

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
            break;
          }

          case 'NBA': {
            // Get leaders from both teams
            const teamLeaders = data.leaders || [];
            console.log('🏀 NBA Leaders:', teamLeaders);

            if (!teamLeaders || teamLeaders.length === 0) {
              console.log('⚠️ No leaders data available');
              break;
            }

            // Find the highest value for each category across both teams
            let topScorer: any = null;
            let topRebounder: any = null;
            let topAssister: any = null;

            teamLeaders.forEach((team: any) => {
              team.leaders.forEach((category: any) => {
                const leader = category.leaders[0];
                if (!leader) return;

                const value = parseInt(leader.displayValue);

                switch (category.name) {
                  case 'points': {
                    if (!topScorer || value > parseInt(topScorer.displayValue)) {
                      topScorer = leader;
                    }
                    break;
                  }
                  case 'rebounds': {
                    if (!topRebounder || value > parseInt(topRebounder.displayValue)) {
                      topRebounder = leader;
                    }
                    break;
                  }
                  case 'assists': {
                    if (!topAssister || value > parseInt(topAssister.displayValue)) {
                      topAssister = leader;
                    }
                    break;
                  }
                }
              });
            });

            if (topScorer) {
              stats.scorer = {
                name: topScorer.athlete.shortName,
                stat: `${topScorer.displayValue} PTS`,
                team: topScorer.athlete.team.abbreviation,
                headshot: topScorer.athlete.headshot?.href
              };
            }

            if (topRebounder) {
              stats.rebounder = {
                name: topRebounder.athlete.shortName,
                stat: `${topRebounder.displayValue} REB`,
                team: topRebounder.athlete.team.abbreviation,
                headshot: topRebounder.athlete.headshot?.href
              };
            }

            if (topAssister) {
              stats.assister = {
                name: topAssister.athlete.shortName,
                stat: `${topAssister.displayValue} AST`,
                team: topAssister.athlete.team.abbreviation,
                headshot: topAssister.athlete.headshot?.href
              };
            }

            console.log('🏀 Final NBA Stats:', stats);
            break;
          }

          case 'MLB': {
            // TODO: Implement MLB stats
            break;
          }

          case 'NHL': {
            // TODO: Implement NHL stats
            break;
          }
        }

        setStats(stats);
      } catch (err) {
        console.error('❌ Error fetching game stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [gameId, currentSport]);

  return { stats, loading };
}