import { useState, useEffect } from 'react';
import { NBALeaderCategory } from '../types/gameStats';

interface UseNBAGameLeadersResult {
    leaders: NBALeaderCategory[];
    boxScore: any;
    loading: boolean;
    error: string | null;
}

export function useNBAGameLeaders(gameId: string): UseNBAGameLeadersResult {
    const [leaders, setLeaders] = useState<NBALeaderCategory[]>([]);
    const [boxScore, setBoxScore] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!gameId) {
            setLoading(false);
            setError('No game ID provided');
            return;
        }

        const fetchLeaders = async () => {
            try {
                const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Failed to fetch game data: ${response.status}`);
                }

                const data = await response.json();

                // Get leaders data
                if (data.leaders) {
                    setLeaders(data.leaders);
                }

                // Get boxscore data
                if (data.boxscore) {
                    setBoxScore(data.boxscore);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching NBA game leaders:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch game leaders');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, [gameId]);

    return { leaders, boxScore, loading, error };
} 