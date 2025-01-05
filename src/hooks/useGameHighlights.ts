import { useState, useEffect } from 'react';
import { GameHighlight } from '../types/highlights';

export function useGameHighlights(gameId: string) {
  const [highlights, setHighlights] = useState<GameHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const response = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch highlights');
        }

        const data = await response.json();
        const plays = data.drives?.current?.plays || [];

        const gameHighlights = plays
          .filter((play: any) => play.scoringPlay || play.turnover)
          .map((play: any) => ({
            id: play.id,
            text: play.text,
            type: getScoringType(play),
            quarter: play.period?.number || '1',
            timeLeft: play.clock?.displayValue || '0:00',
            team: play.team?.abbreviation || ''
          }))
          .slice(-1); // Only show the most recent highlight

        setHighlights(gameHighlights);
        setError(null);
      } catch (err) {
        console.error('Error fetching highlights:', err);
        setError('Failed to load highlights');
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchHighlights();
      const interval = setInterval(fetchHighlights, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [gameId]);

  return { highlights, loading, error };
}

function getScoringType(play: any): GameHighlight['type'] {
  if (play.scoringPlay) {
    if (play.text.toLowerCase().includes('touchdown')) return 'touchdown';
    if (play.text.toLowerCase().includes('field goal')) return 'fieldgoal';
  }
  if (play.turnover) return 'turnover';
  return 'other';
}